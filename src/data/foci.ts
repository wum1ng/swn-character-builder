import type { Focus } from '$types/character';

export const FOCI: Focus[] = [
  {
    id: 'alert',
    name: 'Alert',
    type: 'combat',
    description: 'You are keenly aware of your surroundings and virtually impossible to take by surprise.',
    level1: {
      description: 'Gain Notice as a bonus skill. You cannot be surprised, nor can others gain initiative bonuses against you due to circumstance.',
      bonusSkill: 'notice',
      abilities: ['Cannot be surprised', 'Others cannot gain initiative bonuses against you']
    },
    level2: {
      description: 'Always act first in combat rounds unless ambushed. On being ambushed, act first in round after ambush.',
      abilities: ['Always act first in combat', 'On ambush, act first after ambush round']
    }
  },
  {
    id: 'armsman',
    name: 'Armsman',
    type: 'combat',
    description: 'You have an intimate familiarity with military-grade weapons and their use.',
    level1: {
      description: 'Gain Stab as a bonus skill. You can draw or sheath a weapon as a free action.',
      bonusSkill: 'stab',
      abilities: ['Draw/sheath weapons as free action']
    },
    level2: {
      description: 'Once per scene, reroll a failed attack with a weapon. Your weapons are less likely to be destroyed.',
      abilities: ['Reroll one failed weapon attack per scene', 'Weapons harder to destroy']
    }
  },
  {
    id: 'assassin',
    name: 'Assassin',
    type: 'combat',
    description: 'You are practiced in the art of killing important people quietly.',
    level1: {
      description: 'Gain Sneak as a bonus skill. You can make a devastating attack against an unsuspecting target, adding your Sneak skill to damage.',
      bonusSkill: 'sneak',
      abilities: ['Add Sneak skill to damage against surprised targets']
    },
    level2: {
      description: 'Your assassination attacks add twice your Sneak skill to damage and automatically hit.',
      abilities: ['Double Sneak bonus to assassination damage', 'Assassination attacks auto-hit']
    }
  },
  {
    id: 'authority',
    name: 'Authority',
    type: 'non-combat',
    description: 'You have an air of command that others find difficult to resist.',
    level1: {
      description: 'Gain Lead as a bonus skill. Once per scene, issue command to NPCs; they obey unless suicidal or against beliefs.',
      bonusSkill: 'lead',
      abilities: ['Command NPCs once per scene']
    },
    level2: {
      description: 'NPCs with fewer levels/HD must save vs Mental or be cowed by your commands even in hostile situations.',
      abilities: ['Weaker NPCs must save or be cowed']
    }
  },
  {
    id: 'close-combatant',
    name: 'Close Combatant',
    type: 'combat',
    description: 'You are skilled at close-quarters fighting and using small weapons in tight spaces.',
    level1: {
      description: 'Gain Punch or Stab as a bonus skill. You can use pistol-sized weapons in melee without penalty.',
      bonusSkill: 'punch',
      abilities: ['Use pistols in melee without penalty', 'Ignore Shock damage from attacks']
    },
    level2: {
      description: 'Gain a +2 bonus to melee damage. Enemies lose their Shock damage against you.',
      abilities: ['+2 melee damage', 'Enemies deal no Shock to you']
    }
  },
  {
    id: 'connected',
    name: 'Connected',
    type: 'non-combat',
    description: 'You are remarkably gifted at making friends and forging ties with people around you.',
    level1: {
      description: 'Gain Connect as a bonus skill. After a week in a location, you have contacts willing to do mildly illegal favors.',
      bonusSkill: 'connect',
      abilities: ['Build contact network in one week']
    },
    level2: {
      description: 'Contacts will do even dangerous/illegal favors. You can access criminal organizations with relatively little risk.',
      abilities: ['Contacts do dangerous favors', 'Easy criminal organization access']
    }
  },
  {
    id: 'die-hard',
    name: 'Die Hard',
    type: 'combat',
    description: 'You are exceptionally difficult to kill.',
    level1: {
      description: 'You gain an extra 2 maximum hit points per level. Stabilize automatically when mortally wounded.',
      abilities: ['+2 HP per level', 'Auto-stabilize when dying']
    },
    level2: {
      description: 'The first time each day you would die, survive with 1 HP instead.',
      abilities: ['Survive death once per day with 1 HP']
    }
  },
  {
    id: 'diplomat',
    name: 'Diplomat',
    type: 'non-combat',
    description: 'You know how to get what you want through negotiation and finesse.',
    level1: {
      description: 'Gain Talk as a bonus skill. You can make someone who would otherwise attack reconsider, giving you time to talk.',
      bonusSkill: 'talk',
      abilities: ['Make attackers pause to negotiate']
    },
    level2: {
      description: 'Once per scene, shift an NPC\'s reaction one step in your favor, or two steps if your argument is compelling.',
      abilities: ['Shift NPC reactions in your favor']
    }
  },
  {
    id: 'gunslinger',
    name: 'Gunslinger',
    type: 'combat',
    description: 'You are gifted with firearms.',
    level1: {
      description: 'Gain Shoot as a bonus skill. You can draw and fire a gun as a single action. +2 to hit against targets within 10 meters.',
      bonusSkill: 'shoot',
      abilities: ['Quick draw and fire', '+2 hit within 10m']
    },
    level2: {
      description: 'Once per scene, reroll a failed ranged attack. All ranged attacks within 10m gain +1 damage.',
      abilities: ['Reroll ranged attack once per scene', '+1 damage within 10m']
    }
  },
  {
    id: 'healer',
    name: 'Healer',
    type: 'non-combat',
    description: 'You have an exceptional gift for medical care.',
    level1: {
      description: 'Gain Heal as a bonus skill. When you successfully stabilize a dying character, they regain 1 HP.',
      bonusSkill: 'heal',
      abilities: ['Stabilized characters regain 1 HP']
    },
    level2: {
      description: 'Characters under your long-term care heal twice as fast. Once per day, restore an ally to half HP.',
      abilities: ['Double natural healing rate', 'Restore ally to half HP daily']
    }
  },
  {
    id: 'henchkeeper',
    name: 'Henchkeeper',
    type: 'non-combat',
    description: 'You have a talent for attracting and keeping loyal followers.',
    level1: {
      description: 'Gain Lead as a bonus skill. Gain a henchman within 24 hours of arriving in a community.',
      bonusSkill: 'lead',
      abilities: ['Attract henchman in new communities']
    },
    level2: {
      description: 'Your henchmen have +1 to all skill checks and morale saves. Hiring costs reduced by 50%.',
      abilities: ['Henchmen get +1 to skills and morale', '50% cheaper hiring']
    }
  },
  {
    id: 'ironhide',
    name: 'Ironhide',
    type: 'combat',
    description: 'You are unnaturally tough and can shrug off blows that would fell others.',
    level1: {
      description: 'You have a natural Armor Class of 15. This doesn\'t stack with armor but works without any equipment.',
      abilities: ['Natural AC 15 (no armor needed)']
    },
    level2: {
      description: 'Natural Armor Class becomes 18. Once per day, absorb the first 10 points of damage from an attack.',
      abilities: ['Natural AC 18', 'Absorb 10 damage once per day']
    }
  },
  {
    id: 'psychic-training',
    name: 'Psychic Training',
    type: 'psychic',
    description: 'You have received extensive training in psychic techniques.',
    level1: {
      description: 'Gain +1 maximum Effort.',
      abilities: ['+1 maximum Effort']
    },
    level2: {
      description: 'Gain an additional +1 maximum Effort (total +2).',
      abilities: ['+2 maximum Effort total']
    }
  },
  {
    id: 'savage-fray',
    name: 'Savage Fray',
    type: 'combat',
    description: 'You are lethal when surrounded by foes.',
    level1: {
      description: 'Gain Stab as a bonus skill. When using a melee weapon, add half your level (round up) to damage against lesser foes.',
      bonusSkill: 'stab',
      abilities: ['Bonus melee damage vs weaker foes']
    },
    level2: {
      description: 'When killing a foe, get immediate free melee attack on another foe in range.',
      abilities: ['Free attack on kill']
    }
  },
  {
    id: 'shocking-assault',
    name: 'Shocking Assault',
    type: 'combat',
    description: 'You know how to hit where it hurts most.',
    level1: {
      description: 'Gain Punch or Stab as a bonus skill. Your Shock damage is +2.',
      bonusSkill: 'punch',
      abilities: ['+2 Shock damage']
    },
    level2: {
      description: 'Your Shock damage is +4 total. Your attacks always do at least 1 point of damage, even on miss.',
      abilities: ['+4 Shock damage', 'Minimum 1 damage on miss']
    }
  },
  {
    id: 'sniper',
    name: 'Sniper',
    type: 'combat',
    description: 'You are skilled at precise shooting from long range.',
    level1: {
      description: 'Gain Shoot as a bonus skill. No penalties for targets at long range. +2 damage vs unsuspecting targets.',
      bonusSkill: 'shoot',
      abilities: ['No long range penalties', '+2 damage vs unsuspecting']
    },
    level2: {
      description: '+1 to hit. Targets must be under cover or suffer automatic hits from you at ranges up to 1km.',
      abilities: ['+1 to hit', 'Auto-hit uncovered targets at extreme range']
    }
  },
  {
    id: 'specialist',
    name: 'Specialist',
    type: 'non-combat',
    description: 'You are exceptionally talented in one particular non-combat skill.',
    level1: {
      description: 'Gain any non-combat skill as a bonus skill. Roll 3d6 and take best 2 for that skill.',
      abilities: ['Roll 3d6, keep best 2 for chosen skill']
    },
    level2: {
      description: 'Chosen skill always succeeds on rolls of 6+ before modifiers. Gain +1 to all checks with that skill.',
      abilities: ['Auto-succeed on 6+ before modifiers', '+1 to all checks']
    }
  },
  {
    id: 'star-captain',
    name: 'Star Captain',
    type: 'non-combat',
    description: 'You are a natural leader of starship crews.',
    level1: {
      description: 'Gain Lead as a bonus skill. Your ship gains +1 on crisis checks. Ship repairs are 25% cheaper.',
      bonusSkill: 'lead',
      abilities: ['+1 to ship crisis checks', '25% cheaper repairs']
    },
    level2: {
      description: 'Once per day, reroll any ship-related skill check. Morale is always good on your ship.',
      abilities: ['Reroll ship check daily', 'Perfect crew morale']
    }
  },
  {
    id: 'tinker',
    name: 'Tinker',
    type: 'non-combat',
    description: 'You have a gift for making and modifying technological devices.',
    level1: {
      description: 'Gain Fix as a bonus skill. Create or modify devices to exceed normal specs once per scene.',
      bonusSkill: 'fix',
      abilities: ['Exceed normal device specs once per scene']
    },
    level2: {
      description: 'Maintain one extra device mod. Crafting costs reduced by 25%.',
      abilities: ['+1 device mod capacity', '25% cheaper crafting']
    }
  },
  {
    id: 'unarmed-combatant',
    name: 'Unarmed Combatant',
    type: 'combat',
    description: 'You are deadly even without weapons.',
    level1: {
      description: 'Gain Punch as a bonus skill. Unarmed attacks deal 1d6 damage and have Shock 1/15.',
      bonusSkill: 'punch',
      abilities: ['Unarmed: 1d6 damage, Shock 1/15']
    },
    level2: {
      description: 'Unarmed attacks deal 1d10 damage with Shock 2/15. Can parry lethal weapons barehanded.',
      abilities: ['Unarmed: 1d10 damage, Shock 2/15', 'Parry weapons barehanded']
    }
  },
  {
    id: 'wanderer',
    name: 'Wanderer',
    type: 'non-combat',
    description: 'You are experienced in traveling through dangerous and unknown places.',
    level1: {
      description: 'Gain Survive as a bonus skill. Reduce overland travel time by 10%. Find food/water for group automatically in any environment.',
      bonusSkill: 'survive',
      abilities: ['10% faster travel', 'Auto-forage in any environment']
    },
    level2: {
      description: 'Can guide a group through dangerous terrain without mishap. Travel time reduced by 25% total.',
      abilities: ['Safe passage through dangers', '25% faster travel total']
    }
  },
  {
    id: 'wild-psychic',
    name: 'Wild Psychic',
    type: 'psychic',
    description: 'Your psychic abilities are untrained but potent.',
    level1: {
      description: 'Learn one psychic discipline as a Wild Talent. You can only advance this discipline to level 1.',
      abilities: ['Learn one discipline as Wild Talent (max level 1)']
    },
    level2: {
      description: 'Wild Talent can advance to level 2. +1 maximum Effort.',
      abilities: ['Wild Talent max level 2', '+1 maximum Effort']
    }
  }
];

export const COMBAT_FOCI = FOCI.filter(f => f.type === 'combat');
export const NON_COMBAT_FOCI = FOCI.filter(f => f.type === 'non-combat');
export const PSYCHIC_FOCI = FOCI.filter(f => f.type === 'psychic');

export function getFocusById(id: string): Focus | undefined {
  return FOCI.find(f => f.id === id);
}
