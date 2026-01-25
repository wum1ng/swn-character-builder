import type { PsychicDiscipline, PsychicTechnique } from '$types/character';

export const PSYCHIC_DISCIPLINES: PsychicDiscipline[] = [
  {
    id: 'biopsionics',
    name: 'Biopsionics',
    skill: 'biopsionics',
    description: 'Control and heal living bodies through mental power. Biopsions can heal wounds, enhance physical abilities, and manipulate biological processes.',
    coreTechnique: {
      id: 'biopsionics-core',
      name: 'Psychic Succor',
      level: 0,
      cost: '1 Effort/scene',
      description: 'The biopsion can heal 1d6+skill level hit points of damage to a touched target as a Main Action. Targets can only be healed once per scene by this power.',
      isCore: true
    },
    techniques: [
      {
        id: 'biopsionics-0-1',
        name: 'Mastered Succor',
        level: 0,
        cost: '1 Effort/day',
        description: 'The biopsion can now use Psychic Succor without committing Effort. They can also heal 2d6+skill level hit points instead of 1d6+skill.'
      },
      {
        id: 'biopsionics-1-1',
        name: 'Organic Purification Protocols',
        level: 1,
        cost: '1 Effort/scene',
        description: 'The biopsion can cure a touched target of any disease or poison. More dangerous afflictions may require a skill check.'
      },
      {
        id: 'biopsionics-1-2',
        name: 'Vital Augmentation',
        level: 1,
        cost: '1 Effort/scene',
        description: 'The biopsion can grant a touched target a +2 bonus to any one physical attribute for one scene. This bonus stacks with other augmentations.'
      },
      {
        id: 'biopsionics-2-1',
        name: 'Invincible Stand',
        level: 2,
        cost: '1 Effort/scene',
        description: 'Commit Effort as an Instant action when reduced to zero hit points. You remain conscious at 1 HP for the rest of the scene.'
      },
      {
        id: 'biopsionics-2-2',
        name: 'Body Weaponry',
        level: 2,
        cost: '1 Effort/scene',
        description: 'The biopsion can manifest claws, bone blades, or similar natural weapons that deal 1d8 damage and count as TL4 weapons.'
      },
      {
        id: 'biopsionics-3-1',
        name: 'Tissue Integrity Field',
        level: 3,
        cost: '2 Effort/scene',
        description: 'The biopsion becomes immune to poison, disease, and critical hits for one scene. Mortal wounds reduce to regular damage.'
      },
      {
        id: 'biopsionics-4-1',
        name: 'Metamorph',
        level: 4,
        cost: '2 Effort/day',
        description: 'The biopsion can reshape their body into any humanoid form of similar mass, gaining appropriate physical capabilities.'
      }
    ]
  },
  {
    id: 'metapsionics',
    name: 'Metapsionics',
    skill: 'metapsionics',
    description: 'Manipulate and enhance psychic powers themselves. Metapsions can boost their own abilities, shield against other psychics, and analyze psionic phenomena.',
    coreTechnique: {
      id: 'metapsionics-core',
      name: 'Psychic Refinement',
      level: 0,
      cost: 'Passive',
      description: 'The metapsion gains one bonus Effort that can only be used with metapsionics techniques.',
      isCore: true
    },
    techniques: [
      {
        id: 'metapsionics-0-1',
        name: 'Cloak Powers',
        level: 0,
        cost: '1 Effort/scene',
        description: 'The metapsion hides their psychic signature. They appear as a normal human to psychic senses and detect-magic type effects.'
      },
      {
        id: 'metapsionics-1-1',
        name: 'Mindlink',
        level: 1,
        cost: '1 Effort/scene',
        description: 'Create a telepathic link between willing targets within sight. All linked targets can communicate silently for the scene.'
      },
      {
        id: 'metapsionics-1-2',
        name: 'Psychic Static',
        level: 1,
        cost: '1 Effort/scene',
        description: 'The area within 50 meters becomes hostile to psychic powers. All psychic skill checks take a -2 penalty.'
      },
      {
        id: 'metapsionics-2-1',
        name: 'Surge',
        level: 2,
        cost: '1 Effort/scene',
        description: 'Boost a psychic power as an Instant. The power acts as if the psychic had 2 additional skill levels for that use.'
      },
      {
        id: 'metapsionics-2-2',
        name: 'Suspend Power',
        level: 2,
        cost: '1 Effort/scene',
        description: 'As an Instant, the metapsion can negate one psychic power being used within sight. Opposed skill check to succeed.'
      },
      {
        id: 'metapsionics-3-1',
        name: 'Unified Effort Pool',
        level: 3,
        cost: 'Passive',
        description: 'The metapsion can use Effort from their metapsionics pool for any psychic discipline they possess.'
      },
      {
        id: 'metapsionics-4-1',
        name: 'Impervious Pavis of Will',
        level: 4,
        cost: '2 Effort/scene',
        description: 'The metapsion and all allies within 10 meters become immune to hostile psychic powers for one round.'
      }
    ]
  },
  {
    id: 'precognition',
    name: 'Precognition',
    skill: 'precognition',
    description: 'See glimpses of possible futures and sense immediate dangers. Precogs can gain combat advantages and make limited prophecies.',
    coreTechnique: {
      id: 'precognition-core',
      name: 'Oracle',
      level: 0,
      cost: '1 Effort/day',
      description: 'The precog can ask the GM one yes/no question about future events within the next day. The GM must answer honestly based on current circumstances.',
      isCore: true
    },
    techniques: [
      {
        id: 'precognition-0-1',
        name: 'Sense Danger',
        level: 0,
        cost: '1 Effort/scene',
        description: 'The precog gains an instinctive awareness of immediate physical danger. They cannot be surprised and gain +1 AC for the scene.'
      },
      {
        id: 'precognition-1-1',
        name: 'Terminal Reflection',
        level: 1,
        cost: '1 Effort/scene',
        description: 'As an Instant, when the precog or an ally within sight is about to take damage, they may reroll the damage dice.'
      },
      {
        id: 'precognition-1-2',
        name: 'Omen of Future Peril',
        level: 1,
        cost: '1 Effort/day',
        description: 'The precog has a vision of danger awaiting a person or place. The GM provides a cryptic but useful warning.'
      },
      {
        id: 'precognition-2-1',
        name: 'Prophetic Guidance',
        level: 2,
        cost: '1 Effort/scene',
        description: 'Grant an ally within sight a bonus of +2 to hit on their next attack roll or skill check made in the next round.'
      },
      {
        id: 'precognition-2-2',
        name: 'Not My Time',
        level: 2,
        cost: '1 Effort/scene',
        description: 'As an Instant when hit by an attack, the precog may force a reroll of the attack. The new result must be accepted.'
      },
      {
        id: 'precognition-3-1',
        name: 'Intuitive Navigation',
        level: 3,
        cost: '1 Effort/day',
        description: 'The precog can find the fastest safe route to any known location, avoiding ambushes and hazards along the way.'
      },
      {
        id: 'precognition-4-1',
        name: 'Destiny Fulfilled',
        level: 4,
        cost: '2 Effort/scene',
        description: 'Once per scene, the precog can declare that any die roll just made is automatically the best possible result.'
      }
    ]
  },
  {
    id: 'telekinesis',
    name: 'Telekinesis',
    skill: 'telekinesis',
    description: 'Move objects and apply force through mental power. Telekinetics range from delicate manipulation to crushing force.',
    coreTechnique: {
      id: 'telekinesis-core',
      name: 'Telekinetic Manipulation',
      level: 0,
      cost: '1 Effort/scene',
      description: 'The telekinetic can move objects up to 10kg within 50m as a Move action. Fine manipulation is possible but combat applications are limited without other techniques.',
      isCore: true
    },
    techniques: [
      {
        id: 'telekinesis-0-1',
        name: 'Telekinetic Armory',
        level: 0,
        cost: '1 Effort/scene',
        description: 'The telekinetic can wield weapons with their mind. Treat as using the weapon normally but with their telekinesis skill for hit rolls.'
      },
      {
        id: 'telekinesis-1-1',
        name: 'Telekinetic Shield',
        level: 1,
        cost: '1 Effort/scene',
        description: 'The telekinetic gains +2 AC as they deflect incoming attacks with mental force. Lasts for one scene.'
      },
      {
        id: 'telekinesis-1-2',
        name: 'Kinetic Transversal',
        level: 1,
        cost: '1 Effort/scene',
        description: 'The telekinetic can fly at their normal movement rate for one scene. Concentration is required; taking damage requires a skill check to maintain.'
      },
      {
        id: 'telekinesis-2-1',
        name: 'Pressure Field',
        level: 2,
        cost: '1 Effort/scene',
        description: 'Create a crushing field around a target within 50m. Deals 1d8 damage per round and immobilizes the target. Con save ends.'
      },
      {
        id: 'telekinesis-2-2',
        name: 'Telekinetic Ram',
        level: 2,
        cost: '1 Effort/scene',
        description: 'As a Main Action, hurl a massive telekinetic blast at targets in a 10m radius. Deals 2d6 damage, Evasion save for half.'
      },
      {
        id: 'telekinesis-3-1',
        name: 'Thermokinesis',
        level: 3,
        cost: '2 Effort/scene',
        description: 'The telekinetic can generate extreme heat or cold in a 10m radius. Deals 3d6 damage per round to all targets in the area.'
      },
      {
        id: 'telekinesis-4-1',
        name: 'Godlike Reach',
        level: 4,
        cost: '2 Effort/day',
        description: 'The telekinetic can move objects up to 1 ton within 500m, or create barriers that can stop vehicle-scale weapons.'
      }
    ]
  },
  {
    id: 'telepathy',
    name: 'Telepathy',
    skill: 'telepathy',
    description: 'Read and project thoughts, communicate mentally, and influence minds. The skill for mental contact and manipulation.',
    coreTechnique: {
      id: 'telepathy-core',
      name: 'Telepathic Contact',
      level: 0,
      cost: '1 Effort/scene',
      description: 'The telepath can mentally communicate with a willing target within sight. Surface thoughts can be read from unwilling targets with an opposed skill check.',
      isCore: true
    },
    techniques: [
      {
        id: 'telepathy-0-1',
        name: 'Empathy',
        level: 0,
        cost: '1 Effort/scene',
        description: 'The telepath can sense the emotional state of nearby creatures and detect when someone is lying. +2 to Talk checks.'
      },
      {
        id: 'telepathy-1-1',
        name: 'Psychic Assault',
        level: 1,
        cost: '1 Effort/scene',
        description: 'The telepath can attack a target\'s mind within 50m. Deals 1d8 damage that bypasses armor. Mental save for half.'
      },
      {
        id: 'telepathy-1-2',
        name: 'Facile Mind',
        level: 1,
        cost: '1 Effort/day',
        description: 'The telepath can instantly learn any language by reading the mind of a native speaker.'
      },
      {
        id: 'telepathy-2-1',
        name: 'Reflex Response',
        level: 2,
        cost: '1 Effort/scene',
        description: 'Plant a telepathic suggestion in a target\'s mind that triggers on a specific condition. Mental save to resist.'
      },
      {
        id: 'telepathy-2-2',
        name: 'Far Sight',
        level: 2,
        cost: '1 Effort/day',
        description: 'The telepath can see through the eyes of a willing or unaware target anywhere on the same planet.'
      },
      {
        id: 'telepathy-3-1',
        name: 'Unity of Minds',
        level: 3,
        cost: '2 Effort/scene',
        description: 'Link willing minds together. All linked targets share senses, can communicate instantly, and can aid each other\'s skill checks.'
      },
      {
        id: 'telepathy-4-1',
        name: 'Psychic Domination',
        level: 4,
        cost: '2 Effort/day',
        description: 'Take complete control of a target\'s body and mind. The target may save once per hour to break free. Deeply evil act.'
      }
    ]
  },
  {
    id: 'teleportation',
    name: 'Teleportation',
    skill: 'teleportation',
    description: 'Move instantly from place to place through mental power. Can transport self, others, and objects across vast distances.',
    coreTechnique: {
      id: 'teleportation-core',
      name: 'Personal Apportation',
      level: 0,
      cost: '1 Effort/scene',
      description: 'The teleporter can teleport to any visible location within 10m as a Move action. They can take up to 25kg of gear with them.',
      isCore: true
    },
    techniques: [
      {
        id: 'teleportation-0-1',
        name: 'Burdened Apportation',
        level: 0,
        cost: '1 Effort/scene',
        description: 'The teleporter can take one willing ally or 100kg of cargo when teleporting.'
      },
      {
        id: 'teleportation-1-1',
        name: 'Spatial Awareness',
        level: 1,
        cost: '1 Effort/scene',
        description: 'The teleporter gains an awareness of all spaces within 50m, even through walls. They can teleport to any such space.'
      },
      {
        id: 'teleportation-1-2',
        name: 'Proficient Apportation',
        level: 1,
        cost: 'Passive',
        description: 'Personal Apportation range increases to 100m. The teleporter can teleport as an On Turn action.'
      },
      {
        id: 'teleportation-2-1',
        name: 'Defensive Blink',
        level: 2,
        cost: '1 Effort/scene',
        description: 'As an Instant when hit by an attack, the teleporter can teleport 10m away. The attack still hits but follow-up attacks are harder.'
      },
      {
        id: 'teleportation-2-2',
        name: 'Spatial Synchrony',
        level: 2,
        cost: '1 Effort/day',
        description: 'The teleporter can create a teleport anchor at their current location. They can return to any anchor as a Main Action.'
      },
      {
        id: 'teleportation-3-1',
        name: 'Effortless Apportation',
        level: 3,
        cost: 'Passive',
        description: 'Personal Apportation no longer requires Effort commitment. The teleporter can teleport at will.'
      },
      {
        id: 'teleportation-4-1',
        name: 'Deep Teleportation',
        level: 4,
        cost: '2 Effort/day',
        description: 'The teleporter can teleport to any location they have personally visited, regardless of distance. Interstellar teleportation is possible.'
      }
    ]
  }
];

export function getDisciplineById(id: string): PsychicDiscipline | undefined {
  return PSYCHIC_DISCIPLINES.find(d => d.id === id);
}

export function getTechniquesByDiscipline(disciplineId: string): PsychicTechnique[] {
  const discipline = getDisciplineById(disciplineId);
  if (!discipline) return [];
  return [discipline.coreTechnique, ...discipline.techniques];
}

export function getTechniqueById(techniqueId: string): PsychicTechnique | undefined {
  for (const discipline of PSYCHIC_DISCIPLINES) {
    if (discipline.coreTechnique.id === techniqueId) {
      return discipline.coreTechnique;
    }
    const technique = discipline.techniques.find(t => t.id === techniqueId);
    if (technique) return technique;
  }
  return undefined;
}
