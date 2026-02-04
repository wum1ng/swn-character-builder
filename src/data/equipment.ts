// Equipment data for Stars Without Number (Revised Edition)

export interface EquipmentItem {
  id: string;
  name: string;
  category: 'weapon' | 'armor' | 'gear';
  subCategory?: string;
  cost: number;
  encumbrance: number;
  techLevel: number;
  description?: string;
  // Weapon properties
  damage?: string;
  shock?: string; // e.g. "1/AC 15" or "2/AC 13"
  range?: string;
  attribute?: 'strength' | 'dexterity' | 'strength/dexterity';
  magazineSize?: number;
  burstFire?: boolean;
  // Armor properties
  armorClass?: number;
  armorType?: 'primitive' | 'street' | 'combat' | 'powered';
}

export interface EquipmentPackage {
  id: string;
  name: string;
  description: string;
  items: string[];
  credits: number;
}

// Weapons - Melee
export const MELEE_WEAPONS: EquipmentItem[] = [
  {
    id: 'small-primitive-weapon',
    name: 'Small Primitive Weapon',
    category: 'weapon',
    subCategory: 'melee',
    cost: 0,
    encumbrance: 1,
    techLevel: 0,
    damage: '1d4',
    shock: '1/AC 15',
    attribute: 'strength/dexterity',
    description: 'Knife, hatchet, sap, or other small weapon. Easily concealed in normal clothing. Many can be thrown up to 10 meters.'
  },
  {
    id: 'medium-primitive-weapon',
    name: 'Medium Primitive Weapon',
    category: 'weapon',
    subCategory: 'melee',
    cost: 20,
    encumbrance: 1,
    techLevel: 0,
    damage: '1d6+1',
    shock: '2/AC 13',
    attribute: 'strength/dexterity',
    description: 'Spear, sword, axe, or other one-handed weapon of war. Can\'t be concealed in anything smaller than a cloak or coat. Spears and similar weapons can be thrown up to 30 meters.'
  },
  {
    id: 'large-primitive-weapon',
    name: 'Large Primitive Weapon',
    category: 'weapon',
    subCategory: 'melee',
    cost: 30,
    encumbrance: 2,
    techLevel: 0,
    damage: '1d8+1',
    shock: '2/AC 15',
    attribute: 'strength',
    description: 'Claymore, halberd, tetsubo, or other two-handed implement of bodily ruin. Relies largely on Strength and can bash through lighter forms of armor.'
  },
  {
    id: 'small-advanced-weapon',
    name: 'Small Advanced Weapon',
    category: 'weapon',
    subCategory: 'melee',
    cost: 40,
    encumbrance: 1,
    techLevel: 4,
    damage: '1d6',
    shock: '1/AC 15',
    attribute: 'strength/dexterity',
    description: 'Monoblade knife, thermal dagger, or other small TL4 weapon with advanced cutting or impact augmentation. Can overcome primitive armor.'
  },
  {
    id: 'medium-advanced-weapon',
    name: 'Medium Advanced Weapon',
    category: 'weapon',
    subCategory: 'melee',
    cost: 60,
    encumbrance: 1,
    techLevel: 4,
    damage: '1d8+1',
    shock: '2/AC 13',
    attribute: 'strength/dexterity',
    description: 'Monoblade sword, thermal axe, or other medium TL4 weapon. Advanced materials and augmentations overcome primitive armor.'
  },
  {
    id: 'large-advanced-weapon',
    name: 'Large Advanced Weapon',
    category: 'weapon',
    subCategory: 'melee',
    cost: 80,
    encumbrance: 2,
    techLevel: 4,
    damage: '1d10+1',
    shock: '2/AC 15',
    attribute: 'strength',
    description: 'Two-handed advanced melee weapon such as a great monoblade or kinetic maul. Advanced materials overcome primitive armor.'
  },
  {
    id: 'stun-baton',
    name: 'Stun Baton',
    category: 'weapon',
    subCategory: 'melee',
    cost: 50,
    encumbrance: 1,
    techLevel: 4,
    damage: '1d8',
    shock: '1/AC 15',
    attribute: 'strength/dexterity',
    description: 'Common law enforcement tool. Damage can drop a target to zero hit points but will not kill them; the victim awakens in ten minutes with one hit point. Trickle-charges from normal movement and will not run out of energy.'
  },
  {
    id: 'suit-ripper',
    name: 'Suit Ripper',
    category: 'weapon',
    subCategory: 'melee',
    cost: 75,
    encumbrance: 1,
    techLevel: 4,
    damage: '1d6',
    attribute: 'strength/dexterity',
    description: 'Rod with fractal cutting surfaces designed to cripple vacc suit auto-repair routines. Every hit counts as a suit tear on a vacc suit-wearing enemy. Strictly illegal in space environments.'
  }
];

// Weapons - Ranged
export const RANGED_WEAPONS: EquipmentItem[] = [
  {
    id: 'primitive-bow',
    name: 'Primitive Bow',
    category: 'weapon',
    subCategory: 'ranged',
    cost: 15,
    encumbrance: 2,
    techLevel: 1,
    damage: '1d6',
    range: '50/75',
    attribute: 'dexterity',
    magazineSize: 1,
    description: 'Uncommon in the far future, though some lostworlder barbarians have nothing better. Can be reloaded with a Move action.'
  },
  {
    id: 'advanced-bow',
    name: 'Advanced Bow',
    category: 'weapon',
    subCategory: 'ranged',
    cost: 50,
    encumbrance: 2,
    techLevel: 3,
    damage: '1d6',
    range: '100/150',
    attribute: 'dexterity',
    magazineSize: 1,
    description: 'A bow made with modern materials for improved range and reliability. Can be reloaded with a Move action.'
  },
  {
    id: 'conversion-bow',
    name: 'Conversion Bow',
    category: 'weapon',
    subCategory: 'ranged',
    cost: 500,
    encumbrance: 2,
    techLevel: 4,
    damage: '1d8',
    range: '150/300',
    attribute: 'dexterity',
    magazineSize: 1,
    description: 'Uses special materials to convert kinetic energy of the draw into a force field "glazing" around the arrow, improving penetration. Can be reloaded with a Move action.'
  },
  {
    id: 'grenade',
    name: 'Grenade',
    category: 'weapon',
    subCategory: 'ranged',
    cost: 25,
    encumbrance: 1,
    techLevel: 3,
    damage: '2d6',
    range: '10/30',
    attribute: 'dexterity',
    description: 'Always roll to attack AC 10. On a miss, lands 1d10 meters away in a random direction. Explodes for 2d6 damage to all within 5 meters. Evasion save for half. Targets take 1 less damage per AC above 14. Can use Exert instead of Shoot.'
  },
  {
    id: 'crude-pistol',
    name: 'Crude Pistol',
    category: 'weapon',
    subCategory: 'ranged',
    cost: 20,
    encumbrance: 1,
    techLevel: 2,
    damage: '1d6',
    range: '5/15',
    attribute: 'dexterity',
    magazineSize: 1,
    description: 'The rawest and most primitive form of gunpowder weaponry, usually a makeshift weapon improvised by criminals or the desperate. Requires two rounds to reload.'
  },
  {
    id: 'musket',
    name: 'Musket',
    category: 'weapon',
    subCategory: 'ranged',
    cost: 30,
    encumbrance: 2,
    techLevel: 2,
    damage: '1d12',
    range: '25/50',
    attribute: 'dexterity',
    magazineSize: 1,
    description: 'A primitive long arm with considerable stopping power. Requires two rounds to reload.'
  },
  {
    id: 'revolver',
    name: 'Revolver',
    category: 'weapon',
    subCategory: 'ranged',
    cost: 50,
    encumbrance: 1,
    techLevel: 2,
    damage: '1d8',
    range: '30/100',
    attribute: 'dexterity',
    magazineSize: 6,
    description: 'Quite popular on frontier worlds, as the weapons are extremely reliable and can be repaired and manufactured even by primitive metallurgists. Some variants handle atmospheres that would destroy more fragile weapons.'
  },
  {
    id: 'rifle',
    name: 'Rifle',
    category: 'weapon',
    subCategory: 'ranged',
    cost: 75,
    encumbrance: 2,
    techLevel: 2,
    damage: '1d10+2',
    range: '200/400',
    attribute: 'dexterity',
    magazineSize: 6,
    description: 'The mainstay of most TL2 armies and hunters, thanks to their superior range and power.'
  },
  {
    id: 'shotgun',
    name: 'Shotgun',
    category: 'weapon',
    subCategory: 'ranged',
    cost: 50,
    encumbrance: 2,
    techLevel: 2,
    damage: '3d4',
    range: '10/30',
    attribute: 'dexterity',
    magazineSize: 2,
    description: 'Cheaper and more easily manufactured than rifles, popular for home defense on the frontier. Stats are for shot ammunition. Slug rounds do 2d6 damage with 50/75 meter range.'
  },
  {
    id: 'semi-auto-pistol',
    name: 'Semi-Auto Pistol',
    category: 'weapon',
    subCategory: 'ranged',
    cost: 75,
    encumbrance: 1,
    techLevel: 3,
    damage: '1d6+1',
    range: '30/100',
    attribute: 'dexterity',
    magazineSize: 12,
    description: 'Trades some reliability of the revolver for a larger magazine. The favorite sidearm on planets that lack the harsh conditions of a frontier world.'
  },
  {
    id: 'submachine-gun',
    name: 'Submachine Gun',
    category: 'weapon',
    subCategory: 'ranged',
    cost: 200,
    encumbrance: 1,
    techLevel: 3,
    damage: '1d8',
    range: '30/100',
    attribute: 'dexterity',
    magazineSize: 20,
    burstFire: true,
    description: 'Takes pistol ammunition but fires it at a high rate of speed. Can fire in burst mode for +2 to hit and damage using three rounds of ammo.'
  },
  {
    id: 'combat-rifle',
    name: 'Combat Rifle',
    category: 'weapon',
    subCategory: 'ranged',
    cost: 300,
    encumbrance: 2,
    techLevel: 3,
    damage: '1d12',
    range: '100/300',
    attribute: 'dexterity',
    magazineSize: 30,
    burstFire: true,
    description: 'Favored by TL3 militaries, trading some range and penetration for larger capacity and burst fire. On more strait-laced worlds such military weaponry is often illegal for civilians.'
  },
  {
    id: 'combat-shotgun',
    name: 'Combat Shotgun',
    category: 'weapon',
    subCategory: 'ranged',
    cost: 300,
    encumbrance: 2,
    techLevel: 3,
    damage: '3d4',
    range: '10/30',
    attribute: 'dexterity',
    magazineSize: 12,
    burstFire: true,
    description: 'More complicated version of conventional shotgun with larger ammunition capacity and burst fire capability. Can fire slug rounds as normal shotguns.'
  },
  {
    id: 'sniper-rifle',
    name: 'Sniper Rifle',
    category: 'weapon',
    subCategory: 'ranged',
    cost: 400,
    encumbrance: 2,
    techLevel: 3,
    damage: '2d8',
    range: '1000/2000',
    attribute: 'dexterity',
    magazineSize: 1,
    description: 'Designed to be exceptionally effective at dropping unsuspecting targets at long range. Any target mortally wounded via an Execution Attack dies instantly with no chance for stabilization.'
  },
  {
    id: 'void-carbine',
    name: 'Void Carbine',
    category: 'weapon',
    subCategory: 'ranged',
    cost: 400,
    encumbrance: 2,
    techLevel: 4,
    damage: '2d6',
    range: '100/300',
    attribute: 'dexterity',
    magazineSize: 10,
    description: 'Designed for vacuum and zero-gee use with essentially no recoil. Rounds cannot penetrate ordinary ship equipment plating.'
  },
  {
    id: 'mag-pistol',
    name: 'Mag Pistol',
    category: 'weapon',
    subCategory: 'ranged',
    cost: 400,
    encumbrance: 1,
    techLevel: 4,
    damage: '2d6+2',
    range: '100/300',
    attribute: 'dexterity',
    magazineSize: 6,
    description: 'Magnetic acceleration of metal flechettes. Ammunition is packaged with integral power supplies, so no additional power cells are necessary.'
  },
  {
    id: 'mag-rifle',
    name: 'Mag Rifle',
    category: 'weapon',
    subCategory: 'ranged',
    cost: 500,
    encumbrance: 2,
    techLevel: 4,
    damage: '2d8+2',
    range: '300/600',
    attribute: 'dexterity',
    magazineSize: 10,
    description: 'Long-range magnetic accelerator rifle firing metal flechettes. Ammunition includes integral power supplies.'
  },
  {
    id: 'spike-thrower',
    name: 'Spike Thrower',
    category: 'weapon',
    subCategory: 'ranged',
    cost: 600,
    encumbrance: 2,
    techLevel: 4,
    damage: '3d8',
    range: '20/40',
    attribute: 'dexterity',
    magazineSize: 15,
    burstFire: true,
    description: 'Shotgun equivalent of mag weapons. Devastating at close range with burst fire capability.'
  },
  {
    id: 'laser-pistol',
    name: 'Laser Pistol',
    category: 'weapon',
    subCategory: 'ranged',
    cost: 200,
    encumbrance: 1,
    techLevel: 4,
    damage: '1d6',
    range: '100/300',
    attribute: 'dexterity',
    magazineSize: 10,
    description: 'The most common type of energy weapon. May produce silent, invisible beams or noisy, brightly-colored streaks. Phased multifrequency beam penetrates mist or haze. Energy weapons gain +1 to hit rolls.'
  },
  {
    id: 'laser-rifle',
    name: 'Laser Rifle',
    category: 'weapon',
    subCategory: 'ranged',
    cost: 300,
    encumbrance: 2,
    techLevel: 4,
    damage: '1d10',
    range: '300/500',
    attribute: 'dexterity',
    magazineSize: 20,
    burstFire: true,
    description: 'Long-range energy weapon. Phased multifrequency beam penetrates mist or haze. Thick particulate matter (ash, sand) can impose up to -4 to hit and halve range. Energy weapons gain +1 to hit rolls.'
  },
  {
    id: 'thermal-pistol',
    name: 'Thermal Pistol',
    category: 'weapon',
    subCategory: 'ranged',
    cost: 300,
    encumbrance: 1,
    techLevel: 4,
    damage: '2d6',
    range: '25/50',
    attribute: 'dexterity',
    magazineSize: 5,
    description: 'Replaces the laser beam with a small sphere of magnetically-shaped plasma. Short range but significantly more damage. Not affected by ambient particulates. Tends to be extremely loud. Energy weapons gain +1 to hit rolls.'
  },
  {
    id: 'plasma-projector',
    name: 'Plasma Projector',
    category: 'weapon',
    subCategory: 'ranged',
    cost: 400,
    encumbrance: 2,
    techLevel: 4,
    damage: '2d8',
    range: '50/100',
    attribute: 'dexterity',
    magazineSize: 6,
    description: 'Two-handed plasma weapon with greater range and damage than a thermal pistol. Not affected by particulates. Extremely loud. Energy weapons gain +1 to hit rolls.'
  },
  {
    id: 'shear-rifle',
    name: 'Shear Rifle',
    category: 'weapon',
    subCategory: 'ranged',
    cost: 600,
    encumbrance: 2,
    techLevel: 5,
    damage: '2d8',
    range: '100/300',
    attribute: 'dexterity',
    magazineSize: 10,
    burstFire: true,
    description: 'Uses miniaturized grav projectors to create dangerous repulsor fields inside a target, tearing it apart along perfectly smooth planes. Completely silent in operation. Energy weapons gain +1 to hit rolls.'
  },
  {
    id: 'thunder-gun',
    name: 'Thunder Gun',
    category: 'weapon',
    subCategory: 'ranged',
    cost: 1000,
    encumbrance: 2,
    techLevel: 5,
    damage: '2d10',
    range: '100/300',
    attribute: 'dexterity',
    magazineSize: 6,
    description: 'Two-handed grav weapon causing basso vibrations felt up to 30 meters away. On an unmodified hit roll of 16+, deal an extra 1d10 damage. Bonus damage always applies to inanimate targets. Energy weapons gain +1 to hit rolls.'
  },
  {
    id: 'distortion-cannon',
    name: 'Distortion Cannon',
    category: 'weapon',
    subCategory: 'ranged',
    cost: 1250,
    encumbrance: 2,
    techLevel: 5,
    damage: '2d12',
    range: '100/300',
    attribute: 'dexterity',
    magazineSize: 6,
    description: 'Two-handed pretech weapon manipulating the fabric of space. Can ignore up to one meter of solid cover provided the wielder can see the target or fix its location within one meter. Energy weapons gain +1 to hit rolls.'
  }
];

// Armor
export const ARMOR: EquipmentItem[] = [
  {
    id: 'shield',
    name: 'Shield',
    category: 'armor',
    cost: 10,
    encumbrance: 2,
    techLevel: 0,
    armorClass: 13,
    armorType: 'primitive',
    description: 'Primitive shields of wood or stretched hide. Grants base AC 13; if bearer\'s AC is already equal or better, grants +1 AC instead. Requires one free hand. Renders bearer immune to first instance of melee Shock each round. Ignored by weapons that ignore primitive armor.'
  },
  {
    id: 'primitive-armor-light',
    name: 'Leather Jack / Hide Armor',
    category: 'armor',
    cost: 10,
    encumbrance: 1,
    techLevel: 0,
    armorClass: 13,
    armorType: 'primitive',
    description: 'Leather, hide, or quilted armor. Useless against TL4 advanced melee weapons and firearms of all kinds (treated as AC 10 against these).'
  },
  {
    id: 'primitive-armor-medium',
    name: 'Cuirass / Brigandine',
    category: 'armor',
    cost: 50,
    encumbrance: 1,
    techLevel: 1,
    armorClass: 15,
    armorType: 'primitive',
    description: 'Cuirass, brigandine, or half-plate. Useless against TL4 advanced melee weapons and firearms of all kinds (treated as AC 10 against these).'
  },
  {
    id: 'primitive-armor-heavy',
    name: 'Full Plate / Layered Mail',
    category: 'armor',
    cost: 100,
    encumbrance: 2,
    techLevel: 1,
    armorClass: 17,
    armorType: 'primitive',
    description: 'Full plate or layered mail. The best primitive armor available. Useless against TL4 advanced melee weapons and firearms of all kinds (treated as AC 10 against these).'
  },
  {
    id: 'warpaint',
    name: 'Warpaint',
    category: 'armor',
    cost: 300,
    encumbrance: 0,
    techLevel: 4,
    armorClass: 12,
    armorType: 'street',
    description: 'Bizarre combat fashions and scrap-built street harness of gangers and cult enforcers. Fashioned of scrounged scraps of TL4 materials with gang colors, body paint, and intimidating tattoos. NPCs in warpaint gain +1 Morale bonus.'
  },
  {
    id: 'armored-undersuit',
    name: 'Armored Undersuit',
    category: 'armor',
    cost: 600,
    encumbrance: 0,
    techLevel: 4,
    armorClass: 13,
    armorType: 'street',
    description: 'Skin-tight bodysuit woven of advanced TL4 fibers with shock-activated rigidity and impact dispersion. Transparent panels allow it to be worn with almost any outfit without drawing notice or being detected without close tactile examination.'
  },
  {
    id: 'secure-clothing',
    name: 'Secure Clothing',
    category: 'armor',
    cost: 300,
    encumbrance: 1,
    techLevel: 4,
    armorClass: 13,
    armorType: 'street',
    description: 'Comes in assorted styles from casual to haute couture. Normal fabrics replaced with light, flexible armor components that are only slightly hindering. Only close tactile examination can distinguish from ordinary clothing.'
  },
  {
    id: 'armored-vacc-suit',
    name: 'Armored Vacc Suit',
    category: 'armor',
    cost: 400,
    encumbrance: 2,
    techLevel: 4,
    armorClass: 13,
    armorType: 'street',
    description: 'A vacc suit that has traded off some comfort for additional protective thickness. Functions as a normal vacc suit with only half the usual chance to tear when hit by an edged weapon or suit ripper.'
  },
  {
    id: 'security-armor',
    name: 'Security Armor',
    category: 'armor',
    cost: 700,
    encumbrance: 1,
    techLevel: 4,
    armorClass: 14,
    armorType: 'combat',
    description: 'The ordinary working uniform of most law enforcement officials and security personnel. Rigid plates and anti-ballistic panels provide protection at minimal extra weight.'
  },
  {
    id: 'woven-body-armor',
    name: 'Woven Body Armor',
    category: 'armor',
    cost: 400,
    encumbrance: 2,
    techLevel: 3,
    armorClass: 15,
    armorType: 'combat',
    description: 'The best armor a TL3 world can manufacture, or an up-armored version of security armor used by TL4 high-threat response teams. Significantly more cumbersome but allows multiple layers of protection.'
  },
  {
    id: 'combat-field-uniform',
    name: 'Combat Field Uniform',
    category: 'armor',
    cost: 1000,
    encumbrance: 1,
    techLevel: 4,
    armorClass: 16,
    armorType: 'combat',
    description: 'Sophisticated battle dress fabricated from TL4 ablative coatings, rigid plates, and shock-activated soft components. The standard uniform for well-equipped TL4 front-line soldiers.'
  },
  {
    id: 'icarus-harness',
    name: 'Icarus Harness',
    category: 'armor',
    cost: 8000,
    encumbrance: 1,
    techLevel: 4,
    armorClass: 16,
    armorType: 'combat',
    description: 'A Combat Field Uniform upgrade for paratroopers. Replaces a parachute with a crude gravity damper allowing unlimited fall distance without harm. Each fall over 3 meters drains a type A power cell. Also functions as a vacc suit for up to 30 minutes.'
  },
  {
    id: 'assault-suit',
    name: 'Assault Suit',
    category: 'armor',
    cost: 10000,
    encumbrance: 2,
    techLevel: 4,
    armorClass: 18,
    armorType: 'powered',
    description: 'The most sophisticated armor in common use among TL4 worlds. Provides integral encrypted comms, low-light and infrared vision, and energy feed interface for one weapon using type A cells (unlimited ammo). Also functions as a vacc suit that cannot be torn. Requires type B power cell for 24 hours. Immune to primitive weapons, unarmed, and TL3 or lower firearms.'
  },
  {
    id: 'storm-armor',
    name: 'Storm Armor',
    category: 'armor',
    cost: 20000,
    encumbrance: 2,
    techLevel: 5,
    armorClass: 19,
    armorType: 'powered',
    description: 'Advanced assault suit. Treats Strength as 4 points higher for encumbrance. Integral gravitic boosters allow 20-meter leaps and 40-meter safe falls. Onboard medical computer attempts stabilization when mortally wounded (Physical save). Requires type B power cell for 24 hours.'
  },
  {
    id: 'field-emitter-panoply',
    name: 'Field Emitter Panoply',
    category: 'armor',
    cost: 40000,
    encumbrance: 1,
    techLevel: 5,
    armorClass: 20,
    armorType: 'powered',
    description: 'Heavy-duty pretech defensive system of worn emitter nodes sheathing the wearer in close-fitting damper fields. Pale glow is obvious. All benefits of storm armor with no power source required. Immune to any radiation that wouldn\'t kill in seconds. Many project intimidating holographic skins.'
  }
];

// General Equipment
export const GEAR: EquipmentItem[] = [
  {
    id: 'backpack-tl0',
    name: 'Backpack (TL0)',
    category: 'gear',
    subCategory: 'containers',
    cost: 5,
    encumbrance: 1,
    techLevel: 0,
    description: 'A worn backpack counts as a readied item, though objects stowed inside require the usual round to dig free.'
  },
  {
    id: 'backpack',
    name: 'Backpack (TL4)',
    category: 'gear',
    subCategory: 'containers',
    cost: 50,
    encumbrance: 0,
    techLevel: 4,
    description: 'TL4 version effectively without encumbrance. A worn backpack counts as a readied item, though objects stowed inside require the usual round to dig free.'
  },
  {
    id: 'compad',
    name: 'Compad',
    category: 'gear',
    subCategory: 'communications',
    cost: 100,
    encumbrance: 0,
    techLevel: 4,
    description: 'Hand-held portable communications device. Most TL4 worlds have global comm coverage, but primitive worlds render these devices useless without a nearby comm server.'
  },
  {
    id: 'field-radio',
    name: 'Field Radio',
    category: 'gear',
    subCategory: 'communications',
    cost: 200,
    encumbrance: 1,
    techLevel: 4,
    description: 'Headset-mounted radio powered by type A cell for months. Urban/rugged terrain limits range to about 2km; flat plains up to 30km. With Program-0 skill, can use shortwave for continental distances with 10 minutes of tuning.'
  },
  {
    id: 'comm-server',
    name: 'Comm Server',
    category: 'gear',
    subCategory: 'communications',
    cost: 1000,
    encumbrance: 3,
    techLevel: 4,
    description: 'Powerful base unit providing communications without comsats. Services up to three dozen compads within 300km. Usage can be locked to specific compads, all transmissions heavily encrypted. Runs for several months on a type B cell.'
  },
  {
    id: 'translator-torc',
    name: 'Translator Torc',
    category: 'gear',
    subCategory: 'communications',
    cost: 200,
    encumbrance: 0,
    techLevel: 4,
    description: 'Keyed for two languages, automatically translating what it hears. Translations are eccentric with a several-second delay. Social skill/Charisma attempts through a translator suffer -2 penalty. Powered by one type A cell lasting one week.'
  },
  {
    id: 'dataslab',
    name: 'Dataslab',
    category: 'gear',
    subCategory: 'computing',
    cost: 300,
    encumbrance: 1,
    techLevel: 4,
    description: 'Palm-sized computing device that can unfold into a thin slab roughly one-third of a meter on a side. Can perform all functions of a compad or handheld computer and communicates wirelessly with nearby devices.'
  },
  {
    id: 'nav-computer',
    name: 'Navcomp',
    category: 'gear',
    subCategory: 'computing',
    cost: 500,
    encumbrance: 1,
    techLevel: 4,
    description: 'Combination of low-tech compasses, automappers, astronomic charts, and gyroscopes. Character with navcomp never gets lost on worlds with GPS satellites. Makes crude automatic maps of buildings/landscapes traveled through. +1 to terrestrial navigation skill checks.'
  },
  {
    id: 'storage-unit',
    name: 'Storage Unit',
    category: 'gear',
    subCategory: 'computing',
    cost: 500,
    encumbrance: 3,
    techLevel: 4,
    description: 'Portable but clumsy case hardened against anything short of intentional firearm damage. Can hold a tremendous amount of data or absorb a small corporation\'s complete files.'
  },
  {
    id: 'metatool',
    name: 'Metatool',
    category: 'gear',
    subCategory: 'tools',
    cost: 200,
    encumbrance: 1,
    techLevel: 4,
    description: 'Wrist-mounted housing containing a myriad of small, useful tools designed to handle the widest possible range of technical needs. Too limited for major jobs, but usually sufficient for jury-rigged repairs and temporary fixes.'
  },
  {
    id: 'toolkit-postech',
    name: 'Toolkit (Postech)',
    category: 'gear',
    subCategory: 'tools',
    cost: 300,
    encumbrance: 3,
    techLevel: 4,
    description: 'Wide range of necessary tools. Can handle almost any job that doesn\'t require a full-scale shop or lab. Handles electronics, small welding jobs, and basic repair on ordinary TL4 goods.'
  },
  {
    id: 'toolkit-pretech',
    name: 'Toolkit (Pretech)',
    category: 'gear',
    subCategory: 'tools',
    cost: 1000,
    encumbrance: 1,
    techLevel: 5,
    description: 'More sophisticated tools necessary for working on advanced TL5 artifacts. Very rare and difficult to obtain.'
  },
  {
    id: 'spare-parts',
    name: 'Spare Parts',
    category: 'gear',
    subCategory: 'tools',
    cost: 50,
    encumbrance: 1,
    techLevel: 4,
    description: 'General category of small TL4 components and repair materials. Can jury-rig basic, uncomplicated tools or weapons with 10-15 minutes of assembly and at least Fix-0 skill. Such bodged devices rarely last longer than one scene.'
  },
  {
    id: 'medkit',
    name: 'Medkit',
    category: 'gear',
    subCategory: 'medical',
    cost: 100,
    encumbrance: 2,
    techLevel: 4,
    description: 'Contains pharmaceuticals, spray bandages, glue sutures, and a handbook of injury care. Designed for handling sudden, drastic injuries. Also contains tools for long-term recuperative care. After each day of long-term care, roll 2d6; on a 12, the kit has run out.'
  },
  {
    id: 'lazarus-patch',
    name: 'Lazarus Patch',
    category: 'gear',
    subCategory: 'medical',
    cost: 30,
    encumbrance: 0,
    techLevel: 4,
    description: 'Heavy compress laced with antibiotics, coagulants, system stabilizers, plasma, and a one-shot diagnostic suite. Applied to a character at 0 HP, user makes Int/Heal or Dex/Heal check vs difficulty 6 to stabilize. Each round after the first, -1 penalty. No use after six rounds. Only one patch per victim.'
  },
  {
    id: 'tailored-antiallergens',
    name: 'Tailored Antiallergens',
    category: 'gear',
    subCategory: 'medical',
    cost: 5,
    encumbrance: 0,
    techLevel: 4,
    description: 'Renders a local world\'s organics largely edible by humans and its atmosphere breathable without severe allergic reactions. A dose lasts for twenty-four hours.'
  },
  {
    id: 'bioscanner',
    name: 'Bioscanner',
    category: 'gear',
    subCategory: 'sensors',
    cost: 300,
    encumbrance: 1,
    techLevel: 4,
    description: 'An untrained user can discern internal bleeding, gross physical distress, or toxins. With Heal-0 skill, provides full spectrum diagnosis and DNA sequencing in minutes. One type A power cell powers it for up to twenty-four hours.'
  },
  {
    id: 'survey-scanner',
    name: 'Survey Scanner',
    category: 'gear',
    subCategory: 'sensors',
    cost: 250,
    encumbrance: 1,
    techLevel: 4,
    description: 'Multipurpose scanner for atmospheric and gravitic readings, basic chemical analysis of samples up to one cubic centimeter, and recording up to 200 hours of video or 2000 hours of audio. Know skill checks necessary for anything beyond basic analysis.'
  },
  {
    id: 'low-light-goggles',
    name: 'Low-Light Goggles',
    category: 'gear',
    subCategory: 'sensors',
    cost: 200,
    encumbrance: 1,
    techLevel: 3,
    description: 'Provide monochrome but serviceable view out to normal visual distance, provided any illumination is available at all. A type A power cell operates them for a week.'
  },
  {
    id: 'binoculars',
    name: 'Binoculars (TL3)',
    category: 'gear',
    subCategory: 'sensors',
    cost: 20,
    encumbrance: 1,
    techLevel: 3,
    description: 'Standard 7x50 binoculars.'
  },
  {
    id: 'binoculars-tl4',
    name: 'Binoculars (TL4)',
    category: 'gear',
    subCategory: 'sensors',
    cost: 200,
    encumbrance: 1,
    techLevel: 4,
    description: 'Advanced binoculars with integral low-light optics and up to 25x150 power. Requires a type A power cell for a week.'
  },
  {
    id: 'glowbug',
    name: 'Glowbug',
    category: 'gear',
    subCategory: 'survival',
    cost: 5,
    encumbrance: 0,
    techLevel: 3,
    description: 'Palm-sized disc that adheres to any non-porous surface. Emits white light illuminating everything within ten meters for twenty-four hours. A hundred glowbugs can be recharged off a single type A cell.'
  },
  {
    id: 'grapnel-launcher',
    name: 'Grapnel Launcher',
    category: 'gear',
    subCategory: 'survival',
    cost: 200,
    encumbrance: 1,
    techLevel: 3,
    description: 'Fires a rope up to forty meters. Rope can bear up to a metric ton of weight. A type A power cell fuels six shots.'
  },
  {
    id: 'climbing-harness',
    name: 'Climbing Harness',
    category: 'gear',
    subCategory: 'survival',
    cost: 50,
    encumbrance: 1,
    techLevel: 3,
    description: 'Collection of straps, ropes, pitons, and other climbing aids granting +1 bonus on any Exert climbing skill test. Using it is noisy; Sneak checks while climbing suffer a -2 penalty.'
  },
  {
    id: 'rope-20m',
    name: 'Rope, 20m (TL0)',
    category: 'gear',
    subCategory: 'survival',
    cost: 4,
    encumbrance: 2,
    techLevel: 0,
    description: 'Strong rope. Metatool can cut and join TL4 synthetics.'
  },
  {
    id: 'rope-40m-tl4',
    name: 'Rope, 40m (TL4)',
    category: 'gear',
    subCategory: 'survival',
    cost: 40,
    encumbrance: 1,
    techLevel: 4,
    description: 'Light and sturdy TL4 synthetic rope. 40 meters for one encumbrance. Metatool can cut and join.'
  },
  {
    id: 'rations-1-day',
    name: 'Rations (1 day)',
    category: 'gear',
    subCategory: 'survival',
    cost: 5,
    encumbrance: 0,
    techLevel: 1,
    description: 'Dried or otherwise preserved foodstuffs sufficient for one day. If water is not otherwise available, add another item\'s encumbrance for daily water needs.'
  },
  {
    id: 'vacc-suit',
    name: 'Vacc Suit',
    category: 'gear',
    subCategory: 'survival',
    cost: 100,
    encumbrance: 2,
    techLevel: 4,
    description: 'Designed for survival in hard vacuum and inhospitable surfaces. Protects against ordinary cosmic radiation and provides temperature-controlled atmosphere. Equipped with radios (10km range). Oxygen tank lasts six hours. Applies -2 to all hit rolls and movement skill checks (waived with one month zero-gee experience). Grants AC 13 but no armor can be worn with it. Requires type A cell per 12 hours.'
  },
  {
    id: 'vacc-skin',
    name: 'Vacc Skin',
    category: 'gear',
    subCategory: 'survival',
    cost: 1000,
    encumbrance: 1,
    techLevel: 5,
    description: 'Skin-tight suit worn as readied item in conjunction with armor (grants no AC bonus itself). Requires no oxygen tank, automatically cracking and recycling respiration. Can recycle bodily waste into drinkable water. No penalty to hit rolls or skill checks. Suffers tears same as normal vacc suit. Requires type A cell per 24 hours.'
  },
  {
    id: 'pressure-tent',
    name: 'Pressure Tent',
    category: 'gear',
    subCategory: 'survival',
    cost: 100,
    encumbrance: 4,
    techLevel: 3,
    description: 'Maintains breathable atmosphere, tolerable temperature, and sleeping quarters for up to five very friendly occupants. A single vacc suit oxygen tank provides breathable air for 24 hours. Requires type A cell per day for the filter.'
  },
  {
    id: 'survival-kit',
    name: 'Survival Kit',
    category: 'gear',
    subCategory: 'survival',
    cost: 60,
    encumbrance: 1,
    techLevel: 4,
    description: 'Belt-worn kit with fire lighter, water filter, three thermal flares, knife, thermal blanket, 3x3m waterproof tarp, glowbug, and radio beacon (50km distress signal for one month on included type A cell). Grants +1 to all relevant Survive skill checks.'
  },
  {
    id: 'atmofilter',
    name: 'Atmofilter',
    category: 'gear',
    subCategory: 'survival',
    cost: 100,
    encumbrance: 1,
    techLevel: 4,
    description: 'Face mask that can filter out most atmospheric toxins. With a standard vacc suit oxygen bottle attached, supplies breathable atmosphere for up to six hours.'
  },
  {
    id: 'instapanel',
    name: 'Instapanel',
    category: 'gear',
    subCategory: 'survival',
    cost: 50,
    encumbrance: 1,
    techLevel: 4,
    description: 'Compressed form is a two-kilo cube. When a type A cell is inserted, immediately expands to an opaque, waterproof ceraplast sheet 2 meters on each side and a centimeter thick. Hardens in five minutes but can be folded until then. Can be bonded together with a metatool. Breaking one requires at least 12 points of damage.'
  },
  {
    id: 'grav-chute',
    name: 'Grav Chute',
    category: 'gear',
    subCategory: 'survival',
    cost: 300,
    encumbrance: 1,
    techLevel: 4,
    description: 'Smoothly modulates falling speeds for up to 1,000 meters. Can safely slow up to 300 kilos. Burns out after one use.'
  },
  {
    id: 'telescoping-pole',
    name: 'Telescoping Pole',
    category: 'gear',
    subCategory: 'survival',
    cost: 10,
    encumbrance: 0,
    techLevel: 4,
    description: 'Retracts to a 30cm baton, extends and locks to a 3-meter extension. Can bear up to one thousand kilograms or serve as a makeshift club.'
  },
  {
    id: 'thermal-flare',
    name: 'Thermal Flare',
    category: 'gear',
    subCategory: 'survival',
    cost: 5,
    encumbrance: 0,
    techLevel: 3,
    description: 'Burns bright white light for two hours illuminating up to 20 meters. If guidance fins are extended first, launches up to 200 meters and explodes in a bright white flash. A launched flare does 1d6 damage with -4 to hit.'
  },
  {
    id: 'portabox',
    name: 'Portabox',
    category: 'gear',
    subCategory: 'survival',
    cost: 50,
    encumbrance: 1,
    techLevel: 4,
    description: 'Small cube of ceraplast with electronic keycard. When type A cell inserted, unfolds into a rigid 1.5x1x1m locker. Air-tight, electronic lock opened with keycard or difficulty 8 Sneak/Fix check. Failed check short-circuits lock until cut open.'
  },
  {
    id: 'ammo-20-rounds',
    name: 'Ammunition (20 rounds)',
    category: 'gear',
    subCategory: 'ammunition',
    cost: 10,
    encumbrance: 1,
    techLevel: 2,
    description: 'Standard ammunition for projectile weapons. Available in almost every conceivable caliber and make on most worlds.'
  },
  {
    id: 'ammo-missile',
    name: 'Ammunition (Missile)',
    category: 'gear',
    subCategory: 'ammunition',
    cost: 50,
    encumbrance: 1,
    techLevel: 3,
    description: 'Heavy weapon ammunition. Usually outlawed for civilians on most worlds.'
  },
  {
    id: 'power-cell-type-a',
    name: 'Power Cell (Type A)',
    category: 'gear',
    subCategory: 'ammunition',
    cost: 10,
    encumbrance: 1,
    techLevel: 4,
    description: 'Small cylindrical cells designed to take and hold electrical charges. Used for personal equipment and energy weapons. Recharging requires 30 minutes off a ship\'s power plant or other grid.'
  },
  {
    id: 'power-cell-type-b',
    name: 'Power Cell (Type B)',
    category: 'gear',
    subCategory: 'ammunition',
    cost: 100,
    encumbrance: 1,
    techLevel: 4,
    description: 'Larger cells for vehicles and heavy gear such as powered armor. Recharging requires 24 hours. Type A and B cells cannot exchange or recharge each other without modifications.'
  },
  {
    id: 'solar-recharger',
    name: 'Solar Recharger',
    category: 'gear',
    subCategory: 'ammunition',
    cost: 500,
    encumbrance: 3,
    techLevel: 4,
    description: 'Unfolds into a 2m square field of solar cells. Given Earth-like solar intensity, can recharge one type A power cell per day.'
  },
  {
    id: 'scout-report',
    name: 'Scout Report',
    category: 'gear',
    subCategory: 'information',
    cost: 200,
    encumbrance: 0,
    techLevel: 4,
    description: 'Collation of survey scans and merchant reports on a particular lost world or isolated colony. Available for all but the most unknown worlds, providing maps, basic information, and critical cultural taboos.'
  },
  {
    id: 'trade-goods',
    name: 'Trade Goods',
    category: 'gear',
    subCategory: 'trade',
    cost: 50,
    encumbrance: 1,
    techLevel: 4,
    description: 'Glowbugs, ceramic fire lighters, antibiotics, ceraplast tools, and other TL4 fruits. A kilo can be traded for at least a hundred credits worth of local products on more primitive worlds.'
  },
  {
    id: 'trade-metals',
    name: 'Trade Metals',
    category: 'gear',
    subCategory: 'trade',
    cost: 10,
    encumbrance: 1,
    techLevel: 4,
    description: 'Gold, platinum, artificial gemstones. A kilo can be exchanged for as much as a thousand credits on metal-poor worlds isolated from trade.'
  }
];

// All equipment combined
export const ALL_EQUIPMENT: EquipmentItem[] = [
  ...MELEE_WEAPONS,
  ...RANGED_WEAPONS,
  ...ARMOR,
  ...GEAR
];

// Equipment Packages
export const EQUIPMENT_PACKAGES: EquipmentPackage[] = [
  {
    id: 'starfarer',
    name: 'Starfarer Package',
    description: 'Basic equipment for a spacer. Includes essentials for ship duty and light exploration.',
    items: [
      'semi-auto-pistol',
      'ammo-20-rounds',
      'ammo-20-rounds',
      'armored-undersuit',
      'compad',
      'metatool',
      'lazarus-patch',
      'lazarus-patch',
      'glowbug',
      'glowbug',
      'rations-1-day',
      'rations-1-day',
      'rations-1-day',
      'rations-1-day',
      'rations-1-day',
      'rations-1-day',
      'rations-1-day'
    ],
    credits: 250
  },
  {
    id: 'soldier',
    name: 'Soldier Package',
    description: 'Military-grade gear for combat operations.',
    items: [
      'combat-rifle',
      'ammo-20-rounds',
      'ammo-20-rounds',
      'ammo-20-rounds',
      'semi-auto-pistol',
      'ammo-20-rounds',
      'combat-field-uniform',
      'compad',
      'medkit',
      'lazarus-patch',
      'lazarus-patch'
    ],
    credits: 100
  },
  {
    id: 'technician',
    name: 'Technician Package',
    description: 'Tools and equipment for technical specialists.',
    items: [
      'laser-pistol',
      'power-cell-type-a',
      'secure-clothing',
      'dataslab',
      'metatool',
      'toolkit-postech',
      'compad',
      'lazarus-patch',
      'glowbug'
    ],
    credits: 300
  },
  {
    id: 'explorer',
    name: 'Explorer Package',
    description: 'Survival gear for frontier exploration.',
    items: [
      'rifle',
      'ammo-20-rounds',
      'ammo-20-rounds',
      'woven-body-armor',
      'compad',
      'bioscanner',
      'survey-scanner',
      'medkit',
      'vacc-suit',
      'rations-1-day',
      'rations-1-day',
      'rations-1-day',
      'rations-1-day',
      'rations-1-day',
      'rations-1-day',
      'rations-1-day',
      'rations-1-day',
      'rations-1-day',
      'rations-1-day',
      'rations-1-day',
      'rations-1-day',
      'rations-1-day',
      'rations-1-day',
      'rope-20m'
    ],
    credits: 50
  },
  {
    id: 'specialist',
    name: 'Specialist Package',
    description: 'Light gear for skilled professionals and experts.',
    items: [
      'semi-auto-pistol',
      'ammo-20-rounds',
      'secure-clothing',
      'compad',
      'dataslab',
      'translator-torc',
      'lazarus-patch',
      'lazarus-patch'
    ],
    credits: 400
  },
  {
    id: 'criminal',
    name: 'Criminal Package',
    description: 'Discrete equipment for those who operate outside the law.',
    items: [
      'semi-auto-pistol',
      'ammo-20-rounds',
      'small-primitive-weapon',
      'armored-undersuit',
      'compad',
      'metatool',
      'glowbug',
      'climbing-harness',
      'rope-20m'
    ],
    credits: 400
  }
];

// Helper functions
export function getEquipmentById(id: string): EquipmentItem | undefined {
  return ALL_EQUIPMENT.find(e => e.id === id);
}

export function getPackageById(id: string): EquipmentPackage | undefined {
  return EQUIPMENT_PACKAGES.find(p => p.id === id);
}

export function getEquipmentByCategory(category: 'weapon' | 'armor' | 'gear'): EquipmentItem[] {
  return ALL_EQUIPMENT.filter(e => e.category === category);
}

export function calculatePackageValue(packageId: string): number {
  const pkg = getPackageById(packageId);
  if (!pkg) return 0;

  let total = pkg.credits;
  for (const itemId of pkg.items) {
    const item = getEquipmentById(itemId);
    if (item) {
      total += item.cost;
    }
  }
  return total;
}

// Starting credits for character creation
export const STARTING_CREDITS = 2000;

// Calculate AC from readied inventory items + Dex modifier
// SWN: AC = best armor AC (or 10 unarmored) + Dex mod + shield bonus
export function calculateAC(inventory: { itemId: string; location: string; quantity: number; customCategory?: string; customArmorClass?: number }[], dexMod: number): number {
  let bestArmorAC = 10; // base unarmored
  let shieldBonus = 0;

  for (const inv of inventory) {
    if (inv.location !== 'readied') continue;

    // Handle custom armor items
    if (inv.itemId.startsWith('custom-')) {
      if (inv.customCategory === 'armor' && inv.customArmorClass && inv.customArmorClass > bestArmorAC) {
        bestArmorAC = inv.customArmorClass;
      }
      continue;
    }

    const item = getEquipmentById(inv.itemId);
    if (!item || item.category !== 'armor') continue;

    if (item.id === 'shield') {
      // Shield: grants base AC 13, or +1 if bearer's AC is already >= 13
      shieldBonus = 1;
    } else if (item.armorClass && item.armorClass > bestArmorAC) {
      bestArmorAC = item.armorClass;
    }
  }

  return bestArmorAC + dexMod + shieldBonus;
}
