import { get, set, del, keys } from 'idb-keyval';
import type { Character, CharacterDraft, CreationStep, Attributes, AttributeKey, SkillRank } from '$types/character';
import { rollAllAttributes, createEmptyAttributes, getAttributeModifier } from '$data/attributes';
import { getBackgroundById } from '$data/backgrounds';

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

  // Step navigation
  readonly steps: CreationStep[] = [
    'attributes',
    'background', 
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
      
      case 'background':
        return !!this.draft.backgroundId;
      
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
      this.draft.currentStep = this.steps[nextIndex];
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
      this.draft.currentStep = this.steps[Math.max(0, prevIndex)];
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
    // Reset background-related skills
    this.draft.growthRolls = [];
    this.draft.learningRolls = [];
    this.draft.pickedSkills = [];
    
    // Add free skill from background
    const background = getBackgroundById(backgroundId);
    if (background) {
      this.addSkill(background.freeSkill, 0);
    }
  }

  // Skill actions
  addSkill(skillId: string, rank: number = 0) {
    const existing = this.draft.skills.find(s => s.skillId === skillId);
    if (existing) {
      existing.rank = Math.max(existing.rank, rank);
    } else {
      this.draft.skills.push({ skillId, rank });
    }
  }

  setHobbySkill(skillId: string) {
    this.draft.hobbySkill = skillId;
    this.addSkill(skillId, 0);
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
    }
  }

  removeFocus(focusId: string) {
    this.draft.selectedFoci = this.draft.selectedFoci.filter(f => f.focusId !== focusId);
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
    
    return {
      id: crypto.randomUUID(),
      name: this.draft.name,
      homeworld: this.draft.homeworld,
      species: this.draft.species,
      employer: this.draft.employer,
      goals: this.draft.goals,
      notes: this.draft.notes,
      
      level: 1,
      experience: 0,
      attributes: this.draft.attributes as Attributes,
      
      backgroundId: this.draft.backgroundId!,
      classId: this.draft.classId!,
      partialClasses: this.draft.partialClasses,
      
      skills: this.draft.skills,
      foci: this.draft.selectedFoci,
      
      psychicDisciplines: this.draft.psychicDisciplines,
      psychicTechniques: this.draft.psychicTechniques,
      effortMax: this.calculateMaxEffort(),
      effortCurrent: this.calculateMaxEffort(),
      
      hitPointsMax: this.draft.hitPoints || 1,
      hitPointsCurrent: this.draft.hitPoints || 1,
      attackBonus: this.calculateAttackBonus(),
      armorClass: 10 + dexMod,
      
      equipment: this.draft.equipment,
      credits: this.draft.credits,
      
      savingThrows: {
        physical: 15 - 1 - Math.max(strMod, conMod),
        evasion: 15 - 1 - Math.max(intMod, dexMod),
        mental: 15 - 1 - Math.max(wisMod, chaMod)
      },
      
      createdAt: now,
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
      await set(`character-${character.id}`, character);
      this.savedCharacters = [...this.savedCharacters.filter(c => c.id !== character.id), character];
    } catch (e) {
      this.error = 'Failed to save character';
      console.error(e);
    } finally {
      this.isLoading = false;
    }
  }

  async loadCharacters() {
    try {
      this.isLoading = true;
      const allKeys = await keys();
      const characterKeys = allKeys.filter(k => String(k).startsWith('character-'));
      const characters: Character[] = [];
      
      for (const key of characterKeys) {
        const char = await get(key);
        if (char) characters.push(char as Character);
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
      await del(`character-${id}`);
      this.savedCharacters = this.savedCharacters.filter(c => c.id !== id);
    } catch (e) {
      this.error = 'Failed to delete character';
      console.error(e);
    }
  }

  // Reset
  reset() {
    this.draft = createInitialDraft();
  }
}

export const characterStore = new CharacterStore();
