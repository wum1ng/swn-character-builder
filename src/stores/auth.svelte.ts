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
