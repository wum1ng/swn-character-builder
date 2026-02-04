import type { Skill, AttributeKey } from '$types/character';

export const SKILLS: Skill[] = [
  {
    id: 'administer',
    name: 'Administer',
    attribute: ['intelligence', 'charisma'],
    isPsychic: false,
    description: 'Manage an organization, handle paperwork, analyze records, and keep an institution functioning on a daily basis. Roll it for bureaucratic expertise, organizational management, legal knowledge, dealing with government agencies, and understanding how institutions really work.'
  },
  {
    id: 'connect',
    name: 'Connect',
    attribute: 'charisma',
    isPsychic: false,
    description: 'Find people who can be helpful to your purposes and get them to cooperate with you. Roll it to make useful connections with others, find people you know, know where to get illicit goods and services, and be familiar with foreign cultures and languages. You can use it in place of Talk for persuading people you find via this skill.'
  },
  {
    id: 'exert',
    name: 'Exert',
    attribute: ['strength', 'constitution'],
    isPsychic: false,
    description: 'Apply trained speed, strength, or stamina in some feat of physical exertion. Roll it to run, jump, lift, swim, climb, throw, and so forth. You can use it as a combat skill when throwing things, though it doesn\'t qualify as a combat skill for other ends.'
  },
  {
    id: 'fix',
    name: 'Fix',
    attribute: 'intelligence',
    isPsychic: false,
    description: 'Create and repair devices both simple and complex. How complex will depend on your character\'s background; a lostworlder blacksmith is going to need some study time before he\'s ready to fix that broken fusion reactor, though he can do it eventually. Roll it to fix things, build things, and identify what something is supposed to do.'
  },
  {
    id: 'heal',
    name: 'Heal',
    attribute: 'intelligence',
    isPsychic: false,
    description: 'Employ medical and psychological treatment for the injured or disturbed. Roll it to cure diseases, stabilize the critically injured, treat psychological disorders, or diagnose illnesses.'
  },
  {
    id: 'know',
    name: 'Know',
    attribute: 'intelligence',
    isPsychic: false,
    description: 'Know facts about academic or scientific fields. Roll it to understand planetary ecologies, remember relevant history, solve science mysteries, and know the basic facts about rare or esoteric topics.'
  },
  {
    id: 'lead',
    name: 'Lead',
    attribute: 'charisma',
    isPsychic: false,
    description: 'Convince others to also do whatever it is you\'re trying to do. Talk might persuade them that following you is smart, but Lead can make them do it even when they think it\'s a bad idea. Roll it to lead troops in combat, convince others to follow you, or maintain morale and discipline.'
  },
  {
    id: 'notice',
    name: 'Notice',
    attribute: 'wisdom',
    isPsychic: false,
    description: 'Spot anomalies or interesting facts about your environment. Roll it for searching places, detecting ambushes, spotting things, and reading the emotional state of other people.'
  },
  {
    id: 'perform',
    name: 'Perform',
    attribute: 'charisma',
    isPsychic: false,
    description: 'Exhibit some performative skill. Roll it to dance, sing, orate, act, or otherwise put on a convincing or emotionally moving performance.'
  },
  {
    id: 'pilot',
    name: 'Pilot',
    attribute: 'dexterity',
    isPsychic: false,
    description: 'Use this skill to pilot vehicles or ride beasts. Roll it to fly spaceships, drive vehicles, ride animals, or tend to basic vehicle repair. This skill doesn\'t help you with things entirely outside the scope of your background or experience, though with some practice a PC can expand their expertise.'
  },
  {
    id: 'program',
    name: 'Program',
    attribute: 'intelligence',
    isPsychic: false,
    description: 'Operating or hacking computing and communications hardware. Roll it to program or hack computers, control computer-operated hardware, operate communications tech, or decrypt things.'
  },
  {
    id: 'punch',
    name: 'Punch',
    attribute: ['strength', 'dexterity'],
    isPsychic: false,
    description: 'Use it as a combat skill when fighting unarmed. If your PC means to make a habit of this rather than as a recourse of desperation, you should take the Unarmed Fighter focus described later.'
  },
  {
    id: 'shoot',
    name: 'Shoot',
    attribute: 'dexterity',
    isPsychic: false,
    description: 'Use it as a combat skill when using ranged weaponry, whether hurled rocks, bows, laser pistols, combat rifles, or ship\'s gunnery.'
  },
  {
    id: 'sneak',
    name: 'Sneak',
    attribute: 'dexterity',
    isPsychic: false,
    description: 'Move without drawing notice. Roll it for stealth, disguise, infiltration, manual legerdemain, pickpocketing, and the defeat of security measures.'
  },
  {
    id: 'stab',
    name: 'Stab',
    attribute: ['strength', 'dexterity'],
    isPsychic: false,
    description: 'Use it as a combat skill when wielding melee weapons, whether primitive or complex.'
  },
  {
    id: 'survive',
    name: 'Survive',
    attribute: ['constitution', 'wisdom'],
    isPsychic: false,
    description: 'Obtain the basics of food, water, and shelter in hostile environments, along with avoiding their natural perils. Roll it to handle animals, navigate difficult terrain, scrounge urban resources, make basic tools, and avoid wild beasts or gangs.'
  },
  {
    id: 'talk',
    name: 'Talk',
    attribute: 'charisma',
    isPsychic: false,
    description: 'Convince other people of the facts you want them to believe. What they do with that conviction may not be completely predictable. Roll it to persuade, charm, or deceive others in conversation.'
  },
  {
    id: 'trade',
    name: 'Trade',
    attribute: 'charisma',
    isPsychic: false,
    description: 'Find what you need on the market and sell what you have. Roll it to sell or buy things, figure out where to purchase hard-to-get or illicit goods, deal with customs agents, or run a business.'
  },
  {
    id: 'work',
    name: 'Work',
    attribute: ['strength', 'dexterity'],
    isPsychic: false,
    description: 'This is a catch-all skill for professions not represented by other skills. Roll it to work at a particular profession, art, or trade.'
  },
  // Psychic Skills
  {
    id: 'biopsionics',
    name: 'Biopsionics',
    attribute: ['constitution', 'wisdom'],
    isPsychic: true,
    description: 'Master powers of physical repair, body augmentation, and shapeshifting. Biopsionic powers repair, augment, debilitate, or damage living creatures. The biopsionicist must be able to touch a target, though clothing and armor do not interfere. Touching a resisting target requires a Punch hit roll with a bonus equal to the practitioner\'s Biopsionics skill.'
  },
  {
    id: 'metapsionics',
    name: 'Metapsionics',
    attribute: 'wisdom',
    isPsychic: true,
    description: 'Master powers that nullify, boost, and shape the use of other psychic abilities. A metapsion controls psychic energy itself, molding and shaping the flows of energy. Taken in isolation, metapsionics allows a psychic to increase the raw Effort available to them and become more flexible in how this Effort is used. Expert metapsions can even teach other potential psychics how to control and channel their new abilities.'
  },
  {
    id: 'precognition',
    name: 'Precognition',
    attribute: 'wisdom',
    isPsychic: true,
    description: 'Master the ability to sense future events and control probability. Relates to sensing the cascade of future events and reading the achronal chaos of the metadimensional energy that ripples in the psychic\'s brain. Readings tend to be focused on the psychic and what they find interesting or important. More advanced techniques can even influence the future, adjusting probabilities by changing or pruning certain metadimensional currents.'
  },
  {
    id: 'telekinesis',
    name: 'Telekinesis',
    attribute: ['constitution', 'wisdom'],
    isPsychic: true,
    description: 'Master the remote control of kinetic energy to move objects and fabricate force constructs. Telekinetic powers are strong but somewhat imprecise. The force generated is usually invisible, though a psychic can allow a visible glow if desired. Objects being held or worn by a mobile creature cannot normally be manipulated by telekinesis, nor can unwilling intelligent targets be directly manipulated.'
  },
  {
    id: 'telepathy',
    name: 'Telepathy',
    attribute: ['charisma', 'wisdom'],
    isPsychic: true,
    description: 'Master the reading and influencing of other sapient minds. There is no psychic power more threatening and disturbing to normal humanity than that of telepathy. The prospect of having one\'s innermost thoughts and secrets pried out by imperceptible means is deeply troubling to most men and women. Almost all worlds forbid the uninvited use of telepathic powers on another person.'
  },
  {
    id: 'teleportation',
    name: 'Teleportation',
    attribute: ['constitution', 'wisdom'],
    isPsychic: true,
    description: 'Master the arts of physical translocation of yourself and allies. An experienced teleporter can reach or see into any location they\'ve ever been; security officials don\'t just need to make sure that no teleporter is in a restricted area, but that they\'ve never been there before at any time.'
  }
];

export const COMBAT_SKILLS = ['punch', 'shoot', 'stab'];
export const PSYCHIC_SKILLS = ['biopsionics', 'metapsionics', 'precognition', 'telekinesis', 'telepathy', 'teleportation'];
export const NON_COMBAT_SKILLS = SKILLS.filter(s => !COMBAT_SKILLS.includes(s.id) && !s.isPsychic).map(s => s.id);

export function getSkillById(id: string): Skill | undefined {
  return SKILLS.find(s => s.id === id);
}

export function isSkillCombat(skillId: string): boolean {
  return COMBAT_SKILLS.includes(skillId);
}

export function isSkillPsychic(skillId: string): boolean {
  return PSYCHIC_SKILLS.includes(skillId);
}

/**
 * Get the relevant attribute(s) for a skill check
 */
export function getSkillAttribute(skillId: string): AttributeKey | [AttributeKey, AttributeKey] | undefined {
  const skill = getSkillById(skillId);
  return skill?.attribute;
}

/**
 * Skill ranks and their descriptions
 * -1: Untrained
 * 0: Trained (basic competence)
 * 1: Competent
 * 2: Skilled
 * 3: Expert
 * 4: Master
 */
export const SKILL_RANK_DESCRIPTIONS: Record<number, string> = {
  [-1]: 'Untrained - No formal training',
  0: 'Level 0 - Basic competence',
  1: 'Level 1 - Competent professional',
  2: 'Level 2 - Veteran practitioner',
  3: 'Level 3 - Distinguished expert',
  4: 'Level 4 - Superlative master'
};
