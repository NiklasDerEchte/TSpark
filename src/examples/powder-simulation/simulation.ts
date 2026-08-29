import {
  Material,
  PowderWorldComponent,
  type PowderGrid,
  type Scene,
  type World,
} from '../../engine';

const WORLD_WIDTH = 640;
const WORLD_HEIGHT = 360;

export class PowderSimulationScene {
  private world: World;
  private scene: Scene;
  private powder!: PowderWorldComponent;

  constructor(world: World) {
    this.world = world;
    this.scene = this.world.createScene('powder-scene');
    this.createPowderWorld();
  }

  private createPowderWorld(): void {
    const entity = this.scene.createEntity();
    this.powder = new PowderWorldComponent({ width: WORLD_WIDTH, height: WORLD_HEIGHT });
    this.powder.regenerate = () => {
      generateSandustryTerrain(this.powder.grid, (Math.random() * 0xffff) | 0);
      this.powder.particleCount = this.powder.grid.countParticles();
    };
    this.powder.regenerate();
    this.scene.getComponentStore<PowderWorldComponent>(PowderWorldComponent.name).add(entity, this.powder);
  }
}

export function generateSandustryTerrain(grid: PowderGrid, seed: number = 1): void {
  grid.clear();
  const w = grid.width;
  const h = grid.height;
  const surface: number[] = new Array(w);

  for (let x = 0; x < w; x++) {
    const n1 = valueNoise1(x * 0.018, seed);
    const n2 = valueNoise1(x * 0.055, seed + 19);
    surface[x] = Math.floor(h * 0.22 + n1 * h * 0.1 + n2 * h * 0.04);
  }

  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const s = (hash2(x, y, seed) * 48) | 0;
      if (x === 0 || x === w - 1 || y === h - 1) {
        grid.set(x, y, Material.Bedrock, s);
        continue;
      }

      const ground = surface[x];
      if (y < ground) {
        continue;
      }

      const cave = fbm2(x * 0.035, y * 0.045, seed + 3);
      const caveOpen = y > ground + 6 && cave > 0.58 && cave < 0.92;
      if (caveOpen) {
        continue;
      }

      const depth = y - ground;
      const sandPocket = fbm2(x * 0.08, y * 0.08, seed + 9) > 0.72 && depth < 28;
      const goldVein = fbm2(x * 0.12, y * 0.16, seed + 21) > 0.8 && depth > 40;
      const dirtLayer = depth < 16 + hash2(x, y, seed) * 8;

      if (goldVein) {
        grid.set(x, y, Material.Gold, s);
      } else if (sandPocket) {
        grid.set(x, y, Material.Sand, s);
      } else if (dirtLayer) {
        grid.set(x, y, Material.Dirt, s);
      } else {
        grid.set(x, y, Material.Stone, s);
      }
    }
  }

  fillCaveWater(grid, surface, seed);
  buildDemoWorks(grid, surface, seed);
}

function fillCaveWater(grid: PowderGrid, surface: number[], seed: number): void {
  const w = grid.width;
  const h = grid.height;
  for (let x = 2; x < w - 2; x++) {
    if (hash2(x, 0, seed + 7) < 0.86) continue;
    for (let y = h - 3; y > surface[x] + 10; y--) {
      if (grid.get(x, y) !== Material.Empty) continue;
      if (grid.get(x, y + 1) === Material.Empty) continue;
      const depth = 4 + ((hash2(x, y, seed) * 10) | 0);
      for (let d = 0; d < depth; d++) {
        const wy = y - d;
        if (wy <= surface[x] + 4) break;
        for (let ox = -3; ox <= 3; ox++) {
          const wx = x + ox;
          if (grid.get(wx, wy) === Material.Empty && grid.get(wx, wy + 1) !== Material.Steam) {
            grid.set(wx, wy, Material.Water, (hash2(wx, wy, seed) * 48) | 0);
          }
        }
      }
      break;
    }
  }
}

function buildDemoWorks(grid: PowderGrid, surface: number[], _seed: number): void {
  const x0 = Math.floor(grid.width * 0.28);
  const y0 = Math.min(surface[x0] + 8, grid.height - 50);

  carveRect(grid, x0 - 6, y0 - 18, 70, 40);

  for (let x = x0; x < x0 + 28; x++) {
    grid.set(x, y0 + 12, Material.Stone);
    grid.set(x, y0 + 13, Material.Stone);
  }
  for (let y = y0 + 2; y <= y0 + 12; y++) {
    grid.set(x0, y, Material.Stone);
    grid.set(x0 + 27, y, Material.Stone);
  }
  for (let x = x0 + 1; x < x0 + 27; x++) {
    for (let y = y0 + 7; y < y0 + 12; y++) {
      grid.set(x, y, Material.Water);
    }
  }

  for (let x = x0 + 32; x < x0 + 56; x++) {
    if (x >= x0 + 36 && x <= x0 + 52) {
      grid.set(x, y0 + 9, Material.Shaker);
    } else {
      grid.set(x, y0 + 9, Material.Stone);
    }
    grid.set(x, y0 + 16, Material.Stone);
  }
  for (let y = y0 + 9; y <= y0 + 16; y++) {
    grid.set(x0 + 32, y, Material.Stone);
    grid.set(x0 + 55, y, Material.Stone);
  }

  for (let x = x0 + 8; x < x0 + 22; x++) {
    for (let y = y0 - 10; y < y0 - 1; y++) {
      grid.set(x, y, Material.Sand);
    }
  }

  const floatX = Math.floor(grid.width * 0.12);
  const floatY = Math.max(8, surface[floatX] - 28);
  for (let x = floatX; x < floatX + 22; x++) {
    for (let y = floatY; y < floatY + 10; y++) {
      grid.set(x, y, Material.Sand, (hash2(x, y, 3) * 48) | 0);
    }
  }
}

function carveRect(grid: PowderGrid, x: number, y: number, w: number, h: number): void {
  for (let oy = 0; oy < h; oy++) {
    for (let ox = 0; ox < w; ox++) {
      const cx = x + ox;
      const cy = y + oy;
      const cur = grid.get(cx, cy);
      if (cur !== Material.Bedrock) {
        grid.set(cx, cy, Material.Empty);
      }
    }
  }
}

function hash2(x: number, y: number, seed: number): number {
  let n = Math.imul(x + seed, 374761393) + Math.imul(y, 668265263);
  n = Math.imul(n ^ (n >>> 13), 1274126177);
  return (n >>> 0) / 4294967296;
}

function valueNoise1(x: number, seed: number): number {
  const x0 = Math.floor(x);
  const t = x - x0;
  const s = t * t * (3 - 2 * t);
  return hash2(x0, 0, seed) * (1 - s) + hash2(x0 + 1, 0, seed) * s;
}

function valueNoise2(x: number, y: number, seed: number): number {
  const x0 = Math.floor(x);
  const y0 = Math.floor(y);
  const tx = x - x0;
  const ty = y - y0;
  const sx = tx * tx * (3 - 2 * tx);
  const sy = ty * ty * (3 - 2 * ty);
  const a = hash2(x0, y0, seed);
  const b = hash2(x0 + 1, y0, seed);
  const c = hash2(x0, y0 + 1, seed);
  const d = hash2(x0 + 1, y0 + 1, seed);
  return a * (1 - sx) * (1 - sy) + b * sx * (1 - sy) + c * (1 - sx) * sy + d * sx * sy;
}

function fbm2(x: number, y: number, seed: number): number {
  return valueNoise2(x, y, seed) * 0.65 + valueNoise2(x * 2.1, y * 2.1, seed + 11) * 0.35;
}
