# Prompt: Enhanced Character Sheet Export (PDF Export)

Implement professional PDF character sheet export for the SWN Character Builder. This is the most-requested feature for TTRPG character builders — players need clean, printable sheets for table use. Read CLAUDE.md for project conventions.

## Current State

The existing export functionality (`src/routes/character/[id]/+page.svelte`):
- **JSON export** (lines 58-68): Downloads full character data as JSON
- **Clipboard copy** (lines 70-80): Copies plain-text summary via `formatCharacterText()`
- **Browser print** (lines 150-152): Just calls `window.print()` with basic print CSS

The print CSS (`src/app.css` lines 253-333) provides basic styling but:
- Uses browser print flow (no control over layout)
- No proper character sheet formatting
- Doesn't look like a real game character sheet
- Can't be saved as PDF without browser "Print to PDF"

## Implementation Plan

### Approach: HTML-to-PDF with jsPDF + html2canvas

Use `jsPDF` with `html2canvas` to render a styled character sheet component to PDF. This gives full control over layout without a backend.

**Dependencies to add:**
```bash
npm install jspdf html2canvas
npm install -D @types/html2canvas
```

### Step 1: Create Character Sheet Template Component

Create `src/lib/components/CharacterSheetPDF.svelte` — a print-optimized character sheet layout that will be rendered to PDF.

**Design requirements:**
- **Letter size** (8.5" x 11") or A4, selectable
- **Single page for basic info**, optional second page for extended content
- **SWN-themed styling** but print-friendly (dark borders, no dark backgrounds)
- **Structured layout** matching official SWN character sheet:

```
┌─────────────────────────────────────────────────────────────┐
│  CHARACTER NAME                    Level X [Class]          │
│  Background: [bg]    Homeworld: [hw]    Species: [sp]       │
├─────────────────────────────────────────────────────────────┤
│  ATTRIBUTES              │  COMBAT                          │
│  ┌───┬───┬───┬───┬───┬───┤  HP: [ ]/[ ]  AC: [ ]  AB: +[ ]  │
│  │STR│DEX│CON│INT│WIS│CHA│  ─────────────────────────────── │
│  │ X │ X │ X │ X │ X │ X │  SAVING THROWS                   │
│  │+X │+X │+X │+X │+X │+X │  Physical: X+  Evasion: X+       │
│  └───┴───┴───┴───┴───┴───┤  Mental: X+                      │
├──────────────────────────┴──────────────────────────────────┤
│  SKILLS                                                      │
│  [skill-0] [skill-1] [skill-2] ...                          │
├─────────────────────────────────────────────────────────────┤
│  FOCI                                                        │
│  • [Focus Name] (Lvl X) - brief description                  │
│  • [Focus Name] (Lvl X) - brief description                  │
├─────────────────────────────────────────────────────────────┤
│  PSYCHIC ABILITIES (if applicable)                          │
│  Effort: [ ]/[ ]                                            │
│  Disciplines: [disc] - Techniques: [tech], [tech]           │
├─────────────────────────────────────────────────────────────┤
│  EQUIPMENT                                                   │
│  READIED                  │  STOWED                          │
│  • [weapon] (dmg)         │  • [item] (enc)                  │
│  • [armor] (AC X)         │  • [item] (enc)                  │
│  Credits: XXX             │  Enc: X/X readied, X/X stowed    │
├─────────────────────────────────────────────────────────────┤
│  WEAPONS                                                     │
│  Name          │ Damage │ Range │ Attribute │ Attack Bonus  │
│  [weapon]      │ 1d8    │ Melee │ STR/DEX   │ +X            │
├─────────────────────────────────────────────────────────────┤
│  NOTES                                                       │
│  Goals: [goals text]                                        │
│  [notes text - with room for handwriting]                   │
└─────────────────────────────────────────────────────────────┘
```

**Component props:**
```typescript
interface Props {
  character: Character;
  options: {
    pageSize: 'letter' | 'a4';
    includeDescriptions: boolean;  // full focus/skill descriptions vs compact
    includeNotes: boolean;
    colorScheme: 'bw' | 'color';  // black & white or with accent colors
  };
}
```

### Step 2: Create PDF Generation Utility

Create `src/lib/utils/pdfExport.ts`:

```typescript
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import type { Character } from '$types/character';

export interface PDFExportOptions {
  pageSize: 'letter' | 'a4';
  includeDescriptions: boolean;
  includeNotes: boolean;
  colorScheme: 'bw' | 'color';
  quality: 'draft' | 'standard' | 'high'; // affects DPI
}

export async function generateCharacterPDF(
  character: Character,
  sheetElement: HTMLElement,
  options: PDFExportOptions
): Promise<Blob> {
  // 1. Configure page dimensions
  const pageWidth = options.pageSize === 'letter' ? 215.9 : 210;  // mm
  const pageHeight = options.pageSize === 'letter' ? 279.4 : 297; // mm

  // 2. Render element to canvas
  const scale = options.quality === 'high' ? 3 : options.quality === 'standard' ? 2 : 1;
  const canvas = await html2canvas(sheetElement, {
    scale,
    useCORS: true,
    logging: false,
    backgroundColor: '#ffffff'
  });

  // 3. Create PDF and add image
  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: options.pageSize
  });

  const imgData = canvas.toDataURL('image/png');
  pdf.addImage(imgData, 'PNG', 0, 0, pageWidth, pageHeight);

  // 4. Return as blob
  return pdf.output('blob');
}

export function downloadPDF(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
```

### Step 3: Create PDF Export Modal/Dialog

Create `src/lib/components/PDFExportModal.svelte`:

- Modal overlay (reuse pattern from delete confirmation modal, lines 250-268 of character page)
- Preview of the character sheet (rendered `CharacterSheetPDF` at reduced scale)
- Options form:
  - Page size: Letter / A4 radio buttons
  - Include full descriptions: checkbox
  - Include notes section: checkbox
  - Color scheme: B&W / Color radio buttons
  - Quality: Draft / Standard / High dropdown
- "Download PDF" button with loading state
- "Cancel" button

**State management:**
```typescript
let isGenerating = $state(false);
let previewElement = $state<HTMLElement | null>(null);

async function handleExport() {
  if (!previewElement) return;
  isGenerating = true;
  try {
    const blob = await generateCharacterPDF(character, previewElement, options);
    downloadPDF(blob, `${character.name.replace(/\s+/g, '_')}_character_sheet.pdf`);
  } finally {
    isGenerating = false;
  }
}
```

### Step 4: Add PDF Export Button to Character View

In `src/routes/character/[id]/+page.svelte`:

1. Import the modal component
2. Add state: `let showPDFExport = $state(false);`
3. Add button in the Actions section (after line 566):

```svelte
<button onclick={() => showPDFExport = true} class="btn btn-secondary">
  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
      d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
  </svg>
  Export PDF
</button>
```

4. Render modal when `showPDFExport` is true

### Step 5: Character Sheet Styling

The `CharacterSheetPDF.svelte` component should use inline styles or a dedicated CSS module (not Tailwind) for precise print control:

```css
.sheet {
  width: 8.5in; /* or 210mm for A4 */
  min-height: 11in;
  padding: 0.5in;
  background: white;
  color: black;
  font-family: 'Helvetica', 'Arial', sans-serif;
  font-size: 10pt;
  line-height: 1.3;
}

.sheet-header {
  border-bottom: 2px solid black;
  padding-bottom: 0.25in;
  margin-bottom: 0.25in;
}

.sheet-section {
  border: 1px solid #333;
  padding: 0.15in;
  margin-bottom: 0.15in;
}

.sheet-section-title {
  font-family: var(--font-display), 'Helvetica', sans-serif;
  font-size: 9pt;
  font-weight: bold;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  border-bottom: 1px solid #666;
  margin-bottom: 0.1in;
  padding-bottom: 0.05in;
}

.attr-grid {
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: 0.1in;
  text-align: center;
}

.attr-box {
  border: 1px solid #333;
  padding: 0.05in;
}

.attr-label {
  font-size: 8pt;
  font-weight: bold;
}

.attr-score {
  font-size: 14pt;
  font-weight: bold;
}

.attr-mod {
  font-size: 9pt;
}

/* Weapon table */
.weapon-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 9pt;
}

.weapon-table th, .weapon-table td {
  border: 1px solid #333;
  padding: 0.05in;
  text-align: left;
}

.weapon-table th {
  background: #eee;
  font-weight: bold;
}
```

### Step 6: Weapon Attack Calculations

Include calculated attack bonuses for each weapon. Reuse logic pattern from `PlayMode.svelte`:

```typescript
function getWeaponAttackBonus(weapon: EquipmentItem, character: Character): number {
  const baseAB = character.attackBonus;
  const skillId = weapon.category === 'weapon' && weapon.range === 'melee' ? 'stab' : 'shoot';
  const skill = character.skills.find(s => s.skillId === skillId);
  const skillBonus = skill ? skill.rank : -1;

  // Get attribute modifier (DEX for ranged/finesse, STR for melee)
  const attrKey = weapon.range === 'melee' ? 'strength' : 'dexterity';
  const attrMod = getAttributeModifier(character.attributes[attrKey]);

  return baseAB + skillBonus + attrMod;
}
```

### Step 7: Handle Multi-Page PDFs

For characters with extensive equipment, foci, or psychic abilities, support multi-page output:

1. Measure content height after rendering
2. If content exceeds page height, split into pages
3. Use `pdf.addPage()` for additional pages
4. Add page numbers: "Page 1 of 2"

Alternatively, offer two export modes:
- **Compact (1 page)**: Abbreviated descriptions, smaller fonts
- **Full (multi-page)**: Complete descriptions, room for notes

### Step 8: Batch Export (Optional Enhancement)

Add ability to export multiple characters at once from the home page:

1. Add checkbox selection to character cards on home page
2. Add "Export Selected as PDF" button
3. Generate combined PDF with each character on separate page(s)
4. Or generate as ZIP file with individual PDFs

## Data to Include in PDF

From `Character` interface (`src/types/character.ts`):

**Header:**
- `name`, `level`, `classId` (resolve via `getClassById`)
- `backgroundId` (resolve via `getBackgroundById`)
- `homeworld`, `species`

**Attributes Section:**
- All 6 attributes with modifiers (use `getAttributeModifier` from `src/data/attributes.ts`)

**Combat Section:**
- `hitPointsMax`, `hitPointsCurrent`
- `armorClass`, `attackBonus`
- `savingThrows.physical`, `savingThrows.evasion`, `savingThrows.mental`

**Skills Section:**
- All entries from `skills[]` array, resolved via `getSkillById`
- Format as "Skill-Rank" (e.g., "Notice-1", "Program-0")

**Foci Section:**
- All entries from `foci[]`, resolved via `getFocusById`
- Include level and key abilities

**Psychic Section (if applicable):**
- `effortMax`, `effortCurrent`
- `psychicDisciplines[]` resolved via discipline data
- `psychicTechniques[]` resolved via technique data

**Equipment Section:**
- `inventory[]` grouped by location (readied/stowed/stored)
- Resolve items via `getEquipmentById`
- Calculate encumbrance totals
- `credits`

**Weapons Table:**
- Filter weapons from inventory
- Calculate attack bonus for each
- Show damage, range

**Notes Section:**
- `goals`
- `notes`
- `employer` (if set)

## Constraints

- Use **Svelte 5 runes** ($state, $derived, $effect)
- Use **TypeScript** with proper typing
- Only add `jspdf` and `html2canvas` as new dependencies
- Support both Letter and A4 page sizes
- PDF must be readable when printed in black & white
- Mobile-friendly modal/preview
- Run `npm run build` at the end to verify no type errors
