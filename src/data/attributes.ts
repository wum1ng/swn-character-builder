import type { Attributes, AttributeKey, AttributeModifiers } from '$types/character';

export const ATTRIBUTE_NAMES: Record<AttributeKey, string> = {
  strength: 'Strength',
  dexterity: 'Dexterity',
  constitution: 'Constitution',
  intelligence: 'Intelligence',
  wisdom: 'Wisdom',
  charisma: 'Charisma'
};

export const ATTRIBUTE_DESCRIPTIONS: Record<AttributeKey, string> = {
  strength: 'Physical power, melee prowess, carrying capacity',
  dexterity: 'Speed, evasiveness, coordination, ranged combat',
  constitution: 'Hardiness, fortitude, survivability, hit points',
  intelligence: 'Memory, critical thinking, technical skills',
  wisdom: 'Perception, intuition, willpower, psychic ability',
  charisma: 'Leadership, charm, social influence'
};

export const PHYSICAL_ATTRIBUTES: AttributeKey[] = ['strength', 'dexterity', 'constitution'];
export const MENTAL_ATTRIBUTES: AttributeKey[] = ['intelligence', 'wisdom', 'charisma'];

export const STANDARD_ARRAY = [14, 12, 11, 10, 9, 7];

/**
 * Calculate attribute modifier using SWN rules
 * 3 = -2, 4-7 = -1, 8-13 = 0, 14-17 = +1, 18 = +2
 */
export function getAttributeModifier(score: number): number {
  if (score <= 3) return -2;
  if (score <= 7) return -1;
  if (score <= 13) return 0;
  if (score <= 17) return 1;
  return 2;
}

export function getAllModifiers(attributes: Attributes): AttributeModifiers {
  return {
    strength: getAttributeModifier(attributes.strength),
    dexterity: getAttributeModifier(attributes.dexterity),
    constitution: getAttributeModifier(attributes.constitution),
    intelligence: getAttributeModifier(attributes.intelligence),
    wisdom: getAttributeModifier(attributes.wisdom),
    charisma: getAttributeModifier(attributes.charisma)
  };
}

/**
 * Roll 3d6 for an attribute
 */
export function roll3d6(): { rolls: number[]; total: number } {
  const rolls = [
    Math.floor(Math.random() * 6) + 1,
    Math.floor(Math.random() * 6) + 1,
    Math.floor(Math.random() * 6) + 1
  ];
  return { rolls, total: rolls.reduce((a, b) => a + b, 0) };
}

/**
 * Roll all attributes using 3d6 method
 */
export function rollAllAttributes(): Attributes {
  return {
    strength: roll3d6().total,
    dexterity: roll3d6().total,
    constitution: roll3d6().total,
    intelligence: roll3d6().total,
    wisdom: roll3d6().total,
    charisma: roll3d6().total
  };
}

/**
 * Create empty/default attributes
 */
export function createEmptyAttributes(): Attributes {
  return {
    strength: 10,
    dexterity: 10,
    constitution: 10,
    intelligence: 10,
    wisdom: 10,
    charisma: 10
  };
}

/**
 * Format modifier for display (+1, -2, etc.)
 */
export function formatModifier(mod: number): string {
  if (mod >= 0) return `+${mod}`;
  return `${mod}`;
}
