export const Material = {
  Empty: 0,
  Sand: 1,
  Water: 2,
  WetSand: 3,
  Gold: 4,
  Residue: 5,
  Dirt: 6,
  Stone: 7,
  Lava: 8,
  Steam: 9,
  Bedrock: 10,
  Shaker: 11,
} as const;

export type MaterialId = (typeof Material)[keyof typeof Material];

export type MatterPhase = 'powder' | 'slushy' | 'liquid' | 'gas' | 'static';

export interface MaterialDef {
  id: MaterialId;
  name: string;
  phase: MatterPhase;
  density: number;
  /** Chance to stay put when blocked below. Higher = steeper piles. */
  friction: number;
  maxSpeed: number;
  /** Extra horizontal steps for liquids/gases per tick. */
  flow: number;
  color: [number, number, number, number];
  hotkey: string;
  /** Settled dynamic powder can freeze back into terrain. */
  canFreeze: boolean;
  /** Static cell becomes this when dug. Omit = same material, just dynamic. */
  digsTo?: MaterialId;
  /** Static liquid/gas starts flowing when a neighbor becomes empty. */
  exposesWhenOpen?: boolean;
}

export const MATERIALS: MaterialDef[] = [];

function define(def: MaterialDef): void {
  MATERIALS[def.id] = def;
}

define({
  id: Material.Empty,
  name: 'Empty',
  phase: 'static',
  density: 0,
  friction: 1,
  maxSpeed: 0,
  flow: 0,
  color: [10, 12, 18, 255],
  hotkey: 'X',
  canFreeze: false,
});

define({
  id: Material.Sand,
  name: 'Sand',
  phase: 'powder',
  density: 150,
  friction: 0.38,
  maxSpeed: 3,
  flow: 0,
  color: [210, 176, 108, 255],
  hotkey: '1',
  canFreeze: true,
});

define({
  id: Material.Water,
  name: 'Water',
  phase: 'liquid',
  density: 100,
  friction: 0.02,
  maxSpeed: 3,
  flow: 3,
  color: [48, 132, 196, 210],
  hotkey: '2',
  canFreeze: false,
  exposesWhenOpen: true,
});

define({
  id: Material.WetSand,
  name: 'Wet Sand',
  phase: 'slushy',
  density: 150,
  friction: 0.14,
  maxSpeed: 3,
  flow: 1,
  color: [132, 102, 64, 255],
  hotkey: '3',
  canFreeze: true,
});

define({
  id: Material.Gold,
  name: 'Gold',
  phase: 'powder',
  density: 400,
  friction: 0.52,
  maxSpeed: 4,
  flow: 0,
  color: [236, 188, 52, 255],
  hotkey: '4',
  canFreeze: true,
});

define({
  id: Material.Residue,
  name: 'Residue',
  phase: 'powder',
  density: 80,
  friction: 0.22,
  maxSpeed: 3,
  flow: 0,
  color: [108, 102, 86, 255],
  hotkey: '5',
  canFreeze: true,
});

define({
  id: Material.Dirt,
  name: 'Dirt',
  phase: 'static',
  density: 200,
  friction: 1,
  maxSpeed: 0,
  flow: 0,
  color: [92, 58, 32, 255],
  hotkey: '6',
  canFreeze: false,
  digsTo: Material.Sand,
});

define({
  id: Material.Stone,
  name: 'Stone',
  phase: 'powder',
  density: 260,
  friction: 0.62,
  maxSpeed: 3,
  flow: 0,
  color: [98, 104, 112, 255],
  hotkey: '7',
  canFreeze: true,
});

define({
  id: Material.Lava,
  name: 'Lava',
  phase: 'liquid',
  density: 350,
  friction: 0.28,
  maxSpeed: 2,
  flow: 1,
  color: [232, 78, 22, 255],
  hotkey: '8',
  canFreeze: false,
  exposesWhenOpen: true,
});

define({
  id: Material.Steam,
  name: 'Steam',
  phase: 'gas',
  density: 25,
  friction: 0.04,
  maxSpeed: 2,
  flow: 2,
  color: [198, 208, 216, 140],
  hotkey: '9',
  canFreeze: false,
  exposesWhenOpen: true,
});

define({
  id: Material.Bedrock,
  name: 'Bedrock',
  phase: 'static',
  density: 9999,
  friction: 1,
  maxSpeed: 0,
  flow: 0,
  color: [28, 30, 36, 255],
  hotkey: '',
  canFreeze: false,
});

define({
  id: Material.Shaker,
  name: 'Shaker',
  phase: 'static',
  density: 9999,
  friction: 1,
  maxSpeed: 0,
  flow: 0,
  color: [176, 148, 72, 255],
  hotkey: '0',
  canFreeze: false,
});

export const PAINTABLE_MATERIALS: MaterialId[] = [
  Material.Sand,
  Material.Water,
  Material.WetSand,
  Material.Gold,
  Material.Residue,
  Material.Dirt,
  Material.Stone,
  Material.Lava,
  Material.Steam,
  Material.Shaker,
  Material.Empty,
];

export function isTerrainPhase(id: number): boolean {
  const def = MATERIALS[id];
  return !def || def.phase === 'static';
}

export function paintsLoose(id: number): boolean {
  const def = MATERIALS[id];
  return !!def && def.phase !== 'static' && id !== Material.Empty;
}
