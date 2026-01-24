# SWN Character Builder - Claude Code Context

## Project Overview
A Stars Without Number (Revised Edition) character creation web app. Fast, reactive, mobile-friendly.

## Tech Stack
- **SvelteKit 5** with Svelte 5 runes (`$state`, `$derived`, `$effect`)
- **TypeScript**
- **Tailwind CSS v3.4**
- **Vite 6**
- **idb-keyval** for IndexedDB persistence

## Commands
```bash
npm install    # Install dependencies
npm run dev    # Start dev server at localhost:5173
npm run build  # Production build to /build
```

## Project Structure
```
src/
├── app.css              # Tailwind + custom styles
├── app.html             # HTML template
├── data/                # Game data (readonly)
│   ├── attributes.ts    # 6 attributes, modifiers, rolling
│   ├── backgrounds.ts   # 20 backgrounds
│   ├── classes.ts       # 4 classes + partials
│   ├── foci.ts          # 22 foci
│   └── skills.ts        # All skills including psychic
├── lib/components/steps/ # Wizard step components
├── routes/              # SvelteKit pages
│   ├── +layout.svelte   # App shell
│   ├── +page.svelte     # Home (character list)
│   └── create/+page.svelte # Creation wizard
├── stores/
│   └── character.svelte.ts # Main state (Svelte 5 class with $state)
└── types/
    └── character.ts     # TypeScript interfaces
```

## Current Status
- ✅ Core wizard flow working (10 steps)
- ✅ Attributes (roll/array)
- ✅ Background selection
- ✅ Class selection (including Adventurer multiclass)
- ✅ Foci selection
- ✅ Skills selection
- ✅ Hit points rolling
- ✅ Equipment system (packages + custom shopping)
- ✅ Character details form
- ✅ Summary + save to IndexedDB
- ⏳ Psychic disciplines (not implemented)
- ⏳ PDF export (not implemented)

## Key Patterns
- State lives in `characterStore` (singleton class)
- Steps validate via `characterStore.validateCurrentStep()`
- Navigation: `characterStore.nextStep()` / `prevStep()`
- Game data is in `/src/data/*.ts` - import and use directly

## Known Issues to Fix
- Psychic step skipped for non-psychics but UI not complete
- No PDF export yet

## SWN Rules Reference
- Attributes: 3d6 or array [14,12,11,10,9,7], mods: 3=-2, 4-7=-1, 8-13=0, 14-17=+1, 18=+2
- HP: 1d6 + CON mod, Warriors +2
- Saves: 15 - level - best of two attribute mods
