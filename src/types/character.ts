// Core character types for Stars Without Number

export interface Attributes {
  strength: number;
  dexterity: number;
  constitution: number;
  intelligence: number;
  wisdom: number;
  charisma: number;
}

export type AttributeKey = keyof Attributes;

export interface AttributeModifiers {
  strength: number;
  dexterity: number;
  constitution: number;
  intelligence: number;
  wisdom: number;
  charisma: number;
}

export interface Background {
  id: string;
  name: string;
  description: string;
  freeSkill: string;
  quickSkills: string[];
  growthTable: GrowthEntry[];
  learningTable: string[];
}

export interface GrowthEntry {
  roll: number;
  result: string;
  type: 'skill' | 'attribute' | 'any_skill' | 'any_combat';
  value?: string | number;
  attributeType?: 'physical' | 'mental' | 'any';
}

export type ClassName = 'expert' | 'warrior' | 'psychic' | 'adventurer';
export type PartialClass = 'partial-expert' | 'partial-warrior' | 'partial-psychic';

export interface CharacterClass {
  id: ClassName;
  name: string;
  description: string;
  hitDie: string;
  attackBonus: number[];
  abilities: string[];
  bonusFocus?: 'combat' | 'non-combat';
}

export interface Focus {
  id: string;
  name: string;
  type: 'combat' | 'non-combat' | 'psychic' | 'origin';
  description: string;
  level1: FocusLevel;
  level2?: FocusLevel;
  // Origin focus fields
  originType?: 'robot' | 'alien';
  alienFeatures?: AlienFeature[];
}

export interface FocusLevel {
  description: string;
  bonusSkill?: string;
  bonusSkillChoices?: string[];
  abilities: string[];
}

export interface AlienFeature {
  id: string;
  name: string;
  description: string;
  isMajor: boolean; // major benefits count as 1, minor as 0.5
}

export interface Skill {
  id: string;
  name: string;
  attribute: AttributeKey | [AttributeKey, AttributeKey];
  isPsychic: boolean;
  description: string;
}

export interface SkillRank {
  skillId: string;
  rank: number; // -1 (untrained), 0, 1, 2, 3, 4
}

export interface PsychicDiscipline {
  id: string;
  name: string;
  skill: string;
  description: string;
  coreTechnique: PsychicTechnique;
  techniques: PsychicTechnique[];
}

export interface PsychicTechnique {
  id: string;
  name: string;
  level: number;
  cost: string;
  description: string;
  isCore?: boolean;
}

export interface Equipment {
  id: string;
  name: string;
  type: 'weapon' | 'armor' | 'gear' | 'cybernetics';
  cost: number;
  encumbrance: number;
  description: string;
  damage?: string;
  armorClass?: number;
  techLevel: number;
}

export interface EquipmentPackage {
  id: string;
  name: string;
  description: string;
  items: string[];
  credits: number;
}

export type ItemLocation = 'readied' | 'stowed' | 'stored';

export interface InventoryItem {
  itemId: string;
  location: ItemLocation;
  quantity: number;
  // Custom item fields (when itemId starts with 'custom-')
  customName?: string;
  customCategory?: 'weapon' | 'armor' | 'gear';
  customEncumbrance?: number;
  customDamage?: string;
  customArmorClass?: number;
}

export interface SavingThrows {
  physical: number;
  evasion: number;
  mental: number;
}

// Main character interface
export interface Character {
  id: string;
  name: string;
  homeworld: string;
  species: string;
  employer: string;
  goals: string;
  notes: string;
  
  // Core stats
  level: number;
  experience: number;
  attributes: Attributes;
  
  // Class and background
  backgroundId: string;
  classId: ClassName;
  partialClasses?: [PartialClass, PartialClass]; // For Adventurer
  
  // Skills and abilities
  skills: SkillRank[];
  foci: { focusId: string; level: 1 | 2 }[];
  alienFeatures?: string[]; // IDs of selected alien features
  robotType?: string; // 'android' | 'worker-bot' | 'vehicle-bot'
  robotAttributeBonus?: string; // AttributeKey for Worker Bot +1 modifier bonus

  // Psychic (if applicable)
  psychicDisciplines?: string[];
  psychicTechniques?: string[];
  effortMax?: number;
  effortCurrent?: number;
  
  // Combat stats
  hitPointsMax: number;
  hitPointsCurrent: number;
  attackBonus: number;
  armorClass: number;
  
  // Equipment
  equipment: string[];
  inventory: InventoryItem[];
  credits: number;
  
  // Derived
  savingThrows: SavingThrows;
  
  // Level-up history
  levelUpHistory: LevelUpRecord[];

  // Metadata
  createdAt: string;
  updatedAt: string;
}

// Character creation state
export type CreationStep =
  | 'attributes'
  | 'background'
  | 'backgroundSkills'
  | 'class'
  | 'foci'
  | 'skills'
  | 'psychic'
  | 'hitpoints'
  | 'equipment'
  | 'details'
  | 'summary';

export interface CharacterDraft {
  currentStep: CreationStep;
  attributes: Partial<Attributes>;
  attributeMethod: 'random' | 'array' | 'random-reorder' | 'custom';
  replacedAttribute?: AttributeKey;
  
  backgroundId?: string;
  freeSkillChoice?: string;
  backgroundSkillMethod: 'roll' | 'pick';
  growthRolls: number[];
  learningRolls: number[];
  pickedSkills: string[];
  
  classId?: ClassName;
  partialClasses?: [PartialClass, PartialClass];
  
  selectedFoci: { focusId: string; level: 1 | 2 }[];
  alienFeatures: string[]; // IDs of selected alien features for Alien Origin focus
  robotType?: string; // 'android' | 'worker-bot' | 'vehicle-bot'
  robotAttributeBonus?: string; // AttributeKey for Worker Bot +1 modifier bonus

  skills: SkillRank[];
  hobbySkill?: string;
  
  psychicDisciplines: string[];
  psychicTechniques: string[];
  
  hitPoints?: number;
  hitPointRoll?: number;
  
  equipmentPackageId?: string;
  equipment: string[];
  credits: number;
  
  name: string;
  homeworld: string;
  species: string;
  employer: string;
  goals: string;
  notes: string;
}

export interface LevelUpRecord {
  fromLevel: number;
  toLevel: number;
  hpRoll: number;        // raw die roll
  hpGained: number;      // after modifiers, minimum 1
  skillPointsSpent: { skillId: string; fromRank: number; toRank: number }[];
  focusGained?: { focusId: string; level: 1 | 2 };
  bonusFocusGained?: { focusId: string; level: 1 | 2 }; // warrior/expert bonus focus at even levels
  techniqueGained?: string; // technique ID for psychics
  timestamp: string;
}

// Utility types
export interface DiceRoll {
  dice: number;
  sides: number;
  modifier?: number;
  results: number[];
  total: number;
}
