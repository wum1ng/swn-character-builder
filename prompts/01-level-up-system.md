# Prompt: Implement SWN Level-Up System

Implement a full level-up system for the SWN Character Builder. This transforms the app from a one-time character creator into a persistent character manager used every session. Read CLAUDE.md for project conventions.

## SWN Level-Up Rules to Implement

When a character levels up in Stars Without Number (Revised), the following happens in order:

### 1. XP & Level Threshold
- Characters need **3 XP per level** (level 2 = 3 XP, level 3 = 6 XP, level 4 = 9 XP, etc.)
- The `Character` interface in `src/types/character.ts` already has `level` and `experience` fields
- Max level is 10

### 2. Hit Points
- Roll the character's hit die: **1d6** (Expert, Psychic) or **1d6+2** (Warrior)
- Add **CON modifier** to the roll
- Partial Warrior (Adventurer): **1d6** but gains **+1 HP per level** on top
- Die Hard focus: **+2 HP per level** (retroactive) — already handled in creation at `src/stores/character.svelte.ts:416`
- The new HP are **added** to `hitPointsMax`. Minimum gain of **1 HP** per level
- `hitPointsCurrent` should also increase by the same amount

### 3. Skill Points
- Every character gets **3 skill points** per level to spend
- **Expert** gets **+1 bonus skill point** that MUST be spent on a non-combat, non-psychic skill
- **Partial Expert** (Adventurer) gets the same +1 bonus non-combat skill point
- Skill point cost: raising a skill from rank N to rank N+1 costs **1 point**
- **Max skill rank** = character level (so a level 3 character can have skills up to rank 3, max 4 at level 4+)
- Cannot raise any single skill by more than **1 rank per level-up**
- Psychic skills can be raised with normal skill points, but you must already have the discipline
- Use existing skill data from `src/data/skills.ts` — use `COMBAT_SKILLS`, `NON_COMBAT_SKILLS`, `PSYCHIC_SKILLS` for filtering

### 4. Focus Advancement
- At **every even level** (2, 4, 6, 8, 10), the character may pick a new focus at level 1 OR improve an existing level-1 focus to level 2
- Warrior bonus: may pick a **combat** focus as a bonus at even levels (in addition to normal pick)
- Expert bonus: may pick a **non-combat** focus as a bonus at even levels
- Use existing focus data from `src/data/foci.ts` — `FOCI`, `COMBAT_FOCI`, `NON_COMBAT_FOCI`
- When a new focus is gained at level 1, apply its `bonusSkill` if it has one (see `FocusLevel.bonusSkill` in `src/types/character.ts:65`)

### 5. Attack Bonus
- Update from class tables already defined in `src/data/classes.ts`
- `CLASSES[].attackBonus[]` is indexed by level (0-10)
- `getAttackBonus()` at `src/data/classes.ts:110` already handles Partial Warrior progression

### 6. Saving Throws
- Recalculate: `15 - level - best_of_two_attribute_mods`
- Physical: best of STR mod, CON mod
- Evasion: best of INT mod, DEX mod
- Mental: best of WIS mod, CHA mod
- This logic already exists in `buildCharacter()` at `src/stores/character.svelte.ts:481-485` but is hardcoded to level 1

### 7. Psychic Advancement (if applicable)
- Psychics can spend skill points to raise psychic skills
- Raising a psychic skill unlocks access to higher-level techniques in that discipline
- A psychic may learn **one new technique** per level from any discipline they know, at or below their skill level in that discipline
- Recalculate `effortMax` using logic at `src/stores/character.svelte.ts:492-517`
- Use discipline/technique data from `src/data/psychic.ts`

## Implementation Plan

### Step 1: Extend Types (`src/types/character.ts`)

Add these new types:

```typescript
export interface LevelUpRecord {
  fromLevel: number;
  toLevel: number;
  hpRoll: number;        // raw die roll
  hpGained: number;      // after modifiers, minimum 1
  skillPointsSpent: { skillId: string; fromRank: number; toRank: number }[];
  focusGained?: { focusId: string; level: 1 | 2 };
  techniqueGained?: string; // technique ID for psychics
  timestamp: string;
}
```

Add to the `Character` interface:
```typescript
levelUpHistory: LevelUpRecord[];
```

### Step 2: Add Level-Up Logic to Store (`src/stores/character.svelte.ts`)

Add new state and methods to `CharacterStore`:

```
levelUpState: { ... } // tracks in-progress level-up wizard state
canLevelUp(character): boolean // check XP >= 3 * level
startLevelUp(character): void // initialize level-up wizard
rollLevelUpHP(character): number // roll hit die + modifiers
applySkillPoint(skillId): void // spend a skill point
applyFocus(focusId, level): void // pick/upgrade focus
applyTechnique(techniqueId): void // psychic technique selection
completeLevelUp(): Character // finalize and save
```

Key: the `buildCharacter()` method at line 430 currently hardcodes level-1 values for saving throws and attack bonus. Refactor it to use the character's actual level. Also update `calculateAttackBonus()` at line 519 to use `getAttackBonus(classId, level, partialClasses)` from `src/data/classes.ts:110`.

### Step 3: Create Level-Up Wizard Component

Create `src/lib/components/LevelUpWizard.svelte` with these sub-steps:

1. **Overview** — show current level, XP, what's changing
2. **Roll HP** — roll button, show result with modifiers, show new total
3. **Spend Skill Points** — interactive skill picker, show points remaining, enforce constraints (max rank, combat/non-combat restrictions for Expert bonus point)
4. **Choose Focus** (even levels only) — focus picker reusing patterns from `src/lib/components/steps/FociStep.svelte`
5. **Psychic Technique** (psychics only) — technique picker reusing patterns from `src/lib/components/steps/PsychicStep.svelte`
6. **Summary** — show all changes, confirm button

Match the existing UI style: dark space theme, Tailwind CSS, `card` and `btn` classes from `src/app.css`, `font-display` for headers, cyan/purple accent colors.

### Step 4: Integrate into Character View Page

In `src/routes/character/[id]/+page.svelte`:

- Add a "Level Up" button next to the existing "Play" and "Edit" buttons
- Only show when `character.experience >= character.level * 3`
- Show XP progress bar: `{character.experience} / {character.level * 3} XP`
- Add an XP adjustment control in PlayMode (+ / - buttons) so players can track XP earned during sessions
- When level-up completes, save the character and refresh the view

### Step 5: Add XP Tracking to Play Mode

In `src/lib/components/PlayMode.svelte`:

- Add XP display and +/- controls next to the existing HP/Effort section
- Add local `experience` state like the existing `hp` state (line 20)
- Auto-save XP changes like other play mode fields
- Show a "Level Up Available!" banner when XP threshold is met

### Step 6: Update Derived Stats

After level-up, recalculate all derived values:
- `attackBonus` from `getAttackBonus()` in `src/data/classes.ts`
- `savingThrows` using `15 - newLevel - bestMods`
- `effortMax` using `calculateMaxEffort()` in store (needs to accept a level parameter or read from character)
- `armorClass` for Ironhide focus (AC = 15 + ceil(level/2))

### Migration

Add migration logic in `migrateCharacter()` at `src/stores/character.svelte.ts:128` to add `levelUpHistory: []` to existing saved characters that lack it.

## Constraints

- Use **Svelte 5 runes** ($state, $derived, $effect) — NOT Svelte 4 stores
- Use **TypeScript** with proper typing
- Follow existing patterns: singleton `characterStore`, `save()` to IndexedDB
- Mobile-first responsive design
- No external dependencies beyond what's already in package.json
- Run `npm run build` at the end to verify no type errors
