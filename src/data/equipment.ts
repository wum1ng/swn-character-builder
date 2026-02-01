// Equipment data for Stars Without Number

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
  range?: string;
  attribute?: 'strength' | 'dexterity';
  magazineSize?: number;
  // Armor properties
  armorClass?: number;
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
    cost: 3,
    encumbrance: 1,
    techLevel: 0,
    damage: '1d4',
    attribute: 'strength',
    description: 'Knife, hatchet, sap, or other small weapon'
  },
  {
    id: 'medium-primitive-weapon',
    name: 'Medium Primitive Weapon',
    category: 'weapon',
    subCategory: 'melee',
    cost: 5,
    encumbrance: 1,
    techLevel: 0,
    damage: '1d6+1',
    attribute: 'strength',
    description: 'Spear, sword, axe, or other medium weapon'
  },
  {
    id: 'large-primitive-weapon',
    name: 'Large Primitive Weapon',
    category: 'weapon',
    subCategory: 'melee',
    cost: 10,
    encumbrance: 2,
    techLevel: 0,
    damage: '1d8+1',
    attribute: 'strength',
    description: 'Great sword, polearm, or other large two-handed weapon'
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
    attribute: 'strength',
    description: 'Shocks target; save vs. Physical or stunned for 1 round'
  },
  {
    id: 'monoblade',
    name: 'Monoblade',
    category: 'weapon',
    subCategory: 'melee',
    cost: 200,
    encumbrance: 1,
    techLevel: 4,
    damage: '1d8+1',
    attribute: 'strength',
    description: 'Monomolecular-edged blade, ignores 2 points of armor'
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
    techLevel: 0,
    damage: '1d6',
    range: '50/100',
    attribute: 'dexterity',
    description: 'Simple bow, requires arrows'
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
    description: 'Reliable six-shot pistol'
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
    description: 'Standard sidearm'
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
    description: 'Long-range hunting or combat rifle'
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
    description: 'Powerful at close range'
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
    description: 'Military assault rifle'
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
    description: 'Energy sidearm, ignores 2 points of armor'
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
    description: 'Energy rifle, ignores 2 points of armor'
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
    description: 'Plasma sidearm'
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
    armorClass: 1,
    description: '+1 AC, requires one hand'
  },
  {
    id: 'primitive-armor',
    name: 'Primitive Armor',
    category: 'armor',
    cost: 20,
    encumbrance: 2,
    techLevel: 0,
    armorClass: 13,
    description: 'Leather, hide, or padded armor'
  },
  {
    id: 'armored-undersuit',
    name: 'Armored Undersuit',
    category: 'armor',
    cost: 600,
    encumbrance: 0,
    techLevel: 4,
    armorClass: 13,
    description: 'Concealable armor worn under clothing'
  },
  {
    id: 'secure-clothing',
    name: 'Secure Clothing',
    category: 'armor',
    cost: 300,
    encumbrance: 1,
    techLevel: 4,
    armorClass: 13,
    description: 'Stylish armored business wear'
  },
  {
    id: 'woven-body-armor',
    name: 'Woven Body Armor',
    category: 'armor',
    cost: 400,
    encumbrance: 2,
    techLevel: 3,
    armorClass: 15,
    description: 'Standard combat vest'
  },
  {
    id: 'combat-field-uniform',
    name: 'Combat Field Uniform',
    category: 'armor',
    cost: 500,
    encumbrance: 1,
    techLevel: 4,
    armorClass: 14,
    description: 'Military duty uniform with integrated protection'
  },
  {
    id: 'security-armor',
    name: 'Security Armor',
    category: 'armor',
    cost: 700,
    encumbrance: 2,
    techLevel: 4,
    armorClass: 16,
    description: 'Heavy tactical armor'
  },
  {
    id: 'powered-armor',
    name: 'Powered Armor',
    category: 'armor',
    cost: 10000,
    encumbrance: 0,
    techLevel: 5,
    armorClass: 18,
    description: 'Powered exoskeleton with full protection'
  }
];

// General Equipment
export const GEAR: EquipmentItem[] = [
  {
    id: 'backpack',
    name: 'Backpack',
    category: 'gear',
    subCategory: 'containers',
    cost: 5,
    encumbrance: 1,
    techLevel: 0,
    description: 'Carries items up to 4 encumbrance as 2'
  },
  {
    id: 'compad',
    name: 'Compad',
    category: 'gear',
    subCategory: 'electronics',
    cost: 100,
    encumbrance: 0,
    techLevel: 4,
    description: 'Tablet computer with comm capabilities'
  },
  {
    id: 'dataslab',
    name: 'Dataslab',
    category: 'gear',
    subCategory: 'electronics',
    cost: 300,
    encumbrance: 1,
    techLevel: 4,
    description: 'Portable computer for technical work'
  },
  {
    id: 'comm-server',
    name: 'Comm Server',
    category: 'gear',
    subCategory: 'electronics',
    cost: 1000,
    encumbrance: 3,
    techLevel: 4,
    description: 'Powerful computing and communications hub'
  },
  {
    id: 'metatool',
    name: 'Metatool',
    category: 'gear',
    subCategory: 'tools',
    cost: 200,
    encumbrance: 1,
    techLevel: 4,
    description: 'Multifunctional repair tool'
  },
  {
    id: 'toolkit-postech',
    name: 'Toolkit (Postech)',
    category: 'gear',
    subCategory: 'tools',
    cost: 300,
    encumbrance: 3,
    techLevel: 4,
    description: 'Complete toolkit for tech repair'
  },
  {
    id: 'medkit',
    name: 'Medkit',
    category: 'gear',
    subCategory: 'medical',
    cost: 100,
    encumbrance: 2,
    techLevel: 4,
    description: 'Heals 1d6+Heal skill HP, 6 uses'
  },
  {
    id: 'lazarus-patch',
    name: 'Lazarus Patch',
    category: 'gear',
    subCategory: 'medical',
    cost: 30,
    encumbrance: 0,
    techLevel: 4,
    description: 'Stabilizes mortally wounded, single use'
  },
  {
    id: 'bioscanner',
    name: 'Bioscanner',
    category: 'gear',
    subCategory: 'sensors',
    cost: 300,
    encumbrance: 1,
    techLevel: 4,
    description: 'Detects life signs within 100m'
  },
  {
    id: 'survey-scanner',
    name: 'Survey Scanner',
    category: 'gear',
    subCategory: 'sensors',
    cost: 500,
    encumbrance: 2,
    techLevel: 4,
    description: 'Geological and atmospheric analysis'
  },
  {
    id: 'glowbug',
    name: 'Glowbug',
    category: 'gear',
    subCategory: 'survival',
    cost: 5,
    encumbrance: 0,
    techLevel: 4,
    description: 'Chemical light stick, lasts 6 hours'
  },
  {
    id: 'grappling-hook',
    name: 'Grappling Hook',
    category: 'gear',
    subCategory: 'survival',
    cost: 25,
    encumbrance: 1,
    techLevel: 2,
    description: 'With 20m line'
  },
  {
    id: 'climbing-harness',
    name: 'Climbing Harness',
    category: 'gear',
    subCategory: 'survival',
    cost: 25,
    encumbrance: 1,
    techLevel: 2,
    description: 'For safe climbing'
  },
  {
    id: 'rope-20m',
    name: 'Rope (20m)',
    category: 'gear',
    subCategory: 'survival',
    cost: 4,
    encumbrance: 2,
    techLevel: 0,
    description: 'Strong synthetic rope'
  },
  {
    id: 'rations-1-week',
    name: 'Rations (1 week)',
    category: 'gear',
    subCategory: 'survival',
    cost: 20,
    encumbrance: 2,
    techLevel: 1,
    description: 'Preserved food for one week'
  },
  {
    id: 'vacc-suit',
    name: 'Vacc Suit',
    category: 'gear',
    subCategory: 'survival',
    cost: 100,
    encumbrance: 2,
    techLevel: 4,
    description: 'Emergency vacuum suit, 12 hours air'
  },
  {
    id: 'pressure-tent',
    name: 'Pressure Tent',
    category: 'gear',
    subCategory: 'survival',
    cost: 100,
    encumbrance: 4,
    techLevel: 4,
    description: 'Pressurized shelter for 2 people'
  },
  {
    id: 'ammo-20-rounds',
    name: 'Ammunition (20 rounds)',
    category: 'gear',
    subCategory: 'ammunition',
    cost: 10,
    encumbrance: 1,
    techLevel: 2,
    description: 'Standard ammunition for projectile weapons'
  },
  {
    id: 'power-cell-type-a',
    name: 'Power Cell (Type A)',
    category: 'gear',
    subCategory: 'ammunition',
    cost: 10,
    encumbrance: 1,
    techLevel: 4,
    description: 'Energy weapon power cell'
  },
  {
    id: 'thermal-cell',
    name: 'Thermal Cell',
    category: 'gear',
    subCategory: 'ammunition',
    cost: 50,
    encumbrance: 1,
    techLevel: 4,
    description: 'For plasma weapons'
  },
  {
    id: 'translator-torc',
    name: 'Translator Torc',
    category: 'gear',
    subCategory: 'electronics',
    cost: 200,
    encumbrance: 0,
    techLevel: 4,
    description: 'Translates known languages in real time'
  },
  {
    id: 'nav-computer',
    name: 'Nav Computer',
    category: 'gear',
    subCategory: 'electronics',
    cost: 500,
    encumbrance: 1,
    techLevel: 4,
    description: 'Portable navigation computer'
  },
  {
    id: 'instapanel',
    name: 'Instapanel',
    category: 'gear',
    subCategory: 'survival',
    cost: 50,
    encumbrance: 1,
    techLevel: 4,
    description: 'Inflatable 3m wall section'
  },
  {
    id: 'low-light-goggles',
    name: 'Low-Light Goggles',
    category: 'gear',
    subCategory: 'sensors',
    cost: 200,
    encumbrance: 0,
    techLevel: 3,
    description: 'See in dim light'
  },
  {
    id: 'thermal-flare',
    name: 'Thermal Flare',
    category: 'gear',
    subCategory: 'survival',
    cost: 5,
    encumbrance: 0,
    techLevel: 3,
    description: 'Emergency signal flare'
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
      'rations-1-week'
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
      'rations-1-week',
      'rations-1-week',
      'rope-20m',
      'grappling-hook'
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
      'grappling-hook',
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
      shieldBonus = item.armorClass || 1;
    } else if (item.armorClass && item.armorClass > bestArmorAC) {
      bestArmorAC = item.armorClass;
    }
  }

  return bestArmorAC + dexMod + shieldBonus;
}
