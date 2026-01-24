import type { Skill, AttributeKey } from '$types/character';

export const SKILLS: Skill[] = [
  {
    id: 'administer',
    name: 'Administer',
    attribute: ['intelligence', 'charisma'],
    isPsychic: false,
    description: 'Manage an organization, run a business, or oversee bureaucratic operations. Useful for keeping groups organized and dealing with governments.'
  },
  {
    id: 'connect',
    name: 'Connect',
    attribute: 'charisma',
    isPsychic: false,
    description: 'Find people who can help you, make useful contacts, and call in favors. Essential for networking and finding resources in new places.'
  },
  {
    id: 'exert',
    name: 'Exert',
    attribute: ['strength', 'constitution'],
    isPsychic: false,
    description: 'Physical activity: running, climbing, swimming, lifting, and other athletic endeavors. Also covers endurance and resisting exhaustion.'
  },
  {
    id: 'fix',
    name: 'Fix',
    attribute: 'intelligence',
    isPsychic: false,
    description: 'Repair and maintain equipment, jury-rig solutions, and understand how machines work. Essential for keeping ships and gear operational.'
  },
  {
    id: 'heal',
    name: 'Heal',
    attribute: 'intelligence',
    isPsychic: false,
    description: 'Provide medical treatment, diagnose illnesses, perform surgery, and stabilize the dying. The primary skill for keeping people alive.'
  },
  {
    id: 'know',
    name: 'Know',
    attribute: 'intelligence',
    isPsychic: false,
    description: 'Recall information about history, science, culture, and other academic topics. Covers general education and specialized knowledge.'
  },
  {
    id: 'lead',
    name: 'Lead',
    attribute: 'charisma',
    isPsychic: false,
    description: 'Inspire and command others, coordinate group actions, and maintain morale. Useful for managing followers and leading in crisis.'
  },
  {
    id: 'notice',
    name: 'Notice',
    attribute: 'wisdom',
    isPsychic: false,
    description: 'Spot hidden things, sense danger, and notice important details. Critical for avoiding ambushes and finding clues.'
  },
  {
    id: 'perform',
    name: 'Perform',
    attribute: 'charisma',
    isPsychic: false,
    description: 'Entertain an audience through music, acting, oratory, or other artistic expression. Also covers disguise and impersonation.'
  },
  {
    id: 'pilot',
    name: 'Pilot',
    attribute: 'dexterity',
    isPsychic: false,
    description: 'Operate vehicles including spacecraft, aircraft, watercraft, and ground vehicles. Essential for space travel and combat piloting.'
  },
  {
    id: 'program',
    name: 'Program',
    attribute: 'intelligence',
    isPsychic: false,
    description: 'Write software, hack computers, operate complex computer systems, and work with AI. The skill for all things digital.'
  },
  {
    id: 'punch',
    name: 'Punch',
    attribute: ['strength', 'dexterity'],
    isPsychic: false,
    description: 'Unarmed combat including punching, kicking, grappling, and using natural weapons. Covers all fighting without manufactured weapons.'
  },
  {
    id: 'shoot',
    name: 'Shoot',
    attribute: 'dexterity',
    isPsychic: false,
    description: 'Use ranged weapons including firearms, bows, thrown weapons, and ship-mounted guns. The primary ranged combat skill.'
  },
  {
    id: 'sneak',
    name: 'Sneak',
    attribute: 'dexterity',
    isPsychic: false,
    description: 'Move silently, hide, pick pockets, and avoid detection. Covers all forms of stealth and sleight of hand.'
  },
  {
    id: 'stab',
    name: 'Stab',
    attribute: ['strength', 'dexterity'],
    isPsychic: false,
    description: 'Use melee weapons including swords, knives, clubs, and improvised weapons. The primary melee combat skill.'
  },
  {
    id: 'survive',
    name: 'Survive',
    attribute: ['constitution', 'wisdom'],
    isPsychic: false,
    description: 'Find food and shelter in the wild, navigate without maps, resist harsh environments, and live off the land.'
  },
  {
    id: 'talk',
    name: 'Talk',
    attribute: 'charisma',
    isPsychic: false,
    description: 'Persuade, deceive, negotiate, and communicate effectively. Covers diplomacy, lying, and social manipulation.'
  },
  {
    id: 'trade',
    name: 'Trade',
    attribute: 'charisma',
    isPsychic: false,
    description: 'Buy and sell goods, evaluate items, and understand markets. Essential for making money and running businesses.'
  },
  {
    id: 'work',
    name: 'Work',
    attribute: ['strength', 'dexterity'],
    isPsychic: false,
    description: 'Perform manual labor, operate machinery, and do practical hands-on work. A catch-all for blue-collar tasks.'
  },
  // Psychic Skills
  {
    id: 'biopsionics',
    name: 'Biopsionics',
    attribute: ['constitution', 'wisdom'],
    isPsychic: true,
    description: 'Control and heal living bodies through mental power. Allows healing, physical enhancement, and biological manipulation.'
  },
  {
    id: 'metapsionics',
    name: 'Metapsionics',
    attribute: 'wisdom',
    isPsychic: true,
    description: 'Manipulate and enhance psychic powers themselves. Can boost abilities, shield against psychics, and analyze psionic phenomena.'
  },
  {
    id: 'precognition',
    name: 'Precognition',
    attribute: 'wisdom',
    isPsychic: true,
    description: 'See glimpses of possible futures and sense immediate dangers. Provides combat advantages and limited prophecy.'
  },
  {
    id: 'telekinesis',
    name: 'Telekinesis',
    attribute: ['constitution', 'wisdom'],
    isPsychic: true,
    description: 'Move objects and apply force through mental power. Ranges from delicate manipulation to crushing force.'
  },
  {
    id: 'telepathy',
    name: 'Telepathy',
    attribute: ['charisma', 'wisdom'],
    isPsychic: true,
    description: 'Read and project thoughts, communicate mentally, and influence minds. The skill for mental contact.'
  },
  {
    id: 'teleportation',
    name: 'Teleportation',
    attribute: ['constitution', 'wisdom'],
    isPsychic: true,
    description: 'Move instantly from place to place through mental power. Can transport self, others, and objects.'
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
