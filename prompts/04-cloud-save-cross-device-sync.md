# Prompt: Cloud Save & Cross-Device Sync

Implement cloud storage with cross-device synchronization for the SWN Character Builder. This allows users to access their characters from any device and prevents data loss from browser cache clearing. Read CLAUDE.md for project conventions.

## Current State

The existing storage implementation (`src/stores/character.svelte.ts`):
- Uses **idb-keyval** for IndexedDB storage (primary)
- Falls back to **localStorage** for Safari Private Browsing
- Storage keys: `'character-{uuid}'` for each character
- `saveCharacter()`, `loadCharacters()`, `deleteCharacter()` methods
- No authentication, no cloud sync, no cross-device support
- Data is trapped in the browser — clearing cache loses everything

## Architecture Decision: Supabase

Use **Supabase** (open-source Firebase alternative) because:
- Generous free tier (500MB database, 1GB file storage, 50K monthly active users)
- Built-in auth (email magic link, GitHub OAuth, Google OAuth)
- Real-time subscriptions for sync
- PostgreSQL with Row Level Security (RLS)
- Simple JavaScript SDK
- Can self-host if needed later

**Dependencies to add:**
```bash
npm install @supabase/supabase-js
```

## Implementation Plan

### Step 1: Supabase Project Setup (Manual)

Create a Supabase project and configure:

1. **Database schema** — Create `characters` table:
```sql
CREATE TABLE characters (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  data JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  deleted_at TIMESTAMP WITH TIME ZONE NULL  -- soft delete
);

-- Index for user queries
CREATE INDEX idx_characters_user_id ON characters(user_id);

-- Row Level Security
ALTER TABLE characters ENABLE ROW LEVEL SECURITY;

-- Users can only access their own characters
CREATE POLICY "Users can view own characters"
  ON characters FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own characters"
  ON characters FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own characters"
  ON characters FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own characters"
  ON characters FOR DELETE
  USING (auth.uid() = user_id);
```

2. **Auth configuration**:
   - Enable Email (magic link) authentication
   - Enable GitHub OAuth (optional)
   - Configure redirect URLs for your domain

3. **Environment variables** — Add to `.env`:
```
PUBLIC_SUPABASE_URL=https://your-project.supabase.co
PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### Step 2: Create Supabase Client

Create `src/lib/supabase.ts`:

```typescript
import { createClient } from '@supabase/supabase-js';
import { browser } from '$app/environment';

const supabaseUrl = import.meta.env.PUBLIC_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.PUBLIC_SUPABASE_ANON_KEY;

export const supabase = browser && supabaseUrl && supabaseAnonKey
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true
      }
    })
  : null;

export function isCloudEnabled(): boolean {
  return supabase !== null;
}
```

### Step 3: Create Auth Store

Create `src/stores/auth.svelte.ts`:

```typescript
import { supabase, isCloudEnabled } from '$lib/supabase';
import type { User, Session } from '@supabase/supabase-js';

class AuthStore {
  user = $state<User | null>(null);
  session = $state<Session | null>(null);
  loading = $state(true);
  error = $state<string | null>(null);

  readonly isAuthenticated = $derived(this.user !== null);
  readonly isCloudAvailable = $derived(isCloudEnabled());

  constructor() {
    if (!supabase) {
      this.loading = false;
      return;
    }

    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      this.session = session;
      this.user = session?.user ?? null;
      this.loading = false;
    });

    // Listen for auth changes
    supabase.auth.onAuthStateChange((_event, session) => {
      this.session = session;
      this.user = session?.user ?? null;
    });
  }

  async signInWithEmail(email: string): Promise<{ error: string | null }> {
    if (!supabase) return { error: 'Cloud sync not configured' };

    this.error = null;
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`
      }
    });

    if (error) {
      this.error = error.message;
      return { error: error.message };
    }

    return { error: null };
  }

  async signInWithGitHub(): Promise<{ error: string | null }> {
    if (!supabase) return { error: 'Cloud sync not configured' };

    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'github',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`
      }
    });

    if (error) {
      this.error = error.message;
      return { error: error.message };
    }

    return { error: null };
  }

  async signOut(): Promise<void> {
    if (!supabase) return;
    await supabase.auth.signOut();
    this.user = null;
    this.session = null;
  }
}

export const authStore = new AuthStore();
```

### Step 4: Create Cloud Storage Service

Create `src/lib/cloudStorage.ts`:

```typescript
import { supabase } from '$lib/supabase';
import type { Character } from '$types/character';

export interface CloudCharacter {
  id: string;
  user_id: string;
  data: Character;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export async function fetchCloudCharacters(): Promise<Character[]> {
  if (!supabase) return [];

  const { data, error } = await supabase
    .from('characters')
    .select('*')
    .is('deleted_at', null)
    .order('updated_at', { ascending: false });

  if (error) {
    console.error('Failed to fetch cloud characters:', error);
    return [];
  }

  return (data as CloudCharacter[]).map(row => row.data);
}

export async function saveCloudCharacter(character: Character): Promise<boolean> {
  if (!supabase) return false;

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return false;

  const { error } = await supabase
    .from('characters')
    .upsert({
      id: character.id,
      user_id: user.id,
      data: character,
      updated_at: new Date().toISOString()
    }, {
      onConflict: 'id'
    });

  if (error) {
    console.error('Failed to save cloud character:', error);
    return false;
  }

  return true;
}

export async function deleteCloudCharacter(characterId: string): Promise<boolean> {
  if (!supabase) return false;

  // Soft delete
  const { error } = await supabase
    .from('characters')
    .update({ deleted_at: new Date().toISOString() })
    .eq('id', characterId);

  if (error) {
    console.error('Failed to delete cloud character:', error);
    return false;
  }

  return true;
}

export async function hardDeleteCloudCharacter(characterId: string): Promise<boolean> {
  if (!supabase) return false;

  const { error } = await supabase
    .from('characters')
    .delete()
    .eq('id', characterId);

  if (error) {
    console.error('Failed to hard delete cloud character:', error);
    return false;
  }

  return true;
}
```

### Step 5: Implement Sync Logic

Create `src/lib/syncService.ts`:

```typescript
import { get } from 'svelte/store';
import { authStore } from '$stores/auth.svelte';
import { characterStore } from '$stores/character.svelte';
import { fetchCloudCharacters, saveCloudCharacter, deleteCloudCharacter } from '$lib/cloudStorage';
import type { Character } from '$types/character';

export type SyncStatus = 'idle' | 'syncing' | 'success' | 'error' | 'offline';

class SyncService {
  status = $state<SyncStatus>('idle');
  lastSyncedAt = $state<string | null>(null);
  error = $state<string | null>(null);
  pendingChanges = $state<number>(0);

  /**
   * Full two-way sync between local and cloud
   */
  async sync(): Promise<void> {
    if (!authStore.isAuthenticated) {
      this.status = 'idle';
      return;
    }

    this.status = 'syncing';
    this.error = null;

    try {
      // 1. Fetch cloud characters
      const cloudCharacters = await fetchCloudCharacters();
      const cloudMap = new Map(cloudCharacters.map(c => [c.id, c]));

      // 2. Get local characters
      await characterStore.loadCharacters();
      const localCharacters = characterStore.savedCharacters;
      const localMap = new Map(localCharacters.map(c => [c.id, c]));

      // 3. Merge with "last write wins" strategy
      const merged: Character[] = [];
      const allIds = new Set([...cloudMap.keys(), ...localMap.keys()]);

      for (const id of allIds) {
        const cloud = cloudMap.get(id);
        const local = localMap.get(id);

        if (cloud && local) {
          // Both exist - use most recent
          const cloudTime = new Date(cloud.updatedAt).getTime();
          const localTime = new Date(local.updatedAt).getTime();
          merged.push(cloudTime > localTime ? cloud : local);
        } else if (cloud) {
          // Only in cloud - download
          merged.push(cloud);
        } else if (local) {
          // Only local - upload
          merged.push(local);
        }
      }

      // 4. Save merged set to local storage
      for (const character of merged) {
        await characterStore.saveCharacter(character);
      }

      // 5. Upload local-only characters to cloud
      for (const character of merged) {
        if (!cloudMap.has(character.id)) {
          await saveCloudCharacter(character);
        }
      }

      // 6. Update cloud for characters where local is newer
      for (const character of merged) {
        const cloud = cloudMap.get(character.id);
        const local = localMap.get(character.id);
        if (cloud && local) {
          const cloudTime = new Date(cloud.updatedAt).getTime();
          const localTime = new Date(local.updatedAt).getTime();
          if (localTime > cloudTime) {
            await saveCloudCharacter(local);
          }
        }
      }

      this.status = 'success';
      this.lastSyncedAt = new Date().toISOString();
      this.pendingChanges = 0;

      // Reload to reflect merged state
      await characterStore.loadCharacters();

    } catch (e) {
      this.status = 'error';
      this.error = e instanceof Error ? e.message : 'Sync failed';
      console.error('Sync failed:', e);
    }
  }

  /**
   * Push a single character to cloud (called after local save)
   */
  async pushCharacter(character: Character): Promise<void> {
    if (!authStore.isAuthenticated) {
      this.pendingChanges++;
      return;
    }

    const success = await saveCloudCharacter(character);
    if (!success) {
      this.pendingChanges++;
    }
  }

  /**
   * Delete from cloud (called after local delete)
   */
  async deleteFromCloud(characterId: string): Promise<void> {
    if (!authStore.isAuthenticated) return;
    await deleteCloudCharacter(characterId);
  }
}

export const syncService = new SyncService();
```

### Step 6: Update Character Store

Modify `src/stores/character.svelte.ts` to integrate with sync:

```typescript
// Add import at top
import { syncService } from '$lib/syncService';
import { authStore } from '$stores/auth.svelte';

// Modify saveCharacter method
async saveCharacter(character: Character): Promise<void> {
  try {
    // ... existing local save logic ...
    await set(`character-${character.id}`, character);

    // Push to cloud if authenticated
    if (authStore.isAuthenticated) {
      await syncService.pushCharacter(character);
    }
  } catch (e) {
    // ... error handling ...
  }
}

// Modify deleteCharacter method
async deleteCharacter(id: string): Promise<void> {
  try {
    // ... existing local delete logic ...
    await del(`character-${id}`);

    // Delete from cloud if authenticated
    if (authStore.isAuthenticated) {
      await syncService.deleteFromCloud(id);
    }
  } catch (e) {
    // ... error handling ...
  }
}

// Add sync trigger on load (if authenticated)
async loadCharacters(): Promise<void> {
  // ... existing load logic ...

  // Trigger sync if authenticated and online
  if (authStore.isAuthenticated && navigator.onLine) {
    syncService.sync();
  }
}
```

### Step 7: Create Auth UI Components

#### `src/lib/components/AuthModal.svelte`

Login/signup modal with email magic link and GitHub OAuth:

```svelte
<script lang="ts">
  import { authStore } from '$stores/auth.svelte';

  interface Props {
    isOpen: boolean;
    onClose: () => void;
  }

  let { isOpen, onClose }: Props = $props();

  let email = $state('');
  let emailSent = $state(false);
  let loading = $state(false);

  async function handleEmailLogin() {
    loading = true;
    const { error } = await authStore.signInWithEmail(email);
    loading = false;
    if (!error) {
      emailSent = true;
    }
  }

  async function handleGitHubLogin() {
    await authStore.signInWithGitHub();
  }
</script>

{#if isOpen}
  <div class="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
    <div class="card p-6 max-w-md w-full">
      <h3 class="font-display text-xl tracking-wider text-cyan-400 mb-4">
        Sign In for Cloud Sync
      </h3>

      {#if emailSent}
        <div class="text-center py-6">
          <div class="text-green-400 mb-2">Check your email!</div>
          <p class="text-slate-400 text-sm">
            We sent a magic link to <strong class="text-white">{email}</strong>.
            Click it to sign in.
          </p>
        </div>
      {:else}
        <p class="text-slate-400 text-sm mb-6">
          Sign in to sync your characters across devices and prevent data loss.
        </p>

        <!-- Email magic link -->
        <div class="space-y-3 mb-6">
          <input
            type="email"
            bind:value={email}
            placeholder="your@email.com"
            class="input"
          />
          <button
            onclick={handleEmailLogin}
            disabled={loading || !email}
            class="btn btn-primary w-full"
          >
            {loading ? 'Sending...' : 'Send Magic Link'}
          </button>
        </div>

        <div class="relative my-6">
          <div class="absolute inset-0 flex items-center">
            <div class="w-full border-t border-slate-700"></div>
          </div>
          <div class="relative flex justify-center text-xs">
            <span class="px-2 bg-slate-900 text-slate-500">or</span>
          </div>
        </div>

        <!-- GitHub OAuth -->
        <button
          onclick={handleGitHubLogin}
          class="btn btn-secondary w-full"
        >
          <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
          </svg>
          Continue with GitHub
        </button>

        {#if authStore.error}
          <p class="text-red-400 text-sm mt-4">{authStore.error}</p>
        {/if}
      {/if}

      <button onclick={onClose} class="btn btn-ghost w-full mt-4">
        {emailSent ? 'Close' : 'Cancel'}
      </button>
    </div>
  </div>
{/if}
```

#### `src/lib/components/SyncStatus.svelte`

Small status indicator for the header:

```svelte
<script lang="ts">
  import { authStore } from '$stores/auth.svelte';
  import { syncService } from '$lib/syncService';

  interface Props {
    onSignInClick: () => void;
  }

  let { onSignInClick }: Props = $props();
</script>

{#if authStore.loading}
  <div class="text-slate-500 text-sm">...</div>
{:else if authStore.isAuthenticated}
  <div class="flex items-center gap-2">
    {#if syncService.status === 'syncing'}
      <div class="w-2 h-2 rounded-full bg-yellow-400 animate-pulse"></div>
      <span class="text-xs text-slate-400">Syncing...</span>
    {:else if syncService.status === 'success'}
      <div class="w-2 h-2 rounded-full bg-green-400"></div>
      <span class="text-xs text-slate-400">Synced</span>
    {:else if syncService.status === 'error'}
      <div class="w-2 h-2 rounded-full bg-red-400"></div>
      <span class="text-xs text-red-400">Sync error</span>
    {:else}
      <div class="w-2 h-2 rounded-full bg-slate-400"></div>
    {/if}

    <button
      onclick={() => authStore.signOut()}
      class="text-xs text-slate-500 hover:text-slate-300"
    >
      Sign out
    </button>
  </div>
{:else if authStore.isCloudAvailable}
  <button
    onclick={onSignInClick}
    class="text-xs text-cyan-400 hover:text-cyan-300"
  >
    Sign in to sync
  </button>
{:else}
  <span class="text-xs text-slate-600">Local only</span>
{/if}
```

### Step 8: Add Auth Callback Route

Create `src/routes/auth/callback/+page.svelte`:

```svelte
<script lang="ts">
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { base } from '$app/paths';
  import { supabase } from '$lib/supabase';

  let error = $state<string | null>(null);

  onMount(async () => {
    if (!supabase) {
      error = 'Cloud sync not configured';
      return;
    }

    // Handle the OAuth/magic link callback
    const { error: authError } = await supabase.auth.getSession();

    if (authError) {
      error = authError.message;
    } else {
      // Redirect to home after successful auth
      goto(`${base}/`);
    }
  });
</script>

<div class="min-h-screen flex items-center justify-center">
  {#if error}
    <div class="card p-6 text-center">
      <div class="text-red-400 mb-4">{error}</div>
      <a href="{base}/" class="btn btn-primary">Back to Home</a>
    </div>
  {:else}
    <div class="text-slate-400">Signing in...</div>
  {/if}
</div>
```

### Step 9: Integrate into Layout

Modify `src/routes/+layout.svelte` to include auth state and sync status in header:

```svelte
<script lang="ts">
  import { authStore } from '$stores/auth.svelte';
  import SyncStatus from '$lib/components/SyncStatus.svelte';
  import AuthModal from '$lib/components/AuthModal.svelte';

  let showAuthModal = $state(false);
</script>

<!-- In header section -->
<div class="flex items-center gap-4">
  <SyncStatus onSignInClick={() => showAuthModal = true} />
  <!-- existing nav items -->
</div>

<!-- At end of layout -->
<AuthModal
  isOpen={showAuthModal}
  onClose={() => showAuthModal = false}
/>
```

### Step 10: Offline Support with Service Worker

Create `src/service-worker.ts` for PWA offline support:

```typescript
/// <reference lib="webworker" />
import { build, files, version } from '$service-worker';

const CACHE_NAME = `swn-cache-${version}`;
const ASSETS = [...build, ...files];

self.addEventListener('install', (event: ExtendableEvent) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS))
  );
});

self.addEventListener('activate', (event: ExtendableEvent) => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  );
});

self.addEventListener('fetch', (event: FetchEvent) => {
  if (event.request.method !== 'GET') return;

  event.respondWith(
    caches.match(event.request).then(cached => {
      return cached || fetch(event.request).then(response => {
        // Cache successful responses
        if (response.status === 200) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
        }
        return response;
      });
    })
  );
});
```

Add PWA manifest in `static/manifest.json`:

```json
{
  "name": "SWN Character Builder",
  "short_name": "SWN Builder",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#070b14",
  "theme_color": "#38bdf8",
  "icons": [
    { "src": "/icon-192.png", "sizes": "192x192", "type": "image/png" },
    { "src": "/icon-512.png", "sizes": "512x512", "type": "image/png" }
  ]
}
```

### Step 11: Environment Configuration

Update `vite.config.ts` to expose environment variables:

```typescript
import { defineConfig } from 'vite';
import { sveltekit } from '@sveltejs/kit/vite';

export default defineConfig({
  plugins: [sveltekit()],
  define: {
    'import.meta.env.PUBLIC_SUPABASE_URL': JSON.stringify(process.env.PUBLIC_SUPABASE_URL),
    'import.meta.env.PUBLIC_SUPABASE_ANON_KEY': JSON.stringify(process.env.PUBLIC_SUPABASE_ANON_KEY)
  }
});
```

### Step 12: Graceful Fallback

The app should work perfectly without cloud:
- If Supabase env vars are missing, cloud features are disabled
- All local storage functionality continues to work
- UI shows "Local only" instead of sync status
- No errors thrown for missing cloud config

This is handled by `isCloudEnabled()` checks throughout the code.

## Sync Behavior Summary

| Scenario | Behavior |
|----------|----------|
| Not signed in | Local-only storage, "Sign in to sync" shown |
| Signed in, online | Auto-sync on app load, push changes immediately |
| Signed in, offline | Local changes queued, sync when back online |
| Conflict (both changed) | Last-write-wins based on `updatedAt` timestamp |
| New device sign-in | Full sync downloads all cloud characters |
| Delete character | Soft delete in cloud, can recover within 30 days |

## Share Character Feature (Bonus)

Add ability to generate a shareable read-only link:

1. Create `shared_characters` table with public access
2. Generate short UUID for share link
3. Create `/shared/[id]` route that loads character without auth
4. Add "Share" button to character view

## Constraints

- Use **Svelte 5 runes** ($state, $derived, $effect)
- Use **TypeScript** with proper typing
- Only add `@supabase/supabase-js` as new dependency
- App must work fully offline (local-first)
- Cloud features gracefully disabled if not configured
- No sensitive data in client-side code (use env vars)
- Run `npm run build` at the end to verify no type errors

## Testing

Before marking complete, verify:
1. App works with cloud disabled (no env vars)
2. Magic link email auth flow works
3. Characters sync between two browsers/devices
4. Offline changes sync when back online
5. Conflicts resolve correctly (last-write-wins)
6. Sign out clears session but keeps local data
7. PWA installs and works offline
