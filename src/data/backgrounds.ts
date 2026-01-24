import type { Background } from '$types/character';

export const BACKGROUNDS: Background[] = [
  {
    id: 'barbarian',
    name: 'Barbarian',
    description: 'You were raised in a primitive world or among a group that rejected advanced technology. You know how to survive with little more than your wits and a sharp blade.',
    freeSkill: 'survive',
    quickSkills: ['survive', 'notice', 'any-combat'],
    growthTable: [
      { roll: 1, result: '+1 Any Stat', type: 'attribute', attributeType: 'any', value: 1 },
      { roll: 2, result: '+2 Physical', type: 'attribute', attributeType: 'physical', value: 2 },
      { roll: 3, result: '+2 Physical', type: 'attribute', attributeType: 'physical', value: 2 },
      { roll: 4, result: '+2 Mental', type: 'attribute', attributeType: 'mental', value: 2 },
      { roll: 5, result: 'Exert', type: 'skill', value: 'exert' },
      { roll: 6, result: 'Any Skill', type: 'any_skill' }
    ],
    learningTable: ['any-combat', 'connect', 'exert', 'lead', 'notice', 'punch', 'sneak', 'survive']
  },
  {
    id: 'clergy',
    name: 'Clergy',
    description: 'You were a priest, monk, nun, or other religious official, trained in the teachings of your faith and experienced in dealing with both the faithful and the skeptical.',
    freeSkill: 'talk',
    quickSkills: ['talk', 'perform', 'know'],
    growthTable: [
      { roll: 1, result: '+1 Any Stat', type: 'attribute', attributeType: 'any', value: 1 },
      { roll: 2, result: '+2 Mental', type: 'attribute', attributeType: 'mental', value: 2 },
      { roll: 3, result: '+2 Physical', type: 'attribute', attributeType: 'physical', value: 2 },
      { roll: 4, result: '+2 Mental', type: 'attribute', attributeType: 'mental', value: 2 },
      { roll: 5, result: 'Connect', type: 'skill', value: 'connect' },
      { roll: 6, result: 'Any Skill', type: 'any_skill' }
    ],
    learningTable: ['administer', 'connect', 'know', 'lead', 'notice', 'perform', 'talk', 'any-combat']
  },
  {
    id: 'colonist',
    name: 'Colonist',
    description: 'You were raised on a colony world, learning the practical skills needed to help a new settlement survive and thrive on an alien world.',
    freeSkill: 'survive',
    quickSkills: ['survive', 'fix', 'exert'],
    growthTable: [
      { roll: 1, result: '+1 Any Stat', type: 'attribute', attributeType: 'any', value: 1 },
      { roll: 2, result: '+2 Physical', type: 'attribute', attributeType: 'physical', value: 2 },
      { roll: 3, result: '+2 Physical', type: 'attribute', attributeType: 'physical', value: 2 },
      { roll: 4, result: '+2 Mental', type: 'attribute', attributeType: 'mental', value: 2 },
      { roll: 5, result: 'Exert', type: 'skill', value: 'exert' },
      { roll: 6, result: 'Any Skill', type: 'any_skill' }
    ],
    learningTable: ['administer', 'connect', 'exert', 'fix', 'notice', 'pilot', 'survive', 'trade']
  },
  {
    id: 'criminal',
    name: 'Criminal',
    description: 'You were raised in the underworld, learning how to survive among thieves, smugglers, and worse. Your moral education may have been lacking, but your practical skills are considerable.',
    freeSkill: 'sneak',
    quickSkills: ['sneak', 'connect', 'talk'],
    growthTable: [
      { roll: 1, result: '+1 Any Stat', type: 'attribute', attributeType: 'any', value: 1 },
      { roll: 2, result: '+2 Mental', type: 'attribute', attributeType: 'mental', value: 2 },
      { roll: 3, result: '+2 Physical', type: 'attribute', attributeType: 'physical', value: 2 },
      { roll: 4, result: '+2 Mental', type: 'attribute', attributeType: 'mental', value: 2 },
      { roll: 5, result: 'Connect', type: 'skill', value: 'connect' },
      { roll: 6, result: 'Any Skill', type: 'any_skill' }
    ],
    learningTable: ['administer', 'any-combat', 'connect', 'notice', 'program', 'sneak', 'talk', 'trade']
  },
  {
    id: 'dilettante',
    name: 'Dilettante',
    description: 'You were born to wealth and privilege, and spent your youth in idle amusement and casual study. You might be an aristocrat, a trust fund child, or simply lucky.',
    freeSkill: 'connect',
    quickSkills: ['connect', 'know', 'talk'],
    growthTable: [
      { roll: 1, result: '+1 Any Stat', type: 'attribute', attributeType: 'any', value: 1 },
      { roll: 2, result: '+2 Mental', type: 'attribute', attributeType: 'mental', value: 2 },
      { roll: 3, result: '+2 Mental', type: 'attribute', attributeType: 'mental', value: 2 },
      { roll: 4, result: '+2 Mental', type: 'attribute', attributeType: 'mental', value: 2 },
      { roll: 5, result: 'Connect', type: 'skill', value: 'connect' },
      { roll: 6, result: 'Any Skill', type: 'any_skill' }
    ],
    learningTable: ['any-combat', 'connect', 'know', 'notice', 'perform', 'pilot', 'talk', 'trade']
  },
  {
    id: 'entertainer',
    name: 'Entertainer',
    description: 'You were a performer of some kind: actor, musician, comedian, or other artist. You know how to work a crowd and create memorable experiences.',
    freeSkill: 'perform',
    quickSkills: ['perform', 'talk', 'connect'],
    growthTable: [
      { roll: 1, result: '+1 Any Stat', type: 'attribute', attributeType: 'any', value: 1 },
      { roll: 2, result: '+2 Mental', type: 'attribute', attributeType: 'mental', value: 2 },
      { roll: 3, result: '+2 Mental', type: 'attribute', attributeType: 'mental', value: 2 },
      { roll: 4, result: '+2 Physical', type: 'attribute', attributeType: 'physical', value: 2 },
      { roll: 5, result: 'Perform', type: 'skill', value: 'perform' },
      { roll: 6, result: 'Any Skill', type: 'any_skill' }
    ],
    learningTable: ['any-combat', 'connect', 'exert', 'notice', 'perform', 'sneak', 'talk', 'any-skill']
  },
  {
    id: 'merchant',
    name: 'Merchant',
    description: 'You were involved in trade, whether as a shop owner, a traveling merchant, or a corporate trader. You know how money moves and how to make it move your way.',
    freeSkill: 'trade',
    quickSkills: ['trade', 'talk', 'connect'],
    growthTable: [
      { roll: 1, result: '+1 Any Stat', type: 'attribute', attributeType: 'any', value: 1 },
      { roll: 2, result: '+2 Mental', type: 'attribute', attributeType: 'mental', value: 2 },
      { roll: 3, result: '+2 Mental', type: 'attribute', attributeType: 'mental', value: 2 },
      { roll: 4, result: '+2 Mental', type: 'attribute', attributeType: 'mental', value: 2 },
      { roll: 5, result: 'Trade', type: 'skill', value: 'trade' },
      { roll: 6, result: 'Any Skill', type: 'any_skill' }
    ],
    learningTable: ['administer', 'any-combat', 'connect', 'fix', 'know', 'notice', 'talk', 'trade']
  },
  {
    id: 'noble',
    name: 'Noble',
    description: 'Many planets are ruled by a class of nobles, and your hero was a member of one such exalted group. Such planets are often worlds of exquisite courtesy allied with utterly remorseless violence.',
    freeSkill: 'lead',
    quickSkills: ['lead', 'connect', 'administer'],
    growthTable: [
      { roll: 1, result: '+1 Any Stat', type: 'attribute', attributeType: 'any', value: 1 },
      { roll: 2, result: '+2 Mental', type: 'attribute', attributeType: 'mental', value: 2 },
      { roll: 3, result: '+2 Mental', type: 'attribute', attributeType: 'mental', value: 2 },
      { roll: 4, result: '+2 Mental', type: 'attribute', attributeType: 'mental', value: 2 },
      { roll: 5, result: 'Lead', type: 'skill', value: 'lead' },
      { roll: 6, result: 'Any Skill', type: 'any_skill' }
    ],
    learningTable: ['administer', 'any-combat', 'connect', 'know', 'lead', 'notice', 'pilot', 'talk']
  },
  {
    id: 'official',
    name: 'Official',
    description: 'You were a government official or bureaucrat, experienced in navigating the halls of power and getting things done through proper channels.',
    freeSkill: 'administer',
    quickSkills: ['administer', 'talk', 'connect'],
    growthTable: [
      { roll: 1, result: '+1 Any Stat', type: 'attribute', attributeType: 'any', value: 1 },
      { roll: 2, result: '+2 Mental', type: 'attribute', attributeType: 'mental', value: 2 },
      { roll: 3, result: '+2 Mental', type: 'attribute', attributeType: 'mental', value: 2 },
      { roll: 4, result: '+2 Mental', type: 'attribute', attributeType: 'mental', value: 2 },
      { roll: 5, result: 'Administer', type: 'skill', value: 'administer' },
      { roll: 6, result: 'Any Skill', type: 'any_skill' }
    ],
    learningTable: ['administer', 'any-combat', 'connect', 'know', 'lead', 'notice', 'talk', 'trade']
  },
  {
    id: 'peasant',
    name: 'Peasant',
    description: 'You were raised as a simple farmer, laborer, or other common worker. Life was hard, but it taught you endurance and practical wisdom.',
    freeSkill: 'exert',
    quickSkills: ['exert', 'sneak', 'survive'],
    growthTable: [
      { roll: 1, result: '+1 Any Stat', type: 'attribute', attributeType: 'any', value: 1 },
      { roll: 2, result: '+2 Physical', type: 'attribute', attributeType: 'physical', value: 2 },
      { roll: 3, result: '+2 Physical', type: 'attribute', attributeType: 'physical', value: 2 },
      { roll: 4, result: '+2 Physical', type: 'attribute', attributeType: 'physical', value: 2 },
      { roll: 5, result: 'Exert', type: 'skill', value: 'exert' },
      { roll: 6, result: 'Any Skill', type: 'any_skill' }
    ],
    learningTable: ['connect', 'exert', 'fix', 'notice', 'sneak', 'survive', 'trade', 'work']
  },
  {
    id: 'physician',
    name: 'Physician',
    description: 'You were trained as a doctor, medic, or other healer. You know how to treat wounds and illness, and have experience with the fragility of life.',
    freeSkill: 'heal',
    quickSkills: ['heal', 'know', 'notice'],
    growthTable: [
      { roll: 1, result: '+1 Any Stat', type: 'attribute', attributeType: 'any', value: 1 },
      { roll: 2, result: '+2 Physical', type: 'attribute', attributeType: 'physical', value: 2 },
      { roll: 3, result: '+2 Mental', type: 'attribute', attributeType: 'mental', value: 2 },
      { roll: 4, result: '+2 Mental', type: 'attribute', attributeType: 'mental', value: 2 },
      { roll: 5, result: 'Heal', type: 'skill', value: 'heal' },
      { roll: 6, result: 'Any Skill', type: 'any_skill' }
    ],
    learningTable: ['administer', 'connect', 'fix', 'heal', 'know', 'notice', 'talk', 'trade']
  },
  {
    id: 'pilot',
    name: 'Pilot',
    description: 'You were trained to fly spacecraft, aircraft, or other vehicles. You know how machines work and how to push them to their limits.',
    freeSkill: 'pilot',
    quickSkills: ['pilot', 'fix', 'shoot'],
    growthTable: [
      { roll: 1, result: '+1 Any Stat', type: 'attribute', attributeType: 'any', value: 1 },
      { roll: 2, result: '+2 Physical', type: 'attribute', attributeType: 'physical', value: 2 },
      { roll: 3, result: '+2 Physical', type: 'attribute', attributeType: 'physical', value: 2 },
      { roll: 4, result: '+2 Mental', type: 'attribute', attributeType: 'mental', value: 2 },
      { roll: 5, result: 'Pilot', type: 'skill', value: 'pilot' },
      { roll: 6, result: 'Any Skill', type: 'any_skill' }
    ],
    learningTable: ['connect', 'exert', 'fix', 'notice', 'pilot', 'shoot', 'survive', 'trade']
  },
  {
    id: 'politician',
    name: 'Politician',
    description: 'You were involved in the political arena, whether as an elected official, a party operative, or a professional lobbyist. You know how power works.',
    freeSkill: 'talk',
    quickSkills: ['talk', 'lead', 'connect'],
    growthTable: [
      { roll: 1, result: '+1 Any Stat', type: 'attribute', attributeType: 'any', value: 1 },
      { roll: 2, result: '+2 Mental', type: 'attribute', attributeType: 'mental', value: 2 },
      { roll: 3, result: '+2 Mental', type: 'attribute', attributeType: 'mental', value: 2 },
      { roll: 4, result: '+2 Mental', type: 'attribute', attributeType: 'mental', value: 2 },
      { roll: 5, result: 'Talk', type: 'skill', value: 'talk' },
      { roll: 6, result: 'Any Skill', type: 'any_skill' }
    ],
    learningTable: ['administer', 'connect', 'any-combat', 'lead', 'notice', 'perform', 'talk', 'trade']
  },
  {
    id: 'scholar',
    name: 'Scholar',
    description: 'You were trained in academic pursuits, whether as a scientist, historian, philosopher, or other intellectual. You value knowledge and understanding.',
    freeSkill: 'know',
    quickSkills: ['know', 'connect', 'administer'],
    growthTable: [
      { roll: 1, result: '+1 Any Stat', type: 'attribute', attributeType: 'any', value: 1 },
      { roll: 2, result: '+2 Mental', type: 'attribute', attributeType: 'mental', value: 2 },
      { roll: 3, result: '+2 Mental', type: 'attribute', attributeType: 'mental', value: 2 },
      { roll: 4, result: '+2 Mental', type: 'attribute', attributeType: 'mental', value: 2 },
      { roll: 5, result: 'Know', type: 'skill', value: 'know' },
      { roll: 6, result: 'Any Skill', type: 'any_skill' }
    ],
    learningTable: ['administer', 'connect', 'fix', 'know', 'notice', 'perform', 'program', 'talk']
  },
  {
    id: 'soldier',
    name: 'Soldier',
    description: 'You were trained as a professional warrior, whether in a planetary army, a mercenary company, or a private security force. You know how to fight and how to survive.',
    freeSkill: 'any-combat',
    quickSkills: ['any-combat', 'exert', 'survive'],
    growthTable: [
      { roll: 1, result: '+1 Any Stat', type: 'attribute', attributeType: 'any', value: 1 },
      { roll: 2, result: '+2 Physical', type: 'attribute', attributeType: 'physical', value: 2 },
      { roll: 3, result: '+2 Physical', type: 'attribute', attributeType: 'physical', value: 2 },
      { roll: 4, result: '+2 Physical', type: 'attribute', attributeType: 'physical', value: 2 },
      { roll: 5, result: 'Any Combat', type: 'any_combat' },
      { roll: 6, result: 'Any Skill', type: 'any_skill' }
    ],
    learningTable: ['administer', 'any-combat', 'exert', 'fix', 'lead', 'notice', 'sneak', 'survive']
  },
  {
    id: 'spacer',
    name: 'Spacer',
    description: 'You grew up in the void between worlds, on a space station or starship. You know the dangers of the black and how to survive them.',
    freeSkill: 'fix',
    quickSkills: ['fix', 'pilot', 'program'],
    growthTable: [
      { roll: 1, result: '+1 Any Stat', type: 'attribute', attributeType: 'any', value: 1 },
      { roll: 2, result: '+2 Physical', type: 'attribute', attributeType: 'physical', value: 2 },
      { roll: 3, result: '+2 Mental', type: 'attribute', attributeType: 'mental', value: 2 },
      { roll: 4, result: '+2 Mental', type: 'attribute', attributeType: 'mental', value: 2 },
      { roll: 5, result: 'Fix', type: 'skill', value: 'fix' },
      { roll: 6, result: 'Any Skill', type: 'any_skill' }
    ],
    learningTable: ['administer', 'connect', 'exert', 'fix', 'know', 'pilot', 'program', 'talk']
  },
  {
    id: 'technician',
    name: 'Technician',
    description: 'You were trained in the maintenance and repair of technology, from simple tools to advanced computers. You understand how machines work.',
    freeSkill: 'fix',
    quickSkills: ['fix', 'exert', 'notice'],
    growthTable: [
      { roll: 1, result: '+1 Any Stat', type: 'attribute', attributeType: 'any', value: 1 },
      { roll: 2, result: '+2 Physical', type: 'attribute', attributeType: 'physical', value: 2 },
      { roll: 3, result: '+2 Mental', type: 'attribute', attributeType: 'mental', value: 2 },
      { roll: 4, result: '+2 Mental', type: 'attribute', attributeType: 'mental', value: 2 },
      { roll: 5, result: 'Fix', type: 'skill', value: 'fix' },
      { roll: 6, result: 'Any Skill', type: 'any_skill' }
    ],
    learningTable: ['administer', 'connect', 'exert', 'fix', 'know', 'notice', 'pilot', 'program']
  },
  {
    id: 'thug',
    name: 'Thug',
    description: 'You were muscle for someone, whether a criminal gang, a security company, or a private employer. You know how to intimidate people and break things.',
    freeSkill: 'any-combat',
    quickSkills: ['any-combat', 'connect', 'talk'],
    growthTable: [
      { roll: 1, result: '+1 Any Stat', type: 'attribute', attributeType: 'any', value: 1 },
      { roll: 2, result: '+2 Physical', type: 'attribute', attributeType: 'physical', value: 2 },
      { roll: 3, result: '+2 Physical', type: 'attribute', attributeType: 'physical', value: 2 },
      { roll: 4, result: '+2 Mental', type: 'attribute', attributeType: 'mental', value: 2 },
      { roll: 5, result: 'Any Combat', type: 'any_combat' },
      { roll: 6, result: 'Any Skill', type: 'any_skill' }
    ],
    learningTable: ['any-combat', 'connect', 'exert', 'notice', 'sneak', 'stab', 'talk', 'trade']
  },
  {
    id: 'vagabond',
    name: 'Vagabond',
    description: 'You spent your life wandering from place to place, never settling down. You learned to live by your wits and take opportunities where you found them.',
    freeSkill: 'survive',
    quickSkills: ['survive', 'sneak', 'notice'],
    growthTable: [
      { roll: 1, result: '+1 Any Stat', type: 'attribute', attributeType: 'any', value: 1 },
      { roll: 2, result: '+2 Physical', type: 'attribute', attributeType: 'physical', value: 2 },
      { roll: 3, result: '+2 Physical', type: 'attribute', attributeType: 'physical', value: 2 },
      { roll: 4, result: '+2 Mental', type: 'attribute', attributeType: 'mental', value: 2 },
      { roll: 5, result: 'Survive', type: 'skill', value: 'survive' },
      { roll: 6, result: 'Any Skill', type: 'any_skill' }
    ],
    learningTable: ['any-combat', 'connect', 'notice', 'perform', 'pilot', 'sneak', 'survive', 'work']
  },
  {
    id: 'worker',
    name: 'Worker',
    description: 'You were a laborer of some kind: factory worker, miner, construction worker, or other hands-on profession. Hard work taught you endurance and practical skills.',
    freeSkill: 'work',
    quickSkills: ['work', 'connect', 'exert'],
    growthTable: [
      { roll: 1, result: '+1 Any Stat', type: 'attribute', attributeType: 'any', value: 1 },
      { roll: 2, result: '+2 Physical', type: 'attribute', attributeType: 'physical', value: 2 },
      { roll: 3, result: '+2 Physical', type: 'attribute', attributeType: 'physical', value: 2 },
      { roll: 4, result: '+2 Physical', type: 'attribute', attributeType: 'physical', value: 2 },
      { roll: 5, result: 'Work', type: 'skill', value: 'work' },
      { roll: 6, result: 'Any Skill', type: 'any_skill' }
    ],
    learningTable: ['administer', 'connect', 'exert', 'fix', 'pilot', 'program', 'work', 'any-skill']
  }
];

export function getBackgroundById(id: string): Background | undefined {
  return BACKGROUNDS.find(b => b.id === id);
}
