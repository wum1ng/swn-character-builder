import type { Focus, AlienFeature } from '$types/character';

export const FOCI: Focus[] = [
  {
    id: 'alert',
    name: 'Alert',
    type: 'combat',
    description: 'You are keenly aware of your surroundings and virtually impossible to take unaware. You have an instinctive alacrity of response that helps you act before less wary persons can think to move.',
    level1: {
      description: 'Gain Notice as a bonus skill. You cannot be surprised, nor can others use the Execution Attack option on you. When you roll initiative, roll twice and take the best result.',
      bonusSkill: 'notice',
      abilities: ['Cannot be surprised', 'Immune to Execution Attacks', 'Roll initiative twice, take best']
    },
    level2: {
      description: 'You always act first in a combat round unless someone else involved is also this Alert.',
      abilities: ['Always act first in combat unless opposed by another Alert character']
    }
  },
  {
    id: 'armsman',
    name: 'Armsman',
    type: 'combat',
    description: 'You have an unusual competence with thrown weapons and melee attacks. This focus\' benefits do not apply to unarmed attacks or projectile weapons. For thrown weapons, you can\'t use Armsman at the same time as Gunslinger.',
    level1: {
      description: 'Gain Stab as a bonus skill. You can draw or sheath a Stowed melee or thrown weapon as an Instant action. You may add your Stab skill level to a melee or thrown weapon\'s damage roll or Shock damage, assuming it has any to begin with.',
      bonusSkill: 'stab',
      abilities: ['Draw/sheath melee or thrown weapon as Instant action', 'Add Stab skill level to melee/thrown damage and Shock']
    },
    level2: {
      description: 'Your primitive melee and thrown weapons count as TL4 weapons for the purpose of overcoming advanced armors. Even on a miss with a melee weapon, you do an unmodified 1d4 damage to the target, plus any Shock damage. This bonus damage doesn\'t apply to thrown weapons or Punch attacks.',
      abilities: ['Primitive melee/thrown weapons count as TL4', '1d4 damage on miss with melee weapons, plus Shock']
    }
  },
  {
    id: 'assassin',
    name: 'Assassin',
    type: 'combat',
    description: 'You are practiced at sudden murder, and have certain advantages in carrying out an Execution Attack.',
    level1: {
      description: 'Gain Sneak as a bonus skill. You can conceal an object no larger than a knife or pistol from anything less invasive than a strip search, including normal TL4 weapon detection devices. You can draw or produce this object as an On Turn action, and your point-blank ranged attacks made from surprise with it cannot miss the target.',
      bonusSkill: 'sneak',
      abilities: ['Conceal knife/pistol-sized object from normal searches', 'Draw concealed weapon as On Turn action', 'Point-blank surprise ranged attacks cannot miss']
    },
    level2: {
      description: 'You can take a Move action on the same round as you make an Execution Attack, closing rapidly with a target before you attack. You may split this Move action before and after the attack. This movement happens too quickly to alert a victim or be hindered by bodyguards.',
      abilities: ['Move action on same round as Execution Attack', 'Can split Move before and after attack', 'Movement too fast to alert victim or be stopped by bodyguards']
    }
  },
  {
    id: 'authority',
    name: 'Authority',
    type: 'non-combat',
    description: 'You have an uncanny kind of charisma about you, one that makes others instinctively follow your instructions and further your causes. At level 1, this is charm and personal magnetism, while level 2 might suggest latent telepathic influence or transhuman memetic hacking augmentations. Followers refers to NPCs who have voluntarily chosen to be in your service; PCs never count as followers.',
    level1: {
      description: 'Gain Lead as a bonus skill. Once per day, you can make a request from an NPC who is not openly hostile to you, rolling a Cha/Lead skill check at a difficulty of the NPC\'s Morale score. If you succeed, they will comply with the request, provided it is not harmful or extremely uncharacteristic.',
      bonusSkill: 'lead',
      abilities: ['Once per day, command a non-hostile NPC via Cha/Lead vs Morale']
    },
    level2: {
      description: 'Those who follow you are fired with confidence. Any NPC being directly led by you gains a Morale and hit roll bonus equal to your Lead skill and a +1 bonus on all skill checks. Your followers will not act against your interests unless under extreme pressure.',
      abilities: ['Followers gain Morale and hit bonus equal to Lead skill', 'Followers gain +1 to all skill checks', 'Followers will not act against your interests']
    }
  },
  {
    id: 'close-combatant',
    name: 'Close Combatant',
    type: 'combat',
    description: 'You\'ve had all too much practice at close-in fighting and desperate struggles with pistol or blade. You\'re extremely skilled at avoiding injury in melee combat, and at level 2 you can dodge through a melee scrum without fear of being knifed in passing.',
    level1: {
      description: 'Gain any combat skill as a bonus skill. You can use pistol-sized ranged weapons in melee without suffering penalties for the proximity of melee attackers. You ignore Shock damage from melee assailants, even if you\'re unarmored at the time.',
      bonusSkillChoices: ['punch', 'stab', 'shoot'],
      abilities: ['Use pistols in melee without penalty', 'Ignore Shock damage from melee assailants']
    },
    level2: {
      description: 'The Shock damage from your melee attacks treats all targets as if they were AC 10. The Fighting Withdrawal combat action is treated as an On Turn action for you and can be performed freely.',
      abilities: ['Your melee Shock treats all targets as AC 10', 'Fighting Withdrawal is a free On Turn action']
    }
  },
  {
    id: 'connected',
    name: 'Connected',
    type: 'non-combat',
    description: 'You\'re remarkably gifted at making friends and forging ties with the people around you. Wherever you go, you always seem to know somebody useful to your ends.',
    level1: {
      description: 'Gain Connect as a bonus skill. If you\'ve spent at least a week in a not-entirely-hostile location, you\'ll have built a web of contacts willing to do favors for you that are no more than mildly illegal. You can call on one favor per game day and the GM decides how far they\'ll go for you.',
      bonusSkill: 'connect',
      abilities: ['Build contact network after one week in a location', 'One favor per game day from contacts']
    },
    level2: {
      description: 'Once per game session, if it\'s not entirely implausible, you meet someone you know who is willing to do modest favors for you. You can decide when and where you want to meet this person, but the GM decides who they are and what they can do for you.',
      abilities: ['Once per session, meet a known contact willing to do modest favors']
    }
  },
  {
    id: 'die-hard',
    name: 'Die Hard',
    type: 'combat',
    description: 'You are surprisingly hard to kill. You can survive injuries or bear up under stresses that would incapacitate a less determined hero.',
    level1: {
      description: 'You gain an extra 2 maximum hit points per level. This bonus applies retroactively if you take this focus after first level. You automatically stabilize if mortally wounded by anything smaller than a Heavy weapon.',
      abilities: ['+2 HP per level (retroactive)', 'Auto-stabilize when mortally wounded (non-Heavy weapons)']
    },
    level2: {
      description: 'The first time each day that you are reduced to zero hit points by an injury, you instead survive with one hit point remaining. This ability can\'t save you from Heavy weapons or similar trauma.',
      abilities: ['Survive at 1 HP the first time each day you would reach 0 HP (non-Heavy only)']
    }
  },
  {
    id: 'diplomat',
    name: 'Diplomat',
    type: 'non-combat',
    description: 'You know how to get your way in personal negotiations, and can manipulate the attitudes of those around you. While smooth words are versatile, they\'ll only work if your interlocutor is actually willing to listen to you.',
    level1: {
      description: 'Gain Talk as a bonus skill. You speak all the languages common to the sector and can learn new ones to a workable level in a week, becoming fluent in a month. Reroll 1s on any skill check dice related to negotiation or diplomacy.',
      bonusSkill: 'talk',
      abilities: ['Speak all common sector languages', 'Learn new languages in a week, fluent in a month', 'Reroll 1s on negotiation/diplomacy skill checks']
    },
    level2: {
      description: 'Once per game session, shift an intelligent NPC\'s reaction roll one step closer to friendly if you can talk to them for at least thirty seconds.',
      abilities: ['Once per session, shift NPC reaction one step closer to friendly']
    }
  },
  {
    id: 'gunslinger',
    name: 'Gunslinger',
    type: 'combat',
    description: 'You have a gift with a gun. While this talent most commonly applies to slugthrowers or energy weapons, it is also applicable to thrown weapons, bows, or other ranged weapons that can be used with the Shoot skill. For thrown weapons, you can\'t use Gunslinger at the same time as Armsman.',
    level1: {
      description: 'Gain Shoot as a bonus skill. You can draw or holster a Stowed ranged weapon as an On Turn action. You may add your Shoot skill level to a ranged weapon\'s damage roll.',
      bonusSkill: 'shoot',
      abilities: ['Draw/holster ranged weapon as On Turn action', 'Add Shoot skill level to ranged damage']
    },
    level2: {
      description: 'Once per round, you can reload a ranged weapon as an On Turn action if it takes no more than one round to reload. Even on a miss with a Shoot attack, you do an unmodified 1d4 damage.',
      abilities: ['Reload as On Turn action once per round', '1d4 damage on missed Shoot attacks']
    }
  },
  {
    id: 'hacker',
    name: 'Hacker',
    type: 'non-combat',
    description: 'You have a considerable fluency with digital security measures and standard encryption methods. You know how to make computerized systems obey you until their automatic failsafes come down on your control.',
    level1: {
      description: 'Gain Program as a bonus skill. When attempting to hack a database or computerized system, roll 3d6 on the skill check and drop the lowest die.',
      bonusSkill: 'program',
      abilities: ['Roll 3d6, drop lowest on hacking skill checks']
    },
    level2: {
      description: 'Your hack duration increases to 1d4+Program skill x 10 minutes. You have an instinctive understanding of the tech; you never need to learn the data protocols for a strange system and are always treated as familiar with it.',
      abilities: ['Hack duration: (1d4+Program) x 10 minutes', 'Never need to learn data protocols for strange systems']
    }
  },
  {
    id: 'healer',
    name: 'Healer',
    type: 'non-combat',
    description: 'Healing comes naturally to you, and you\'re particularly gifted at preventing the quick bleed-out of wounded allies and comrades.',
    level1: {
      description: 'Gain Heal as a bonus skill. You may attempt to stabilize one mortally-wounded adjacent person per round as an On Turn action. When rolling Heal skill checks, roll 3d6 and drop the lowest die.',
      bonusSkill: 'heal',
      abilities: ['Stabilize mortally wounded as On Turn action', 'Roll 3d6, drop lowest on Heal checks']
    },
    level2: {
      description: 'Stims or other technological healing devices applied by you heal twice as many hit points as normal. Using only basic medical supplies, you can heal 1d6+Heal skill hit points of damage to every injured or wounded person in your group with ten minutes of first aid. Such healing can only be applied once per day per target.',
      abilities: ['Healing devices applied by you heal double HP', 'First aid: heal 1d6+Heal skill HP to each group member (once per day per target)']
    }
  },
  {
    id: 'henchkeeper',
    name: 'Henchkeeper',
    type: 'non-combat',
    description: 'You have a distinct knack for picking up lost souls who willingly do your bidding. You might induce them with promises of money, power, excitement, sex, or some other prize. A henchman obtained with this focus will serve loyally until clearly betrayed or placed in unacceptable danger. Henchmen are not "important" people and are usually marginal sorts, outcasts, or the desperate.',
    level1: {
      description: 'Gain Lead as a bonus skill. You can acquire henchmen within 24 hours of arriving in a community, assuming anyone is suitable. These henchmen will not fight except to save their own lives, but will escort you on adventures and risk great danger to help you. Treated as Peaceful Humans. You can have one henchman per three character levels, rounded up.',
      bonusSkill: 'lead',
      abilities: ['Acquire henchmen within 24 hours in any community', 'Henchmen are Peaceful Humans who won\'t fight', 'Max henchmen: character level / 3 (round up)']
    },
    level2: {
      description: 'Your henchmen are remarkably loyal and determined, and will fight for you against anything but clearly overwhelming odds. They are treated as Martial Humans. You can make faithful henchmen out of skilled and highly-capable NPCs if you have done them some favor that would earn such fierce loyalty.',
      abilities: ['Henchmen upgraded to Martial Humans who will fight', 'Can recruit skilled NPCs as henchmen through earned loyalty']
    }
  },
  {
    id: 'ironhide',
    name: 'Ironhide',
    type: 'combat',
    description: 'Whether through uncanny reflexes, remarkable luck, gengineered skin fibers, or subtle telekinetic shielding, you have natural defenses equivalent to high-quality combat armor. The benefits of this focus don\'t stack with armor, though Dexterity or shield modifiers apply.',
    level1: {
      description: 'You have an innate Armor Class of 15 plus half your character level, rounded up.',
      abilities: ['Natural AC of 15 + half character level (rounded up)']
    },
    level2: {
      description: 'Your abilities are so effective that they render you immune to unarmed attacks or primitive weaponry as if you wore powered armor.',
      abilities: ['Immune to unarmed attacks and primitive weapons (as powered armor)']
    }
  },
  {
    id: 'psychic-training',
    name: 'Psychic Training',
    type: 'psychic',
    description: 'You\'ve had special training in a particular psychic discipline. You must be a Psychic or have taken the Partial Psychic class option as an Adventurer to pick this focus. In the latter case, you can only take training in the discipline you initially chose as a Partial Psychic. This focus can be taken only once.',
    level1: {
      description: 'Gain any psychic skill as a bonus. If this improves it to level-1 proficiency, choose a free level-1 technique from that discipline. Your maximum Effort increases by one.',
      abilities: ['Gain a psychic skill as bonus', 'Free level-1 technique if skill reaches level 1', '+1 maximum Effort']
    },
    level2: {
      description: 'When you advance a level, the bonus psychic skill you chose automatically gets one skill point put toward increasing it or purchasing a technique from it. You may save these points for later. These points are awarded retroactively if you take this focus level later.',
      abilities: ['Chosen psychic skill gains 1 free skill point per level-up (retroactive)']
    }
  },
  {
    id: 'savage-fray',
    name: 'Savage Fray',
    type: 'combat',
    description: 'You are a whirlwind of bloody havoc in melee combat, and can survive being surrounded far better than most combatants.',
    level1: {
      description: 'Gain Stab as a bonus skill. All enemies adjacent to you at the end of your turn whom you have not attacked suffer the Shock damage of your weapon if their Armor Class is not too high to be affected.',
      bonusSkill: 'stab',
      abilities: ['Unattacked adjacent enemies suffer your weapon\'s Shock at end of turn']
    },
    level2: {
      description: 'After suffering your first melee hit in a round, any further melee attacks from other assailants automatically miss you. If the attacker who hits you has multiple attacks, they may attempt all of them, but other foes around you simply miss.',
      abilities: ['After first melee hit in a round, all other melee attackers automatically miss']
    }
  },
  {
    id: 'shocking-assault',
    name: 'Shocking Assault',
    type: 'combat',
    description: 'You\'re extremely dangerous to enemies around you. The ferocity of your melee attacks stresses and distracts enemies even when your blows don\'t draw blood.',
    level1: {
      description: 'Gain Punch or Stab as a bonus skill. The Shock damage of your weapon treats all targets as if they were AC 10, assuming your weapon is capable of harming the target in the first place.',
      bonusSkillChoices: ['punch', 'stab'],
      abilities: ['Weapon Shock treats all targets as AC 10']
    },
    level2: {
      description: 'In addition, you gain a +2 bonus to the Shock damage rating of all melee weapons and unarmed attacks. Regular hits never do less damage than this Shock would do on a miss.',
      abilities: ['+2 Shock damage on all melee weapons and unarmed attacks', 'Hits never do less damage than Shock would on a miss']
    }
  },
  {
    id: 'sniper',
    name: 'Sniper',
    type: 'combat',
    description: 'You are an expert at placing a bullet or beam on an unsuspecting target. These special benefits only apply when making an Execution Attack with a firearm or bow.',
    level1: {
      description: 'Gain Shoot as a bonus skill. When making a skill check for an Execution Attack or target shooting, roll 3d6 and drop the lowest die.',
      bonusSkill: 'shoot',
      abilities: ['Roll 3d6, drop lowest on Execution Attack and target shooting checks']
    },
    level2: {
      description: 'A target hit by your Execution Attack takes a -4 penalty on the Physical saving throw to avoid immediate mortal injury. Even if the save is successful, the target takes double the normal damage inflicted by the attack.',
      abilities: ['Execution Attack targets take -4 on Physical save', 'Successful save still takes double damage']
    }
  },
  {
    id: 'specialist',
    name: 'Specialist',
    type: 'non-combat',
    description: 'You are remarkably talented at a particular skill. Whether a marvelous cat burglar, a world-famous athlete, a brilliant engineer, or some other savant, your expertise is extremely reliable. You may take this focus more than once for different skills.',
    level1: {
      description: 'Gain a non-combat, non-psychic skill as a bonus. Roll 3d6 and drop the lowest die for all skill checks in this skill.',
      abilities: ['Roll 3d6, drop lowest on chosen skill checks']
    },
    level2: {
      description: 'Roll 4d6 and drop the two lowest dice for all skill checks in this skill.',
      abilities: ['Roll 4d6, drop two lowest on chosen skill checks']
    }
  },
  {
    id: 'star-captain',
    name: 'Star Captain',
    type: 'non-combat',
    description: 'You have a tremendous natural talent for ship combat, and can make any starship you captain a significantly more fearsome opponent. You must take the captain\'s role during a fight in order to benefit from this focus.',
    level1: {
      description: 'Gain Lead as a bonus skill. Your ship gains 2 extra Command Points at the start of each turn.',
      bonusSkill: 'lead',
      abilities: ['+2 Command Points per turn for your ship']
    },
    level2: {
      description: 'A ship you captain gains bonus hit points equal to 20% of its maximum at the start of each combat. Damage is taken from these bonus points first, and they vanish at the end of the fight and do not require repairs. In addition, once per engagement, you may resolve a Crisis as an Instant action.',
      abilities: ['Ship gains 20% bonus HP at start of combat', 'Once per engagement, resolve a Crisis as an Instant action']
    }
  },
  {
    id: 'starfarer',
    name: 'Starfarer',
    type: 'non-combat',
    description: 'You are an expert in the plotting and execution of interstellar spike drills. While most experienced pilots can manage conventional drills along well-charted spike routes, you have the knack for forging new drill paths and cutting courses too dangerous for lesser navigators.',
    level1: {
      description: 'Gain Pilot as a bonus skill. You automatically succeed at all spike drill-related skill checks of difficulty 10 or less.',
      bonusSkill: 'pilot',
      abilities: ['Auto-succeed on spike drill checks of difficulty 10 or less']
    },
    level2: {
      description: 'Double your Pilot skill for all spike drill-related skill checks. Spike drives of ships you navigate are treated as one level higher, up to a maximum of drive-7. Spike drills you personally oversee take only half the time.',
      abilities: ['Double Pilot skill for spike drill checks', 'Ship spike drive treated as one level higher (max drive-7)', 'Spike drills take half time']
    }
  },
  {
    id: 'tinker',
    name: 'Tinker',
    type: 'non-combat',
    description: 'You have a natural knack for modifying and improving equipment.',
    level1: {
      description: 'Gain Fix as a bonus skill. Your Maintenance score is doubled, allowing you to maintain twice as many mods. Both ship and gear mods cost only half their usual price in credits, though pretech salvage requirements remain the same.',
      bonusSkill: 'fix',
      abilities: ['Double Maintenance score', 'Ship and gear mods cost half price in credits']
    },
    level2: {
      description: 'Your Fix skill is treated as one level higher for purposes of building and maintaining mods and calculating your Maintenance score. Advanced mods require one fewer pretech salvage part to make, down to a minimum of zero.',
      abilities: ['Fix skill treated as one level higher for mods and Maintenance', 'Advanced mods need one fewer pretech salvage part (min 0)']
    }
  },
  {
    id: 'unarmed-combatant',
    name: 'Unarmed Combatant',
    type: 'combat',
    description: 'Your empty hands are more dangerous than knives and guns in the grip of the less gifted. Your unarmed attacks are counted as melee weapons when it comes to binding up opponents wielding rifles and similar long arms, though you need at least one hand free to do so.',
    level1: {
      description: 'Gain Punch as a bonus skill. Your unarmed attacks become more dangerous as your Punch skill increases. At level-0, they do 1d6 damage. At level-1, 1d8. At level-2, 1d10. At level-3, 1d12. At level-4, 1d12+1. At Punch-1 or better, they have Shock equal to your Punch skill against AC 15 or less.',
      bonusSkill: 'punch',
      abilities: ['Unarmed damage scales: 1d6/1d8/1d10/1d12/1d12+1 by Punch level', 'At Punch-1+: Shock equal to Punch skill vs AC 15']
    },
    level2: {
      description: 'You know locks and twists that use powered servos against their wearer. Your unarmed attacks count as TL4 weapons for overcoming advanced armors. Even on a miss with a Punch attack, you do an unmodified 1d6 damage.',
      abilities: ['Unarmed attacks count as TL4 weapons', '1d6 damage on missed Punch attacks']
    }
  },
  {
    id: 'wanderer',
    name: 'Wanderer',
    type: 'non-combat',
    description: 'Your hero gets around. As part of a life on the road, they\'ve mastered a number of tricks for ensuring their mobility and surviving the inevitable difficulties of a vagabond existence.',
    level1: {
      description: 'Gain Survive as a bonus skill. You can convey basic ideas in all the common languages of the sector. You can always find free transport to a desired destination for yourself and a small group of friends provided any traffic goes to the place. Finding this transport takes no more than an hour, but it may not be strictly legitimate and may require working passage.',
      bonusSkill: 'survive',
      abilities: ['Speak basic ideas in all common sector languages', 'Find free transport within an hour for self and friends']
    },
    level2: {
      description: 'You can forge, scrounge, or snag travel papers and identification for the party with 1d6 hours of work. These papers stand up to ordinary scrutiny but require an opposed Int/Administer versus Wis/Notice check if examined while the PC is actually wanted. When finding transport, it always makes the trip at least as fast as a dedicated charter.',
      abilities: ['Forge travel papers/ID in 1d6 hours', 'Transport is always as fast as a dedicated charter']
    }
  },
  {
    id: 'wild-psychic',
    name: 'Wild Psychic Talent',
    type: 'psychic',
    description: 'Some men and women are born with a very limited form of MES. While not true psychics, these "wild talents" can create one limited psychic effect. Their MES is so mild they don\'t suffer the risk of madness or brain damage. Wild talents are not treated as psychics for general purposes and cannot "torch" their powers. When relevant, they are treated as having one point of Effort. Psychics and Partial Psychics cannot take this focus.',
    level1: {
      description: 'Pick a psychic discipline. You gain an ability equivalent to the level-0 core power of that discipline. Optionally, you may instead pick a level-1 technique from that discipline, but it must stand alone and not augment another technique or core ability you don\'t have.',
      abilities: ['Gain level-0 core power of one discipline, OR one standalone level-1 technique']
    },
    level2: {
      description: 'You now have a maximum Effort of two points. You may pick a second ability according to the guidelines above. This second pick does not need to be standalone if it augments the power you chose for level 1. You still cannot get the level-1 core power, as you are restricted to level-0.',
      abilities: ['Maximum Effort becomes 2', 'Gain second psychic ability (can augment level-1 pick)', 'Still restricted to level-0 core power']
    }
  }
];

// Alien Features - GM picks 2 (or 3 if some are minor) for a custom alien race
export const ALIEN_FEATURES: AlienFeature[] = [
  {
    id: 'aptitude-for-violence',
    name: 'Aptitude for Violence',
    description: 'All members of this species are good at hurting things. They gain a +1 bonus to their normal attack bonus. A 1st level Expert would have +1 instead of +0, and a 1st level Warrior would begin with +2.',
    isMajor: true
  },
  {
    id: 'environmental-native',
    name: 'Environmental Native',
    description: 'The alien is able to survive in a relatively common hostile environment, such as underwater, in hard vacuum, amid lethal radiation, or similar. If the alien requires this environment to survive, it\'s no net benefit at all.',
    isMajor: false
  },
  {
    id: 'innate-ability',
    name: 'Innate Ability',
    description: 'All members of this species have one or more natural abilities beyond those possessed by humans. Perfect vision in the dark, tracking by scent, wireless tech interfacing, a lack of need for food and water, or some other talent. Equivalent to the natural use of 2-3 equipment items, or a single psionic technique plus one point of Effort.',
    isMajor: true
  },
  {
    id: 'natural-defenses',
    name: 'Natural Defenses',
    description: 'The creature has a hard shell or sharp talons. Base Armor Class of 15 plus half character level, rounded up. Body weaponry such as claws or fangs is equivalent to a medium advanced weapon (1d8+1, Shock 2/AC 13). Weaponry alone is a very minor advantage.',
    isMajor: true
  },
  {
    id: 'origin-skill',
    name: 'Origin Skill',
    description: 'All members of the species are particularly good at something. They might all be capable warriors, have unique technical aptitude, be persuasive speakers, or otherwise have a shared knack. Receive an appropriate skill as a bonus. Warrior-type races may pick from Punch, Shoot, or Stab.',
    isMajor: true
  },
  {
    id: 'psychic-aptitude',
    name: 'Psychic Aptitude',
    description: 'These aliens are all psychically gifted. The PC must either be a Psychic or take the Partial Psychic class option from the Adventurer class. Their maximum Effort score is increased by one point.',
    isMajor: true
  },
  {
    id: 'shapeshifting',
    name: 'Shapeshifting',
    description: 'The alien is either an amoeboid blob that can manipulate objects with extruded pseudopods and flow through small spaces, or it can actually mimic other species or objects. Simple blob form is a minor perk; true mimicry of other species is equivalent to biopsionic shapeshifting.',
    isMajor: true
  },
  {
    id: 'strong-attribute',
    name: 'Strong Attribute',
    description: 'All members of the species excel in one area by human standards. Pick an attribute appropriate to the alien; that attribute gains a +1 bonus to its modifier, up to a maximum of +3.',
    isMajor: true
  },
  {
    id: 'tough',
    name: 'Tough',
    description: 'The alien is big, hardy, or made of unusually durable biological components. Whenever they roll hit dice to determine maximum hit points, the first die always counts as the maximum value. Further hit dice that roll a 1 are rerolled.',
    isMajor: true
  },
  {
    id: 'unusual-movement',
    name: 'Unusual Movement Mode',
    description: 'The alien can fly under normal gravity conditions, make short-range teleportation hops, or climb sheer walls as if flat. They can use their Move action to travel in unusual ways.',
    isMajor: true
  },
  {
    id: 'useful-immunity',
    name: 'Useful Immunity',
    description: 'The alien is impervious to some relatively common threat. A significant immunity (bullets, lasers, edged melee weapons) is a major benefit. Immunity to minor threats (toxins, diseases, radiation, falling damage) qualifies as a minor perk.',
    isMajor: true
  }
];

// Robot sub-types for Robot Player Character origin
export interface RobotType {
  id: string;
  name: string;
  description: string;
  abilities: string[];
}

export const ROBOT_TYPES: RobotType[] = [
  {
    id: 'android',
    name: 'Android',
    description: 'You are externally indistinguishable from a baseline human without a medical examination. Your intended function determines your bonus skill. Minor damage does not reveal your nature, but dropping to 0 HP does.',
    abilities: [
      'Indistinguishable from human without medical examination',
      'Choose a bonus skill related to your intended function',
      'Minor damage does not reveal your nature',
      'Reaching 0 HP reveals your robotic nature'
    ]
  },
  {
    id: 'worker-bot',
    name: 'VI Worker Bot',
    description: 'You are built for industrial or technical labor and are obviously inhuman in appearance. Your form is optimized for your intended work function.',
    abilities: [
      'Obviously inhuman in appearance',
      'Choose a bonus skill related to your intended function',
      'Choose one attribute associated with your work: +1 to its modifier (max +2)'
    ]
  },
  {
    id: 'vehicle-bot',
    name: 'VI Vehicle Bot',
    description: 'You are instantiated in a vehicle body such as a drone, hoverbike, or gravcar. You become the vehicle itself, retaining your attributes but gaining the vehicle\'s Armor score as your base AC.',
    abilities: [
      'Gain Pilot as a bonus skill',
      'Choose a vehicle type — you become that vehicle',
      'Base AC = vehicle Armor + Dex modifier',
      'AC can be improved up to 3× Fix skill (1000 cr/point)',
      'Use vehicle HP or character HP, whichever is higher',
      'Can pilot a surrogate humanoid body as Main Action'
    ]
  }
];

export function getRobotTypeById(id: string): RobotType | undefined {
  return ROBOT_TYPES.find(t => t.id === id);
}

// Origin Foci - require GM unlock
export const ORIGIN_FOCI: Focus[] = [
  {
    id: 'robot-pc',
    name: 'Robot Player Character',
    type: 'origin',
    originType: 'robot',
    description: 'You are a VI (Virtual Intelligence) robot, an artificial being with true self-awareness instantiated in a mechanical body. You were built for a specific function but have developed beyond your original programming. VIs have the same attributes, hit points, abilities, and classes as humans, but cannot be Psychics nor take the Partial Psychic class option.',
    level1: {
      description: 'Gain a bonus skill related to your intended function. You have all the traits of a VI robot: you need neither sleep, eat, nor drink, requiring one Type B power cell per week of operation away from available power. You are immune to vacuum, poison, and disease. You cannot be affected by biopsionic healing but can be healed with spare parts and Fix-0 skill (each unit heals HP equal to your character level, 15 minutes to apply). You cannot use cyberware. Equipment can be grafted into your chassis at double cost (max encumbrance equal to half your Constitution).',
      abilities: [
        'Immune to vacuum, poison, and disease',
        'No need to eat, sleep, or drink (1 Type B cell/week)',
        'Healed with spare parts + Fix skill, not biopsionics',
        'Can graft equipment into chassis (double cost, max Enc = half CON)',
        'Cannot use cyberware or be a Psychic'
      ]
    }
  },
  {
    id: 'alien-origin',
    name: 'Alien Origin',
    type: 'origin',
    originType: 'alien',
    description: 'You are a member of an alien species with abilities beyond the human baseline. Your GM has approved your alien race concept. Choose two features from the alien benefits list that define your species\' natural traits. If some features are relatively minor perks, your GM may allow a third.',
    level1: {
      description: 'Choose two alien features that represent your species\' unique traits. These features define your alien nature and grant you abilities beyond the human norm.',
      abilities: [
        'Select two alien features from the list below',
        'Features define your species\' natural abilities'
      ]
    },
    alienFeatures: ALIEN_FEATURES
  }
];

export const COMBAT_FOCI = FOCI.filter(f => f.type === 'combat');
export const NON_COMBAT_FOCI = FOCI.filter(f => f.type === 'non-combat');
export const PSYCHIC_FOCI = FOCI.filter(f => f.type === 'psychic');

// All foci including origins (for lookup)
export const ALL_FOCI = [...FOCI, ...ORIGIN_FOCI];

export function getFocusById(id: string): Focus | undefined {
  return ALL_FOCI.find(f => f.id === id);
}

export function getAlienFeatureById(id: string): AlienFeature | undefined {
  return ALIEN_FEATURES.find(f => f.id === id);
}
