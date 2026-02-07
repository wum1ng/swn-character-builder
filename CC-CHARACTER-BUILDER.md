# Castles & Crusades Character Builder — Reference & Blueprint

This file distills the architecture, UX patterns, and lessons learned from the SWN Character Builder, combined with comprehensive C&C rules, into a single reference for building a new C&C character creation app.

---

## Part 1: Lessons from the SWN Character Builder

### What Worked Well (Keep These)

**1. Step-by-step wizard with validation-gated navigation**
The wizard forces completion before advancing. Each step has a `validateCurrentStep()` function — the "Next" button stays disabled until validation passes. Users can go back and revise, but can't skip ahead with incomplete data. This prevents broken character states.

```
Steps: Attributes → Race → Class → Primes → Alignment → HP → Equipment → Spells → Details → Summary
```

**2. Click-to-read inline info panels**
Every class, skill, focus, and ability has an expandable detail panel. Users click a selection and the full description expands inline — no modals, no separate pages. This is done with a simple `expandedId` state variable and a toggle function. Critical for a rules-heavy game where users need to read before choosing.

**3. All-in-one character runner**
The character view page isn't just a sheet — it's a play tool. Current HP tracking, inventory management (readied/stowed/stored), and a full journal system (session logs, NPC tracker, quest tracker, general notes). This makes the app useful at the table, not just during creation.

**4. Singleton reactive store (Svelte 5 class with $state)**
One `CharacterStore` class holds all state. No prop drilling, no context juggling. Components import the store and read/write directly. Svelte 5 runes (`$state`, `$derived`, `$effect`) make this reactive without boilerplate.

```typescript
class CharacterStore {
  draft = $state<CharacterDraft>(initialDraft);
  savedCharacters = $state<Character[]>([]);
  // Components just import and use: characterStore.draft.classId
}
export const characterStore = new CharacterStore();
```

**5. Immutable game data, mutable character state**
All game rules (classes, races, equipment, spells) live in `/src/data/*.ts` as readonly constants. Character state is the only mutable thing. This separation is clean and prevents bugs where game data gets accidentally modified.

**6. Step snapshots for reset**
Each step saves a JSON snapshot of the draft when first entered. A "Reset" button restores the snapshot. Users can experiment freely without fear of losing work on other steps.

**7. Persistence with fallback**
IndexedDB via `idb-keyval` as primary, localStorage as fallback for Safari Private Browsing. Simple async helpers (`storageSet`, `storageGet`, `storageDel`) wrap both.

**8. Export/import JSON + clipboard copy**
Characters can be exported as `.json` files, imported back (with new UUID to prevent conflicts), and copied to clipboard as formatted text. Essential for sharing and backup.

### What to Fix / Do Better

**1. Background skill tables had rule interpretation bugs**
The growth/learning table implementation didn't perfectly match SWN rules. Lesson: implement game rules from the book step-by-step, with explicit test cases for edge cases. Write the rule as a comment before writing the code.

**2. Psychic step conditional skip was fragile**
Auto-skipping the psychic step for non-psychics used index manipulation that was error-prone. Better approach: define step lists per-class or use a `shouldShow(draft)` predicate on each step definition.

```typescript
const steps: StepDef[] = [
  { id: 'attributes', component: AttributesStep, shouldShow: () => true },
  { id: 'spells', component: SpellsStep, shouldShow: (d) => d.classId && isSpellcaster(d.classId) },
];
```

**3. Type system could have been stricter**
`Partial<Attributes>` meant attributes could be undefined during creation — lots of null checks. Better: use a separate `DraftAttributes` type that's explicitly partial during creation, then validate into a complete `Attributes` before building the final character.

**4. Draft → Character conversion was a big function**
`buildCharacter()` was a monolith that calculated all derived stats. Better: break into `calculateSavingThrows()`, `calculateAC()`, `calculateHP()`, etc. — small pure functions that are testable.

**5. No automated tests**
The SWN builder had zero tests. For C&C, write at least:
- Unit tests for all game math (modifiers, saves, attack bonuses, HP)
- Unit tests for step validation logic
- A smoke test for the full creation flow

**6. Mobile layout had some rough edges**
The collapsible summary worked but felt bolted-on. Design mobile-first from the start — the summary should be a bottom sheet or accordion, not a hidden sidebar.

### Architecture to Replicate

```
src/
├── app.css                    # Tailwind + custom theme + print styles
├── data/                      # Immutable game data (C&C rules)
│   ├── attributes.ts          # 6 attributes, modifier table, rolling
│   ├── races.ts               # 7 races, abilities, modifiers, vision
│   ├── classes.ts             # 13 classes, abilities, HD, BtH, restrictions
│   ├── equipment.ts           # Weapons, armor, gear, starting gold
│   ├── spells.ts              # Spell lists by class and level
│   └── alignments.ts          # 9 alignments + class restrictions
├── lib/components/
│   ├── steps/                 # One component per wizard step
│   ├── CharacterSheet.svelte  # Play-mode character display
│   ├── InventoryManager.svelte
│   ├── LevelUpWizard.svelte
│   └── journal/               # Session log, NPC, quest, notes
├── routes/
│   ├── +page.svelte           # Home (character list)
│   ├── create/+page.svelte    # Creation wizard
│   └── character/[id]/        # View/play/level-up
├── stores/
│   └── character.svelte.ts    # Singleton store with $state runes
├── types/
│   └── character.ts           # All TypeScript interfaces
└── utils/
    ├── dice.ts                # Dice rolling helpers
    ├── math.ts                # Modifier calculations, save formulas
    └── storage.ts             # IndexedDB + localStorage helpers
```

### Tech Stack (Same as SWN)
- **SvelteKit 5** with Svelte 5 runes
- **TypeScript** (strict mode)
- **Tailwind CSS v3.4** (fantasy/medieval theme instead of sci-fi)
- **Vite 6**
- **idb-keyval** for persistence
- **vitest** for unit tests (new addition)

---

## Part 2: C&C Character Creation Rules

### Creation Steps (Wizard Flow)

```
1. Attributes     — Roll 3d6×6, assign to scores
2. Race           — Pick from 7 races, apply modifiers
3. Class          — Pick from 13 classes (filtered by race if desired)
4. Primes         — Choose prime attributes (SIEGE Engine)
5. Alignment      — Pick alignment (filtered by class restrictions)
6. Hit Points     — Roll HD + CON mod (min 1)
7. Equipment      — Roll starting gold, buy gear
8. Spells         — Pick spells (spellcasters only) ← conditional step
9. Details        — Name, background, appearance, personality
10. Summary       — Review all choices, save
```

### Step 1: Attributes

Six ability scores: **Strength, Dexterity, Constitution, Intelligence, Wisdom, Charisma**

**Generation:** Roll 3d6 six times, assign to abilities as desired.

**Modifier Table:**

| Score | Mod  |
|-------|------|
| 1     | -4   |
| 2-3   | -3   |
| 4-5   | -2   |
| 6-8   | -1   |
| 9-12  | 0    |
| 13-15 | +1   |
| 16-17 | +2   |
| 18-19 | +3   |

```typescript
// data/attributes.ts
export const ATTRIBUTES = ['strength', 'dexterity', 'constitution', 'intelligence', 'wisdom', 'charisma'] as const;

export function getModifier(score: number): number {
  if (score <= 1) return -4;
  if (score <= 3) return -3;
  if (score <= 5) return -2;
  if (score <= 8) return -1;
  if (score <= 12) return 0;
  if (score <= 15) return 1;
  if (score <= 17) return 2;
  return 3; // 18-19
}
```

**UI:** Show a card per attribute with the rolled value, a modifier badge, and drag-to-rearrange or dropdown-assign. Offer optional house rules (4d6 drop lowest, point buy) as toggles.

### Step 2: Race

Seven races. Key mechanical differences: attribute modifiers, number of primes, vision type, special abilities.

| Race | Size | Move | Stat Mods | Primes | Vision |
|------|------|------|-----------|--------|--------|
| Human | M | 30 | None | 3 | Normal |
| Dwarf | S | 20 | +1 CON, -1 DEX | 2 | Deepvision 120ft |
| Elf | M | 30 | +1 DEX, -1 CON | 2 | Twilight Vision |
| Gnome | S | 20 | +1 INT, -1 STR | 2 | Darkvision 60ft |
| Halfling | S | 20 | +1 DEX, -1 STR | 2 | Duskvision |
| Half-Elf | M | 30 | Varies by lineage | 2 | Twilight Vision |
| Half-Orc | M | 30 | +1 STR, +1 CON, -2 CHA | 2 | Darkvision 60ft |

**Half-Elf Lineage choice** (sub-selection in UI):
- *Human Lineage:* No stat mods, +2 on checks for one chosen secondary attribute, +2 save vs charm/sleep
- *Elf Lineage:* +1 DEX/-1 CON, enhanced senses (+2 Listen), +4 save vs charm/sleep

**Racial Abilities** (each race has 3-6 — display as expandable list):

```typescript
// data/races.ts
export interface Race {
  id: string;
  name: string;
  size: 'small' | 'medium';
  speed: number; // feet per round
  attributeModifiers: Partial<Record<AttributeKey, number>>;
  numPlayerPrimes: number; // 2 for demi-humans, 1 for humans (who get 2 chosen + 1 class)
  vision: { type: string; range?: number; description: string };
  abilities: RacialAbility[];
  typicalClasses: string[]; // suggested, not enforced
  languages: string[];
  hasLineageChoice?: boolean; // half-elf
  lineages?: HalfElfLineage[];
}
```

**Dwarf abilities:** Deepvision, Determine Depth/Direction, Stonecraft, Resist Arcane Magic/Fear/Poison, Defensive Expertise (giants/ogres), Enmity (+1 hit vs goblins/orcs)

**Elf abilities:** Twilight Vision, Enhanced Senses (+2 Listen), Move Silently (outdoors), Spot Hidden Doors, Weapon Training (+1 hit with chosen elf weapon), Spell Resistance (+10 vs charm/sleep)

**Gnome abilities:** Darkvision, Enhanced Senses (+2 Listen), Keen Eye (+2 INT for gems/devices), Illusion Affinity (+2 to use/disbelieve illusions), Stonecunning, Resist Poison, Speak with Burrowing Mammals

**Halfling abilities:** Duskvision, Move Silently (outdoors), Hide (outdoors), Resistant Constitution (save bonuses)

**Half-Orc abilities:** Darkvision, Enhanced Smell, Martial Prowess, Resist Disease

**UI:** Card per race with a portrait/icon, key stats visible, expandable ability list with full descriptions. Highlight humans' extra prime advantage.

### Step 3: Class

Thirteen classes. Each has: prime attribute, hit die, BtH progression, armor/weapon restrictions, alignment restrictions, and class abilities.

| Class | Prime | HD | BtH/lvl | Armor | Align Restrict |
|-------|-------|-----|---------|-------|----------------|
| Fighter | STR | d10 | +1/lvl | Any | None |
| Ranger | STR | d10 | +1/lvl | Any | Any Good |
| Barbarian | CON | d12 | +1/lvl | Any | Non-Lawful |
| Knight | CHA | d10 | +1/lvl | Any | Code of Conduct |
| Paladin | CHA | d10 | +1/lvl | Any | LG only |
| Monk | CON | d12 | +1/lvl | None | Any Lawful |
| Cleric | WIS | d8 | ~+1/2lvl | Any | None |
| Druid | WIS | d8 | ~+1/2lvl | Limited | Must have Neutral |
| Bard | CHA | d10 | ~+1/2lvl | Limited | None |
| Rogue | DEX | d6 | ~+1/2-3lvl | Leather | None |
| Assassin | DEX | d6 | ~+1/2-3lvl | Leather | Non-Good |
| Wizard | INT | d4 | ~+1/3lvl | None | None |
| Illusionist | INT | d4 | ~+1/3lvl | None | None |

```typescript
// data/classes.ts
export interface CharacterClass {
  id: string;
  name: string;
  prime: AttributeKey;
  hitDie: number;          // 4, 6, 8, 10, or 12
  bthProgression: number[];  // BtH by level (index 0 = level 1)
  hpAfter10: number;       // fixed HP per level after 10
  armorAllowed: string[];   // or 'any' | 'none'
  shieldsAllowed: string[];
  weaponsAllowed: string[] | 'any';
  alignmentRestriction?: string; // e.g., 'any-good', 'lawful-only', 'non-good', 'neutral-axis'
  abilities: ClassAbility[];
  isSpellcaster: boolean;
  spellList?: string;       // 'wizard', 'cleric', 'druid', 'illusionist'
  spellsPerDay?: number[][]; // [level][spell-level] = slots
  description: string;
  flavorText: string;
}

export interface ClassAbility {
  name: string;
  level: number;         // level gained
  description: string;
  attribute?: AttributeKey; // for SIEGE checks
  details?: string;      // extended rules text (click-to-read)
}
```

**Key class abilities to display inline (click-to-read pattern):**

- **Fighter:** Weapon Specialization (+1/+1 with chosen weapon), Combat Dominance (extra attacks vs ≤1HD), Extra Attack (level 10)
- **Ranger:** Favored Enemy, Tracking, Move Silently, Conceal, Delay/Set Traps, Survival
- **Barbarian:** Combat Sense, Deerstalker, Intimidate, Primeval Instincts, Whirlwind Attack (4+)
- **Knight:** Birthright, Mount, Horsemanship, Weapon Training (Lance), Inspire, Embolden, Demoralize
- **Paladin:** Detect Evil, Divine Aura, Divine Health, Lay on Hands, Cure Disease, Turn Undead, Smite Evil (NO spellcasting)
- **Monk:** Unarmed combat (scaling damage), AC bonus (unarmored), Deflect Missiles, Fast Movement, Stunning Attack
- **Cleric:** Divine Spellcasting, Turn/Command Undead
- **Druid:** Druid Spells, Nature Lore, Resist Elements, Woodland Stride, Totem Shape
- **Bard:** Decipher Script, Exalt, Legend Lore, Fascinate (NO spellcasting)
- **Rogue:** Back Attack, Climb, Decipher Script, Hide, Listen, Move Silently, Open Locks, Pick Pockets, Traps
- **Assassin:** Case Target, Death Attack, Disguise, Climb, Hide, Listen, Move Silently, Poisons, Sneak Attack, Traps
- **Wizard:** Arcane Spellcasting (from spellbook, Vancian), spells/day: 4 zero + 2 first at level 1
- **Illusionist:** Arcane Spellcasting (illusion-focused, can heal), Disguise, Sharp Senses; spells/day: 4 zero + 3 first at level 1

**UI:** Cards grouped by archetype (Martial / Divine / Arcane / Specialist). Each card shows prime, HD, one-line summary. Click to expand full ability list. Grey out classes that conflict with chosen alignment or race preferences.

### Step 4: Primes (SIEGE Engine)

This is C&C's core mechanic. It replaces skills, saves, and ability checks.

**How it works:**
- Your **class** sets one prime (e.g., Fighter → STR)
- **Humans** pick 2 more primes (3 total, 3 secondary)
- **Demi-humans** pick 1 more prime (2 total, 4 secondary)
- Prime attributes have **Challenge Base 12**, secondaries have **CB 18**

**Check formula:** `d20 + Attribute Mod + Level (if class ability) ≥ CB + Challenge Level`

**UI:** Show all 6 attributes. Class prime is locked/highlighted. Remaining slots are selectable. Show the CB (12 vs 18) next to each attribute so users see the mechanical impact. Add a tooltip or info panel explaining the SIEGE Engine.

```typescript
// In the draft
interface PrimeSelection {
  classPrime: AttributeKey;       // auto-set from class
  chosenPrimes: AttributeKey[];   // 1 for demi-humans, 2 for humans
}
```

### Step 5: Alignment

Nine-alignment grid. Some classes have restrictions.

| | Lawful | Neutral | Chaotic |
|--|--------|---------|---------|
| **Good** | LG | NG | CG |
| **Neutral** | LN | N | CN |
| **Evil** | LE | NE | CE |

**Class restrictions:**
- Paladin: LG only
- Assassin: Non-Good (LN, N, CN, LE, NE, CE)
- Druid: Must have Neutral on at least one axis (LN, NG, N, NE, CN)
- Monk: Any Lawful (LG, LN, LE)
- Barbarian: Non-Lawful (NG, N, NE, CG, CN, CE)
- Knight: Soft restriction — code of conduct, typically non-CE
- All others: Any

**UI:** 3×3 grid. Disable squares that violate class restriction. Show why they're disabled on hover.

### Step 6: Hit Points

```
HP = Hit Die roll + CON modifier (minimum 1 HP total)
```

| Class | Hit Die |
|-------|---------|
| Barbarian, Monk | d12 |
| Fighter, Ranger, Knight, Paladin, Bard | d10 |
| Cleric, Druid | d8 |
| Rogue, Assassin | d6 |
| Wizard, Illusionist | d4 |

**UI:** Show the die, animate the roll, display CON modifier being added, show final HP. Offer optional "max HP at level 1" house rule toggle.

### Step 7: Equipment

**Starting gold:** Roll 3d6 × 10 gp (30-180 gp). Some CKs use class-specific tables.

**Currency:** 1 pp = 5 gp = 10 sp = 50 cp

**AC System (ascending):**
- Base AC: 10
- AC = 10 + armor bonus + DEX modifier + shield bonus
- Shield bonuses: Buckler +1 (1 foe), Medium +1 (2 foes), Large +1 (3 foes), Pavise +6 (frontal)

**Encumbrance:**
- Each item has an Encumbrance Value (EV)
- Unburdened: up to Encumbrance Rating (STR-based)
- Burdened: 1-3× rating (speed/DEX penalties)
- Overburdened: >3× (5ft/round, auto-fail DEX)

**UI:** Two modes (like SWN):
1. **Quick Package:** Pre-built loadouts per class archetype (Fighter Pack, Wizard Pack, Rogue Pack, etc.)
2. **Custom Shopping:** Browse weapons/armor/gear with filters, running gold total, auto-calculate AC and encumbrance

```typescript
// data/equipment.ts
export interface Weapon {
  id: string;
  name: string;
  cost: number;        // in gp
  damage: string;      // e.g., '1d8'
  range?: string;      // for ranged
  weight: number;      // encumbrance value
  type: 'melee' | 'ranged';
  properties?: string[];
}

export interface Armor {
  id: string;
  name: string;
  cost: number;
  acBonus: number;
  weight: number;
  type: 'light' | 'medium' | 'heavy';
  maxDex?: number;     // max DEX bonus allowed
}
```

### Step 8: Spells (Conditional — Spellcasters Only)

Only show this step if `class.isSpellcaster === true`. Skip otherwise (like Psychic step in SWN).

**Spellcasting classes at level 1:**

| Class | Type | Zero-Level | First-Level | Source |
|-------|------|------------|-------------|--------|
| Wizard | Arcane | 4 | 2 | Spellbook (prepare from book) |
| Illusionist | Arcane | 4 | 3 | Spellbook (illusion focus + cross-list) |
| Cleric | Divine | 2 | 1 | Prayer (full list access) |
| Druid | Divine | ~2 | ~1 | Prayer (nature list) |

**Vancian system:** Prepare specific spells into slots. Once cast, the slot is spent until re-prepared after 8hr rest + 15min/spell.

**UI:** Show available spell list for the class. Let users drag spells into preparation slots. Show slot counts. Each spell is click-to-read with: name, level, school, range, duration, components, full description.

```typescript
// data/spells.ts
export interface Spell {
  id: string;
  name: string;
  level: number;         // 0-9
  school: string;        // Evocation, Illusion, Necromancy, etc.
  classes: string[];     // which classes can cast it
  range: string;
  duration: string;
  components: string[];  // V, S, M, F, DF
  description: string;
  // Optional for combat reference:
  damage?: string;
  savingThrow?: string;
}
```

### Step 9: Details

- **Name** (text input)
- **Secondary Skill** (optional — pre-adventure occupation: Farmer, Blacksmith, Sailor, etc.)
- **Appearance** (text area)
- **Personality** (text area)
- **Background/History** (text area)
- **Goals** (text area)
- **Notes** (text area)

### Step 10: Summary

Show complete character sheet. Highlight anything that looks wrong (e.g., low HP, no weapons). "Save Character" button writes to IndexedDB.

---

### The SIEGE Engine (Reference for Character Sheet)

This drives ALL non-combat resolution. The character sheet should display it prominently.

```
d20 + Attribute Mod + Level* ≥ Challenge Base + Challenge Level
         (* only if relevant to your class abilities)

Challenge Base: 12 (Prime) or 18 (Secondary)
Challenge Level: set by CK (typically 0-10+)
```

**Saving throws use the same system:**

| Attribute | Saves Against |
|-----------|--------------|
| STR | Paralysis, constriction |
| DEX | Breath weapons, traps (dodge) |
| CON | Disease, poison, energy drain |
| INT | Arcane magic (wizard/illusionist spells) |
| WIS | Divine magic (cleric/druid spells), illusions |
| CHA | Charm, fear, death effects |

**Character sheet should show for each attribute:**
- Score → Modifier → Prime/Secondary badge → Challenge Base (12 or 18)

### Combat Reference (for Character Sheet)

```
Attack: d20 + BtH + STR mod (melee) or DEX mod (ranged) ≥ Target AC
Initiative: d10 + DEX mod (each round)
```

---

## Part 3: TypeScript Types

```typescript
// types/character.ts

export type AttributeKey = 'strength' | 'dexterity' | 'constitution' | 'intelligence' | 'wisdom' | 'charisma';

export type Alignment = 'LG' | 'NG' | 'CG' | 'LN' | 'N' | 'CN' | 'LE' | 'NE' | 'CE';

export type RaceId = 'human' | 'dwarf' | 'elf' | 'gnome' | 'halfling' | 'half-elf' | 'half-orc';

export type ClassId =
  | 'fighter' | 'ranger' | 'barbarian' | 'knight' | 'paladin'
  | 'monk' | 'cleric' | 'druid' | 'bard'
  | 'rogue' | 'assassin' | 'wizard' | 'illusionist';

export interface Attributes {
  strength: number;
  dexterity: number;
  constitution: number;
  intelligence: number;
  wisdom: number;
  charisma: number;
}

export interface Character {
  id: string;
  name: string;
  secondarySkill?: string;
  appearance: string;
  personality: string;
  background: string;
  goals: string;
  notes: string;

  // Core
  level: number;
  experience: number;
  attributes: Attributes;
  raceId: RaceId;
  classId: ClassId;
  alignment: Alignment;
  halfElfLineage?: 'human' | 'elf';

  // Primes
  primeAttributes: AttributeKey[];  // 2 for demi-humans, 3 for humans (includes class prime)

  // Combat
  hitPointsMax: number;
  hitPointsCurrent: number;
  hitDie: number;
  bth: number;
  armorClass: number;
  initiative: number;

  // Spells (if spellcaster)
  spellSlots?: Record<number, number>;       // level → slots available
  preparedSpells?: string[];                 // spell IDs
  spellbook?: string[];                      // wizard/illusionist: known spells

  // Equipment
  inventory: InventoryItem[];
  gold: number;
  silver: number;
  copper: number;

  // Derived (calculated, not stored — or cached and recalculated)
  encumbrance: number;
  encumbranceRating: number;

  // Class abilities (reference — stored as class ID, looked up from data)
  // Rogue/Assassin/Ranger abilities are SIEGE checks, not separate skill ranks

  // Level-up
  levelUpHistory: LevelUpRecord[];

  // Journal
  journal: CharacterJournal;

  // Meta
  createdAt: string;
  updatedAt: string;
}

export type CreationStep =
  | 'attributes'
  | 'race'
  | 'class'
  | 'primes'
  | 'alignment'
  | 'hitpoints'
  | 'equipment'
  | 'spells'
  | 'details'
  | 'summary';

export interface CharacterDraft {
  currentStep: CreationStep;
  attributes: Partial<Attributes>;
  attributeMethod: '3d6' | '4d6-drop-lowest' | 'standard-array' | 'point-buy';
  attributeRolls?: number[];  // raw rolls before assignment

  raceId?: RaceId;
  halfElfLineage?: 'human' | 'elf';

  classId?: ClassId;

  primeAttributes: AttributeKey[];  // chosen primes (excluding auto class prime)

  alignment?: Alignment;

  hitPoints?: number;
  hitDieRoll?: number;

  startingGoldRoll?: number;
  equipment: string[];        // equipment IDs
  gold: number;

  // Spells
  preparedSpells: string[];
  spellbook: string[];

  // Details
  name: string;
  secondarySkill: string;
  appearance: string;
  personality: string;
  background: string;
  goals: string;
  notes: string;
}

export interface InventoryItem {
  itemId: string;
  location: 'readied' | 'stowed' | 'stored';
  quantity: number;
  customName?: string;
  customWeight?: number;
}

export interface LevelUpRecord {
  fromLevel: number;
  toLevel: number;
  hpRoll: number;
  hpGained: number;
  timestamp: string;
}

export interface SessionLogEntry {
  id: string;
  sessionNumber: number;
  date: string;
  title: string;
  content: string;
  xpGained?: number;
  goldGained?: number;
  lootGained?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface NPCEntry {
  id: string;
  name: string;
  faction?: string;
  location?: string;
  disposition: 'friendly' | 'neutral' | 'hostile' | 'unknown';
  description: string;
  notes: string;
  createdAt: string;
  updatedAt: string;
}

export interface QuestEntry {
  id: string;
  title: string;
  description: string;
  status: 'active' | 'completed' | 'failed' | 'abandoned';
  giverNpc?: string;
  reward?: string;
  notes: string;
  createdAt: string;
  updatedAt: string;
}

export interface CharacterJournal {
  sessionLog: SessionLogEntry[];
  npcs: NPCEntry[];
  quests: QuestEntry[];
  generalNotes: string;
}
```

---

## Part 4: Key Implementation Notes

### Conditional Step Visibility

```typescript
const ALL_STEPS: StepDef[] = [
  { id: 'attributes', label: 'Attributes', shouldShow: () => true },
  { id: 'race',       label: 'Race',       shouldShow: () => true },
  { id: 'class',      label: 'Class',      shouldShow: () => true },
  { id: 'primes',     label: 'Primes',     shouldShow: () => true },
  { id: 'alignment',  label: 'Alignment',  shouldShow: () => true },
  { id: 'hitpoints',  label: 'Hit Points', shouldShow: () => true },
  { id: 'equipment',  label: 'Equipment',  shouldShow: () => true },
  { id: 'spells',     label: 'Spells',     shouldShow: (d) => isSpellcaster(d.classId) },
  { id: 'details',    label: 'Details',    shouldShow: () => true },
  { id: 'summary',    label: 'Summary',    shouldShow: () => true },
];

// Dynamically compute visible steps
get visibleSteps() {
  return ALL_STEPS.filter(s => s.shouldShow(this.draft));
}
```

### Theming (Medieval Fantasy vs Sci-Fi)

Replace the SWN neon/space theme with a parchment/medieval aesthetic:

```css
:root {
  --color-parchment: #f4e4c1;
  --color-ink: #2c1810;
  --color-leather: #8b4513;
  --color-gold: #d4a017;
  --color-iron: #4a4a4a;
  --color-blood: #8b0000;
  --color-forest: #2d5016;
  --color-arcane: #4b0082;
}
```

Cards with parchment texture, leather-colored borders, gold accents for headers. Print stylesheet should look like a traditional character sheet.

### Data Entry Priority

Populate the data files in this order (most essential first):
1. `attributes.ts` — modifier table, rolling functions
2. `races.ts` — 7 races with all abilities
3. `classes.ts` — 13 classes with abilities, HD, BtH
4. `alignments.ts` — 9 alignments, class restriction logic
5. `equipment.ts` — weapons, armor, gear, starting packages
6. `spells.ts` — spell lists for Wizard, Illusionist, Cleric, Druid

### Data Sources

The C&C Players Handbook (7th printing) was released as a free PDF by Troll Lord Games. The Quick Start Rules covering Fighter, Wizard, Rogue, and Cleric through level 4 are available at trolllord.com. You will need the PHB for:
- Complete equipment price lists
- Full spell lists by class and level
- Exact BtH and EPP tables for all 13 classes
- Exact spells-per-day tables
- Starting gold by class (if class-specific)
- Racial ability precise wording

### Multi-classing (Future Feature)

C&C supports multi-classing:
- Humans: up to 3 classes
- Demi-humans: up to 2 classes
- "Class-and-a-Half" variant: 1 principal + 1 supporting at half rate
- Use best BtH from either class

Implement this as a v2 feature. For now, single class only.

### Level-Up Flow (Post-Creation)

```
1. Confirm level-up (check XP ≥ EPP threshold)
2. Roll new HD + CON mod (min 1 gained)
   - After level 10: fixed HP gain instead
3. Update BtH from progression table
4. Spellcasters: gain new spell slots, may learn new spells
5. Check for new class abilities at this level
6. Record in levelUpHistory
7. Recalculate derived stats
```

### What Makes C&C Different from SWN (Implementation Impact)

| Aspect | SWN | C&C |
|--------|-----|-----|
| Skills | Explicit skill list with ranks | No skills — SIEGE Engine attribute checks |
| Saves | 3 categories (Physical, Evasion, Mental) | 6 saves (one per attribute, via SIEGE) |
| Classes | 4 (+ Adventurer combo) | 13 distinct classes |
| Races | Mostly flavor | Mechanically significant (primes, abilities, stat mods) |
| Magic | Psychic powers (effort-based) | Vancian spellcasting (prepare/expend slots) |
| HP | 1d6 for all, +2 for Warriors | Varies d4 to d12 by class |
| AC | Ascending, equipment-based | Ascending, 10 + armor + DEX + shield |
| Theme | Sci-fi, space opera | Medieval fantasy |

### Character Sheet Layout (Play Mode)

```
┌─────────────────────────────────────────────┐
│  NAME          RACE / CLASS        LEVEL    │
│  Alignment     XP: ___/___                  │
├──────────────┬──────────────────────────────┤
│  ATTRIBUTES  │  COMBAT                      │
│  STR 16 [+2] │  HP: 8/8    AC: 15          │
│  DEX 12 [0]  │  BtH: +1    Init: +0        │
│  CON 14 [+1] │                              │
│  INT  9 [0]  │  WEAPONS                     │
│  WIS 11 [0]  │  Longsword +3 (1d8+2)       │
│  CHA 13 [+1] │  Shortbow +1 (1d6)          │
│  ─────────── │                              │
│  P=Prime     │  ARMOR                       │
│  S=Secondary │  Chain Mail (AC +5)          │
│              │  Medium Shield (+1)           │
├──────────────┼──────────────────────────────┤
│  SIEGE       │  CLASS ABILITIES             │
│  STR P CB:12 │  ▸ Weapon Spec (Longsword)  │
│  DEX S CB:18 │  ▸ Combat Dominance         │
│  CON P CB:12 │  ▸ Extra Attack (lvl 10)    │
│  INT S CB:18 │                              │
│  WIS S CB:18 │  RACIAL ABILITIES            │
│  CHA P CB:12 │  ▸ Extra Prime (Human)      │
├──────────────┴──────────────────────────────┤
│  EQUIPMENT / INVENTORY                       │
├─────────────────────────────────────────────┤
│  SPELLS (if caster)                          │
├─────────────────────────────────────────────┤
│  JOURNAL  [Sessions] [NPCs] [Quests] [Notes]│
└─────────────────────────────────────────────┘
```

---

## Part 5: Getting Started Checklist

- [ ] Scaffold SvelteKit 5 project with TypeScript + Tailwind
- [ ] Set up `data/attributes.ts` with modifier function and rolling
- [ ] Set up `types/character.ts` (use the types above as starting point)
- [ ] Build `stores/character.svelte.ts` with step navigation + validation
- [ ] Implement `data/races.ts` with all 7 races
- [ ] Implement `data/classes.ts` with all 13 classes
- [ ] Implement `data/alignments.ts` with restriction logic
- [ ] Build wizard steps: Attributes → Race → Class → Primes → Alignment → HP
- [ ] Implement `data/equipment.ts` (weapons, armor, gear, packages)
- [ ] Build Equipment step with shopping UI
- [ ] Implement `data/spells.ts` (at least Wizard and Cleric level 0-1)
- [ ] Build Spells step (conditional)
- [ ] Build Details and Summary steps
- [ ] Implement persistence (IndexedDB + fallback)
- [ ] Build character view/play mode with SIEGE reference
- [ ] Build journal system (session log, NPCs, quests, notes)
- [ ] Build level-up wizard
- [ ] Add export/import JSON
- [ ] Add print-friendly stylesheet
- [ ] Write unit tests for game math
- [ ] Deploy to GitHub Pages
