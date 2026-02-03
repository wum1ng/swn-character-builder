import { get, set, del, keys } from 'idb-keyval';
import type { Character, CharacterDraft, CreationStep, Attributes, AttributeKey, SkillRank, ClassName, InventoryItem } from '$types/character';
import { rollAllAttributes, createEmptyAttributes, getAttributeModifier, STANDARD_ARRAY } from '$data/attributes';
import { BACKGROUNDS, getBackgroundById } from '$data/backgrounds';
import { CLASSES } from '$data/classes';
import { COMBAT_FOCI, NON_COMBAT_FOCI, getFocusById } from '$data/foci';
import { SKILLS, NON_COMBAT_SKILLS, COMBAT_SKILLS } from '$data/skills';
import { EQUIPMENT_PACKAGES, getEquipmentById, calculateAC } from '$data/equipment';

// Random name generator
const FIRST_NAMES = [
  'Zara', 'Kira', 'Jax', 'Nova', 'Orion', 'Vex', 'Luna', 'Cade', 'Ryn', 'Thane',
  'Mira', 'Dex', 'Aria', 'Cole', 'Lyra', 'Zeke', 'Nyx', 'Finn', 'Sera', 'Blake',
  'Echo', 'Kai', 'Wren', 'Ash', 'Quinn', 'Rey', 'Zion', 'Jade', 'Cruz', 'Storm'
];
const LAST_NAMES = [
  'Vance', 'Cross', 'Sterling', 'Blackwood', 'Reyes', 'Tanaka', 'Chen', 'Okonkwo',
  'Volkov', 'Santos', 'Kim', 'Nakamura', 'Singh', 'Oduya', 'Larsen', 'Petrova',
  'Moreau', 'Hassan', 'Yamamoto', 'Kowalski', 'Rivera', 'Zhang', 'Ito', 'Novak'
];

function randomFrom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function generateRandomName(): string {
  return `${randomFrom(FIRST_NAMES)} ${randomFrom(LAST_NAMES)}`;
}

// Storage helpers with localStorage fallback for Safari Private Browsing
const STORAGE_PREFIX = 'swn-character-';

async function storageSet(key: string, value: Character): Promise<void> {
  try {
    await set(key, value);
  } catch {
    // Fallback to localStorage
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(STORAGE_PREFIX + key, JSON.stringify(value));
    } else {
      throw new Error('No storage available');
    }
  }
}

async function storageGet(key: string): Promise<Character | undefined> {
  try {
    const result = await get(key);
    if (result) return result as Character;
  } catch {
    // Ignore IndexedDB errors
  }
  // Try localStorage fallback
  if (typeof localStorage !== 'undefined') {
    const item = localStorage.getItem(STORAGE_PREFIX + key);
    if (item) return JSON.parse(item) as Character;
  }
  return undefined;
}

async function storageDel(key: string): Promise<void> {
  try {
    await del(key);
  } catch {
    // Ignore IndexedDB errors
  }
  if (typeof localStorage !== 'undefined') {
    localStorage.removeItem(STORAGE_PREFIX + key);
  }
}

async function storageKeys(): Promise<string[]> {
  const allKeys: string[] = [];

  // Try IndexedDB
  try {
    const idbKeys = await keys();
    allKeys.push(...idbKeys.map(k => String(k)));
  } catch {
    // Ignore IndexedDB errors
  }

  // Also check localStorage
  if (typeof localStorage !== 'undefined') {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith(STORAGE_PREFIX + 'character-')) {
        allKeys.push(key.replace(STORAGE_PREFIX, ''));
      }
    }
  }

  // Deduplicate
  return [...new Set(allKeys)];
}

// Build inventory from a flat equipment ID array with sensible defaults
function buildInventoryFromEquipment(equipmentIds: string[]): InventoryItem[] {
  const grouped = new Map<string, { readied: number; stowed: number }>();

  for (const id of equipmentIds) {
    const item = getEquipmentById(id);
    // Weapons and armor default to readied; gear defaults to stowed
    const defaultLocation = (item?.category === 'weapon' || item?.category === 'armor') ? 'readied' : 'stowed';

    const key = `${id}:${defaultLocation}`;
    if (!grouped.has(key)) {
      grouped.set(key, { readied: 0, stowed: 0 });
    }
    const entry = grouped.get(key)!;
    entry[defaultLocation]++;
  }

  const inventory: InventoryItem[] = [];
  for (const [key, counts] of grouped) {
    const itemId = key.split(':')[0];
    const location = key.split(':')[1] as 'readied' | 'stowed';
    const qty = location === 'readied' ? counts.readied : counts.stowed;
    if (qty > 0) {
      inventory.push({ itemId, location, quantity: qty });
    }
  }

  return inventory;
}

// Migrate old character data that lacks inventory field
function migrateCharacter(char: Character): Character {
  if (!char.inventory || char.inventory.length === 0) {
    if (char.equipment && char.equipment.length > 0) {
      char.inventory = buildInventoryFromEquipment(char.equipment);
    } else {
      char.inventory = [];
    }
  }
  return char;
}

// Initial draft state
function createInitialDraft(): CharacterDraft {
  return {
    currentStep: 'attributes',
    attributes: {},
    attributeMethod: 'random',
    backgroundSkillMethod: 'roll',
    growthRolls: [],
    learningRolls: [],
    pickedSkills: [],
    selectedFoci: [],
    skills: [],
    psychicDisciplines: [],
    psychicTechniques: [],
    equipment: [],
    credits: 0,
    name: '',
    homeworld: '',
    species: 'Human',
    employer: '',
    goals: '',
    notes: ''
  };
}

// Svelte 5 store using $state
class CharacterStore {
  draft = $state<CharacterDraft>(createInitialDraft());
  savedCharacters = $state<Character[]>([]);
  isLoading = $state(false);
  error = $state<string | null>(null);
  editingCharacterId = $state<string | null>(null);

  // Snapshot of draft per step, for reset
  private _stepSnapshots: Record<string, string> = {};

  private _snapshotStep(step: string) {
    // Save snapshot for a step, only if not already saved
    if (!this._stepSnapshots[step]) {
      this._stepSnapshots[step] = JSON.stringify(this.draft);
    }
  }

  // Step navigation
  readonly steps: CreationStep[] = [
    'attributes',
    'background',
    'backgroundSkills',
    'class',
    'foci',
    'skills',
    'psychic',
    'hitpoints',
    'equipment',
    'details',
    'summary'
  ];

  get currentStepIndex() {
    return this.steps.indexOf(this.draft.currentStep);
  }

  get canGoBack() {
    return this.currentStepIndex > 0;
  }

  get canGoForward() {
    return this.validateCurrentStep();
  }

  // Step validation
  validateCurrentStep(): boolean {
    switch (this.draft.currentStep) {
      case 'attributes':
        return this.draft.attributes.strength !== undefined &&
               this.draft.attributes.dexterity !== undefined &&
               this.draft.attributes.constitution !== undefined &&
               this.draft.attributes.intelligence !== undefined &&
               this.draft.attributes.wisdom !== undefined &&
               this.draft.attributes.charisma !== undefined;
      
      case 'background': {
        if (!this.draft.backgroundId) return false;
        const bg = getBackgroundById(this.draft.backgroundId);
        // If the background's free skill requires a choice, ensure it's been made
        if (bg && bg.freeSkill.startsWith('any-')) {
          return !!this.draft.freeSkillChoice;
        }
        return true;
      }

      case 'backgroundSkills':
        // Check that background skills step is complete (pickedSkills contains 'done')
        return this.draft.pickedSkills.includes('done');

      case 'class':
        return !!this.draft.classId;
      
      case 'foci':
        return this.draft.selectedFoci.length >= 1;
      
      case 'skills':
        return !!this.draft.hobbySkill;
      
      case 'psychic':
        // Only required for psychic classes
        if (this.draft.classId === 'psychic' || 
            this.draft.partialClasses?.includes('partial-psychic')) {
          return this.draft.psychicDisciplines.length > 0;
        }
        return true;
      
      case 'hitpoints':
        return this.draft.hitPoints !== undefined && this.draft.hitPoints > 0;
      
      case 'equipment':
        return this.draft.equipmentPackageId !== undefined || this.draft.equipment.length > 0;
      
      case 'details':
        return this.draft.name.trim().length > 0;
      
      default:
        return true;
    }
  }

  // Navigation actions
  goToStep(step: CreationStep) {
    this._snapshotStep(step);
    this.draft.currentStep = step;
  }

  nextStep() {
    if (this.canGoForward && this.currentStepIndex < this.steps.length - 1) {
      // Skip psychic step if not a psychic class
      let nextIndex = this.currentStepIndex + 1;
      if (this.steps[nextIndex] === 'psychic' &&
          this.draft.classId !== 'psychic' &&
          !this.draft.partialClasses?.includes('partial-psychic')) {
        nextIndex++;
      }
      const nextStepName = this.steps[nextIndex];
      this._snapshotStep(nextStepName);
      this.draft.currentStep = nextStepName;
    }
  }

  prevStep() {
    if (this.canGoBack) {
      let prevIndex = this.currentStepIndex - 1;
      // Skip psychic step if not a psychic class
      if (this.steps[prevIndex] === 'psychic' &&
          this.draft.classId !== 'psychic' &&
          !this.draft.partialClasses?.includes('partial-psychic')) {
        prevIndex--;
      }
      const prevStepName = this.steps[Math.max(0, prevIndex)];
      this._snapshotStep(prevStepName);
      this.draft.currentStep = prevStepName;
    }
  }

  // Attribute actions
  rollAttributes() {
    const rolled = rollAllAttributes();
    this.draft.attributes = rolled;
    this.draft.attributeMethod = 'random';
    this.draft.replacedAttribute = undefined;
  }

  setAttributeArray(assignments: Record<AttributeKey, number>) {
    this.draft.attributes = assignments;
    this.draft.attributeMethod = 'array';
  }

  setAttribute(attr: AttributeKey, value: number) {
    this.draft.attributes[attr] = value;
  }

  replaceAttributeWith14(attr: AttributeKey) {
    this.draft.attributes[attr] = 14;
    this.draft.replacedAttribute = attr;
  }

  // Background actions
  setBackground(backgroundId: string) {
    this.draft.backgroundId = backgroundId;
    // Reset background-related skills and clear any skills from previous background
    this.draft.skills = [];
    this.draft.growthRolls = [];
    this.draft.learningRolls = [];
    this.draft.pickedSkills = [];
    this.draft.freeSkillChoice = undefined;

    // Add free skill from background (skip 'any-' choices that need player selection)
    const background = getBackgroundById(backgroundId);
    if (background && !background.freeSkill.startsWith('any-')) {
      this.addFreeSkill(background.freeSkill);
    }
  }

  // Skill actions
  // addSkill adds a skill at a specific rank (used for explicit rank setting)
  addSkill(skillId: string, rank: number = 0) {
    const existing = this.draft.skills.find(s => s.skillId === skillId);
    if (existing) {
      existing.rank = Math.max(existing.rank, rank);
    } else {
      this.draft.skills.push({ skillId, rank });
    }
  }

  // addFreeSkill adds a free skill that stacks - two free skills = level 1
  addFreeSkill(skillId: string) {
    const existing = this.draft.skills.find(s => s.skillId === skillId);
    if (existing) {
      // Stack: if already has the skill, increment rank (up to max 1 from free skills)
      existing.rank = Math.min(existing.rank + 1, 1);
    } else {
      this.draft.skills.push({ skillId, rank: 0 });
    }
  }

  setHobbySkill(skillId: string) {
    this.draft.hobbySkill = skillId;
    this.addFreeSkill(skillId);
  }

  // Class actions
  setClass(classId: 'expert' | 'warrior' | 'psychic') {
    this.draft.classId = classId;
    this.draft.partialClasses = undefined;
  }

  setAdventurerClass(partial1: string, partial2: string) {
    this.draft.classId = 'adventurer';
    this.draft.partialClasses = [partial1 as any, partial2 as any];
  }

  // Foci actions
  addFocus(focusId: string, level: 1 | 2 = 1) {
    const existing = this.draft.selectedFoci.find(f => f.focusId === focusId);
    if (existing) {
      existing.level = level;
    } else {
      this.draft.selectedFoci.push({ focusId, level });
      // Add bonus skill from focus level 1 (only if single skill, not a choice)
      const focus = getFocusById(focusId);
      if (focus?.level1.bonusSkill && !focus.level1.bonusSkillChoices) {
        this.addFreeSkill(focus.level1.bonusSkill);
      }
    }
  }

  removeFocus(focusId: string) {
    this.draft.selectedFoci = this.draft.selectedFoci.filter(f => f.focusId !== focusId);
    // Note: We don't remove the skill as it may have been added from multiple sources
  }

  // Hit points
  rollHitPoints(): number {
    const conMod = this.draft.attributes.constitution 
      ? getAttributeModifier(this.draft.attributes.constitution)
      : 0;
    
    const roll = Math.floor(Math.random() * 6) + 1;
    this.draft.hitPointRoll = roll;
    
    let hp = roll + conMod;
    
    // Warrior bonus
    if (this.draft.classId === 'warrior' || 
        this.draft.partialClasses?.includes('partial-warrior')) {
      hp += 2;
    }
    
    // Die Hard focus bonus
    if (this.draft.selectedFoci.some(f => f.focusId === 'die-hard')) {
      hp += 2;
    }
    
    this.draft.hitPoints = Math.max(1, hp);
    return this.draft.hitPoints;
  }

  // Equipment
  setEquipmentPackage(packageId: string) {
    this.draft.equipmentPackageId = packageId;
  }

  // Character building
  buildCharacter(): Character {
    const now = new Date().toISOString();
    const conMod = getAttributeModifier(this.draft.attributes.constitution || 10);
    const dexMod = getAttributeModifier(this.draft.attributes.dexterity || 10);
    const strMod = getAttributeModifier(this.draft.attributes.strength || 10);
    const intMod = getAttributeModifier(this.draft.attributes.intelligence || 10);
    const wisMod = getAttributeModifier(this.draft.attributes.wisdom || 10);
    const chaMod = getAttributeModifier(this.draft.attributes.charisma || 10);

    // Get existing character data if editing
    const existingChar = this.editingCharacterId
      ? this.savedCharacters.find(c => c.id === this.editingCharacterId)
      : null;

    return {
      id: this.editingCharacterId || crypto.randomUUID(),
      name: this.draft.name,
      homeworld: this.draft.homeworld,
      species: this.draft.species,
      employer: this.draft.employer,
      goals: this.draft.goals,
      notes: this.draft.notes,

      level: existingChar?.level || 1,
      experience: existingChar?.experience || 0,
      attributes: this.draft.attributes as Attributes,

      backgroundId: this.draft.backgroundId!,
      classId: this.draft.classId!,
      partialClasses: this.draft.partialClasses,

      skills: this.draft.skills,
      foci: this.draft.selectedFoci,

      psychicDisciplines: this.draft.psychicDisciplines,
      psychicTechniques: this.draft.psychicTechniques,
      effortMax: this.calculateMaxEffort(),
      effortCurrent: existingChar?.effortCurrent ?? this.calculateMaxEffort(),

      hitPointsMax: this.draft.hitPoints || 1,
      hitPointsCurrent: existingChar?.hitPointsCurrent ?? (this.draft.hitPoints || 1),
      attackBonus: this.calculateAttackBonus(),
      armorClass: (() => {
        const inv = existingChar?.inventory || buildInventoryFromEquipment(this.draft.equipment);
        return calculateAC(inv, dexMod);
      })(),

      equipment: this.draft.equipment,
      inventory: existingChar?.inventory || buildInventoryFromEquipment(this.draft.equipment),
      credits: this.draft.credits,

      savingThrows: {
        physical: 15 - 1 - Math.max(strMod, conMod),
        evasion: 15 - 1 - Math.max(intMod, dexMod),
        mental: 15 - 1 - Math.max(wisMod, chaMod)
      },

      createdAt: existingChar?.createdAt || now,
      updatedAt: now
    };
  }

  calculateMaxEffort(): number {
    if (this.draft.classId !== 'psychic' && 
        !this.draft.partialClasses?.includes('partial-psychic')) {
      return 0;
    }
    
    const wisMod = getAttributeModifier(this.draft.attributes.wisdom || 10);
    const conMod = getAttributeModifier(this.draft.attributes.constitution || 10);
    
    // Find highest psychic skill
    const psychicSkillRanks = this.draft.skills
      .filter(s => ['biopsionics', 'metapsionics', 'precognition', 'telekinesis', 'telepathy', 'teleportation'].includes(s.skillId))
      .map(s => s.rank);
    
    const highestPsychicSkill = Math.max(0, ...psychicSkillRanks);
    
    let effort = 1 + highestPsychicSkill + Math.max(wisMod, conMod);
    
    // Psychic Training focus
    const psychicTraining = this.draft.selectedFoci.find(f => f.focusId === 'psychic-training');
    if (psychicTraining) {
      effort += psychicTraining.level;
    }
    
    return Math.max(1, effort);
  }

  calculateAttackBonus(): number {
    if (this.draft.classId === 'warrior') return 1;
    if (this.draft.partialClasses?.includes('partial-warrior')) return 0;
    return 0;
  }

  // Persistence
  async saveCharacter(character: Character) {
    try {
      this.isLoading = true;
      this.error = null;
      await storageSet(`character-${character.id}`, character);
      this.savedCharacters = [...this.savedCharacters.filter(c => c.id !== character.id), character];
    } catch (e) {
      this.error = 'Failed to save character';
      console.error(e);
      throw e;
    } finally {
      this.isLoading = false;
    }
  }

  async loadCharacters() {
    try {
      this.isLoading = true;
      const allKeys = await storageKeys();
      const characterKeys = allKeys.filter(k => k.startsWith('character-'));
      const characters: Character[] = [];

      for (const key of characterKeys) {
        const char = await storageGet(key);
        if (char) characters.push(migrateCharacter(char));
      }

      this.savedCharacters = characters;
    } catch (e) {
      this.error = 'Failed to load characters';
      console.error(e);
    } finally {
      this.isLoading = false;
    }
  }

  async deleteCharacter(id: string) {
    try {
      await storageDel(`character-${id}`);
      this.savedCharacters = this.savedCharacters.filter(c => c.id !== id);
    } catch (e) {
      this.error = 'Failed to delete character';
      console.error(e);
    }
  }

  // Load character for editing
  loadCharacterForEdit(character: Character) {
    this.editingCharacterId = character.id;
    this.draft = {
      currentStep: 'summary',
      attributes: { ...character.attributes },
      attributeMethod: 'custom',
      backgroundSkillMethod: 'pick',
      growthRolls: [],
      learningRolls: [],
      pickedSkills: [],
      selectedFoci: [...character.foci],
      skills: [...character.skills],
      psychicDisciplines: character.psychicDisciplines || [],
      psychicTechniques: character.psychicTechniques || [],
      equipment: [...character.equipment],
      credits: character.credits,
      name: character.name,
      homeworld: character.homeworld,
      species: character.species,
      employer: character.employer,
      goals: character.goals,
      notes: character.notes,
      backgroundId: character.backgroundId,
      classId: character.classId,
      partialClasses: character.partialClasses,
      hitPoints: character.hitPointsMax,
      hobbySkill: character.skills[0]?.skillId // Just pick first skill as placeholder
    };
  }

  // Random character generation
  generateRandomCharacter() {
    this.reset();

    // 1. Use standard array with random assignment
    const array = [...STANDARD_ARRAY];
    // Shuffle the array
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    const attrs: AttributeKey[] = ['strength', 'dexterity', 'constitution', 'intelligence', 'wisdom', 'charisma'];
    this.draft.attributes = {
      strength: array[0],
      dexterity: array[1],
      constitution: array[2],
      intelligence: array[3],
      wisdom: array[4],
      charisma: array[5]
    };
    this.draft.attributeMethod = 'array';

    // 2. Pick random background
    const background = randomFrom(BACKGROUNDS);
    this.draft.backgroundId = background.id;
    this.addFreeSkill(background.freeSkill);

    // Add quick skills from background
    for (const skillId of background.quickSkills) {
      if (skillId === 'any-combat') {
        this.addFreeSkill(randomFrom(COMBAT_SKILLS));
      } else {
        this.addFreeSkill(skillId);
      }
    }

    // 3. Pick random class (warrior or expert for simplicity)
    const classId = randomFrom(['warrior', 'expert'] as const);
    this.draft.classId = classId;

    // 4. Pick appropriate focus based on class
    if (classId === 'warrior') {
      const focus = randomFrom(COMBAT_FOCI);
      this.draft.selectedFoci.push({ focusId: focus.id, level: 1 });
    } else {
      const focus = randomFrom(NON_COMBAT_FOCI);
      this.draft.selectedFoci.push({ focusId: focus.id, level: 1 });
    }

    // 5. Add a hobby skill
    const availableHobbySkills = SKILLS.filter(s => !s.isPsychic).map(s => s.id);
    this.draft.hobbySkill = randomFrom(availableHobbySkills);
    this.addFreeSkill(this.draft.hobbySkill);

    // 6. Roll hit points
    this.rollHitPoints();

    // 7. Pick random equipment package
    const pkg = randomFrom(EQUIPMENT_PACKAGES);
    this.draft.equipmentPackageId = pkg.id;
    this.draft.equipment = [...pkg.items];
    this.draft.credits = pkg.credits;

    // 8. Generate random name and details
    this.draft.name = generateRandomName();
    this.draft.species = 'Human';
    this.draft.homeworld = randomFrom([
      'Terra Nova', 'Kepler Prime', 'Axiom Station', 'New Shanghai',
      'Frontier 7', 'Olympus Mons', 'Cygnus IV', 'The Drift'
    ]);

    // Go to summary step
    this.draft.currentStep = 'summary';
  }

  // Restore draft to the snapshot taken when the current step was first entered
  resetCurrentStep() {
    const currentStep = this.draft.currentStep;
    const snapshotStr = this._stepSnapshots[currentStep];
    if (snapshotStr) {
      const snapshot = JSON.parse(snapshotStr) as CharacterDraft;
      snapshot.currentStep = currentStep;
      this.draft = snapshot;
      // Clear snapshot so re-entering re-snapshots fresh
      delete this._stepSnapshots[currentStep];
    }
  }

  // Reset
  reset() {
    this.draft = createInitialDraft();
    this.editingCharacterId = null;
    this._stepSnapshots = {};
  }
}

export const characterStore = new CharacterStore();
