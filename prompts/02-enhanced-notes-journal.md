# Prompt: Implement Enhanced Notes & Session Journal

Implement a rich notes and session journal system for the SWN Character Builder. This replaces the current single-textarea notes field with a structured system for session logs, NPC tracking, quest tracking, and general notes. Read CLAUDE.md for project conventions.

## Current State

The existing notes implementation is minimal:
- `Character.notes` is a single `string` field (`src/types/character.ts:149`)
- `Character.goals` is a single `string` field (`src/types/character.ts:148`)
- PlayMode has a basic `<textarea>` for notes at `src/lib/components/PlayMode.svelte:497-506`
- Notes are saved via the `save()` function which calls `characterStore.saveCharacter()` — keep this pattern

## Implementation Plan

### Step 1: Extend Types (`src/types/character.ts`)

Add these new types:

```typescript
export interface SessionLogEntry {
  id: string;          // crypto.randomUUID()
  sessionNumber: number;
  date: string;        // ISO date string
  title: string;       // short summary, e.g. "Raid on Station Gamma"
  content: string;     // markdown-supported body text
  xpGained?: number;   // ties into level-up feature if present
  creditsGained?: number;
  lootGained?: string[];  // free-text list of notable items acquired
  createdAt: string;
  updatedAt: string;
}

export interface NPCEntry {
  id: string;
  name: string;
  faction?: string;     // e.g. "Brightside Cartel", "Sector Navy"
  location?: string;    // where they were met
  disposition: 'friendly' | 'neutral' | 'hostile' | 'unknown';
  description: string;  // appearance, role, personality
  notes: string;        // private notes about this NPC
  createdAt: string;
  updatedAt: string;
}

export interface QuestEntry {
  id: string;
  title: string;
  description: string;
  status: 'active' | 'completed' | 'failed' | 'abandoned';
  giverNpcId?: string;  // links to NPCEntry.id
  reward?: string;      // free text: "500 credits", "access to armory", etc.
  notes: string;
  createdAt: string;
  updatedAt: string;
}

export interface CharacterJournal {
  sessionLog: SessionLogEntry[];
  npcs: NPCEntry[];
  quests: QuestEntry[];
  generalNotes: string;  // migrated from old Character.notes
}
```

Add to the `Character` interface:
```typescript
journal: CharacterJournal;
```

Keep the existing `notes` and `goals` fields for backward compatibility. The migration will copy `notes` into `journal.generalNotes`.

### Step 2: Migration (`src/stores/character.svelte.ts`)

Update `migrateCharacter()` at line 128 to handle characters without a `journal` field:

```typescript
if (!char.journal) {
  char.journal = {
    sessionLog: [],
    npcs: [],
    quests: [],
    generalNotes: char.notes || ''
  };
}
```

### Step 3: Create Journal UI Components

Create the following components in `src/lib/components/journal/`:

#### `JournalTabs.svelte`
- Tab bar with 4 tabs: **Session Log**, **NPCs**, **Quests**, **Notes**
- Match existing dark theme styling from PlayMode
- Active tab indicator using cyan accent color
- Tab state managed with `$state`

#### `SessionLog.svelte`
- List of session entries, newest first
- Each entry shows: session number, date, title, truncated content preview
- Expand/collapse for full content
- "New Session" button that creates an entry with auto-incremented session number and today's date
- Edit mode: inline editing of title, content, xpGained, creditsGained, lootGained
- Delete with confirmation
- Content field should support multi-line text (use `<textarea>` with auto-resize)

#### `NPCTracker.svelte`
- Grid or list of NPC cards
- Each card shows: name, faction badge, disposition indicator (color-coded dot: green/yellow/red/gray), location
- "Add NPC" button opens inline form
- Click to expand: full description and notes
- Edit/delete inline
- Filter by disposition dropdown
- Sort alphabetically or by most recent
- Disposition badges:
  - friendly: `text-green-400 bg-green-400/10`
  - neutral: `text-yellow-400 bg-yellow-400/10`
  - hostile: `text-red-400 bg-red-400/10`
  - unknown: `text-slate-400 bg-slate-400/10`

#### `QuestTracker.svelte`
- List of quests grouped by status: Active first, then Completed/Failed/Abandoned
- Each quest shows: title, status badge, giver NPC name (if linked), reward
- "Add Quest" button
- Status toggle buttons to move between states
- Expand for full description and notes
- Link to NPC from the NPCs list (optional `giverNpcId` dropdown)
- Status badges:
  - active: `text-cyan-400 bg-cyan-400/10`
  - completed: `text-green-400 bg-green-400/10`
  - failed: `text-red-400 bg-red-400/10`
  - abandoned: `text-slate-400 bg-slate-400/10`

#### `GeneralNotes.svelte`
- Large textarea for free-form notes (replacing the current simple textarea)
- Auto-save on blur (matching PlayMode pattern)
- Character/word count indicator

### Step 4: Integrate Journal into Play Mode (`src/lib/components/PlayMode.svelte`)

Replace the current notes section (lines 497-506) with the full `JournalTabs` component:

```svelte
<!-- Replace the current simple notes section -->
<JournalTabs journal={journal} onUpdate={handleJournalUpdate} />
```

Add journal state management:
```typescript
let journal = $state<CharacterJournal>(
  character.journal || { sessionLog: [], npcs: [], quests: [], generalNotes: character.notes || '' }
);
```

Update the `save()` function (line 78) to persist journal:
```typescript
character.journal = JSON.parse(JSON.stringify(journal));
```

Each sub-component should call a save callback when data changes, following the auto-save pattern already used by PlayMode (immediate save on meaningful changes, debounced save on text input).

### Step 5: Add Journal to Character View Page

In `src/routes/character/[id]/+page.svelte` (view mode, not just play mode):

- Add a "Journal" section below the existing character stats
- Show a read-only summary: session count, NPC count, active quest count
- Show the most recent session log entry as a preview
- Show active quests as a quick list
- These are view-only in the character view — editing happens in Play Mode

### Step 6: Quick-Add from Play Mode Header

Add a quick-add floating action button or action bar in PlayMode that lets players quickly:
- Log a new session entry (pre-filled with today's date and next session number)
- Add an NPC they just met (name + disposition, can fill details later)
- Add a new quest

This should be a collapsible "+" menu at the top or bottom of PlayMode, not buried in tabs.

### Step 7: Export Integration

Update the clipboard copy functionality to include journal data. When a character is exported to clipboard (already exists in the character view page), append:

```
--- SESSION LOG ---
Session 1 (2024-01-15): Raid on Station Gamma
  XP: +2, Credits: +500
  ...

--- NPCs ---
- Captain Voss (Sector Navy) - Friendly
  ...

--- ACTIVE QUESTS ---
- [Active] Recover the Lost Beacon
  ...
```

Update JSON export to include the full journal data (this should happen automatically since it exports the full Character object).

## UI/UX Guidelines

- **Auto-save everything** — no explicit save buttons. Follow the PlayMode pattern of saving on blur/change
- **Mobile-first** — all components must work well on narrow screens. Use stacked layouts, not side-by-side
- **Collapsible sections** — long lists should be scrollable with expand/collapse
- **Empty states** — show helpful text when lists are empty ("No sessions logged yet. Start your first session log!")
- **Consistent styling** — use the existing Tailwind classes and dark space theme:
  - Cards: `card` class (defined in `src/app.css`)
  - Buttons: `btn` class
  - Inputs: `input` class
  - Headers: `font-display text-xs tracking-wider text-cyan-400`
  - Section headings match PlayMode pattern (e.g., line 263: `<h4 class="font-display text-xs tracking-wider text-cyan-400 mb-2">`)

## Constraints

- Use **Svelte 5 runes** ($state, $derived, $effect) — NOT Svelte 4 stores
- Use **TypeScript** with proper typing throughout
- Follow existing patterns: auto-save via `characterStore.saveCharacter()`
- No external markdown parsing libraries — just use `<textarea>` with `whitespace-pre-wrap` styling for now
- No external dependencies beyond what's already in package.json
- All data persists in the same IndexedDB character record (no separate storage)
- Run `npm run build` at the end to verify no type errors
