import type { CharacterClass, ClassName } from '$types/character';

export const CLASSES: CharacterClass[] = [
  {
    id: 'expert',
    name: 'Expert',
    description: 'Experts are masters of a particular field, whether that be hacking, medicine, diplomacy, or any other non-combat skill. They can accomplish feats of skill that others cannot match.',
    hitDie: '1d6',
    attackBonus: [0, 0, 1, 1, 1, 2, 2, 2, 3, 3, 3],
    abilities: [
      'Once per scene, reroll a failed skill check that is not a combat skill check.',
      'Gain a non-combat focus as a bonus focus at first level.',
      'When you advance a level, gain a bonus skill point that must be spent on a non-combat, non-psychic skill.'
    ],
    bonusFocus: 'non-combat'
  },
  {
    id: 'warrior',
    name: 'Warrior',
    description: 'Warriors are masters of combat, trained to fight with weapons and survive the deadliest battlefields. They are the most capable combatants in the game.',
    hitDie: '1d6+2',
    attackBonus: [1, 1, 2, 2, 3, 3, 4, 4, 5, 5, 6],
    abilities: [
      'Once per scene, the warrior may automatically negate a successful combat hit against them, turning it into a miss.',
      'Gain a combat focus as a bonus focus at first level.',
      'Warriors roll 1d6+2 for hit points, and add +2 to their Constitution modifier (if any) for this purpose.'
    ],
    bonusFocus: 'combat'
  },
  {
    id: 'psychic',
    name: 'Psychic',
    description: 'Psychics have developed their mental powers to an extraordinary degree. They can read minds, move objects with thought, heal injuries, and perform other remarkable feats.',
    hitDie: '1d6',
    attackBonus: [0, 0, 0, 0, 1, 1, 1, 1, 2, 2, 2],
    abilities: [
      'Psychics can learn and use psychic disciplines.',
      'Unlike other characters, Psychics can acquire psychic skills and techniques.',
      'Psychics have an Effort score equal to 1 plus their highest psychic skill level plus their Wisdom or Constitution modifier (whichever is better).'
    ]
  },
  {
    id: 'adventurer',
    name: 'Adventurer',
    description: 'Adventurers are jacks of all trades, combining abilities from two different classes. They are more versatile but less specialized than pure classes.',
    hitDie: '1d6 (or 1d6+2 with Partial Warrior)',
    attackBonus: [0, 0, 1, 1, 1, 2, 2, 2, 3, 3, 3], // Varies based on partial classes
    abilities: [
      'Choose two partial classes from: Partial Expert, Partial Warrior, or Partial Psychic.',
      'Gain the abilities of both partial classes.',
      'Your hit points and attack bonus depend on which partial classes you choose.'
    ]
  }
];

export interface PartialClassInfo {
  id: string;
  name: string;
  description: string;
  abilities: string[];
  bonusFocus?: 'combat' | 'non-combat';
  hpBonus?: number;
}

export const PARTIAL_CLASSES: PartialClassInfo[] = [
  {
    id: 'partial-expert',
    name: 'Partial Expert',
    description: 'Gain some of the versatility of an Expert.',
    abilities: [
      'Gain a non-combat focus as a bonus focus at first level.',
      'When you advance a level, you gain a bonus skill point that must be spent on a non-combat, non-psychic skill.'
    ],
    bonusFocus: 'non-combat'
  },
  {
    id: 'partial-warrior',
    name: 'Partial Warrior',
    description: 'Gain some of the combat prowess of a Warrior.',
    abilities: [
      'Gain a combat focus as a bonus focus at first level.',
      'Gain +1 to your hit point total at first level and every level thereafter.',
      'Your attack bonus improves slightly faster than other non-Warriors.'
    ],
    bonusFocus: 'combat',
    hpBonus: 2
  },
  {
    id: 'partial-psychic',
    name: 'Partial Psychic',
    description: 'Gain limited psychic abilities.',
    abilities: [
      'You can learn one psychic discipline.',
      'You can use psychic powers but are limited to one discipline.',
      'Your Effort is calculated as normal for a Psychic.'
    ]
  }
];

export const ADVENTURER_COMBINATIONS = [
  { id: 'expert-psychic', partials: ['partial-expert', 'partial-psychic'] as const, name: 'Expert/Psychic' },
  { id: 'expert-warrior', partials: ['partial-expert', 'partial-warrior'] as const, name: 'Expert/Warrior' },
  { id: 'psychic-warrior', partials: ['partial-psychic', 'partial-warrior'] as const, name: 'Psychic/Warrior' }
];

export function getClassById(id: ClassName): CharacterClass | undefined {
  return CLASSES.find(c => c.id === id);
}

export function getAttackBonus(classId: ClassName, level: number, partialClasses?: string[]): number {
  const cls = getClassById(classId);
  if (!cls) return 0;
  
  // Adjust for partial warrior
  if (classId === 'adventurer' && partialClasses?.includes('partial-warrior')) {
    // Partial warrior gets slightly better attack progression
    const partialWarriorBonus = [0, 0, 1, 1, 2, 2, 2, 3, 3, 3, 4];
    return partialWarriorBonus[Math.min(level, 10)];
  }
  
  return cls.attackBonus[Math.min(level, 10)];
}
