import type { System, WorldQueryData } from '../../core/types';
import type { World } from '../../core/world';
import { MATERIALS, Material } from './materials';
import { CellFlag, type PowderGrid } from './powder-grid';
import { PowderWorldComponent } from './powder-world';

export class PowderSystem implements System {
  world!: World;
  private rng: number = 1;
  private scanLeftToRight: boolean = true;

  init(world: World): void {
    this.world = world;
  }

  exec(_deltaTimeMs: number): void {
    this.world.query<PowderWorldComponent>(PowderWorldComponent.name, (result: WorldQueryData<PowderWorldComponent>) => {
      const powder = result.component;
      if (powder.paused) return;
      this.step(powder);
    });
  }

  destroy(): void {}

  private step(powder: PowderWorldComponent): void {
    const grid = powder.grid;
    grid.beginTick();
    powder.tick++;
    this.scanLeftToRight = !this.scanLeftToRight;
    this.rng ^= powder.tick + 0x9e3779b9;

    const { chunkCols, chunkRows, chunkSize, chunkActive } = grid;

    for (let cy = chunkRows - 1; cy >= 0; cy--) {
      const xStart = this.scanLeftToRight ? 0 : chunkCols - 1;
      const xEnd = this.scanLeftToRight ? chunkCols : -1;
      const xStep = this.scanLeftToRight ? 1 : -1;
      for (let cx = xStart; cx !== xEnd; cx += xStep) {
        if (!chunkActive[cy * chunkCols + cx]) continue;
        this.stepChunk(grid, cx, cy, chunkSize);
      }
    }

    if ((powder.tick & 3) === 0) {
      powder.particleCount = grid.countParticles();
    }
  }

  private stepChunk(grid: PowderGrid, cx: number, cy: number, chunkSize: number): void {
    const idx = cy * grid.chunkCols + cx;
    let x0 = cx * chunkSize;
    let y0 = cy * chunkSize;
    let x1 = Math.min(x0 + chunkSize, grid.width);
    let y1 = Math.min(y0 + chunkSize, grid.height);
    const minX = grid.chunkActiveMinX[idx];
    if (minX >= 0) {
      const pad = 1;
      x0 = Math.max(x0, minX - pad);
      y0 = Math.max(y0, grid.chunkActiveMinY[idx] - pad);
      x1 = Math.min(x1, grid.chunkActiveMaxX[idx] + pad + 1);
      y1 = Math.min(y1, grid.chunkActiveMaxY[idx] + pad + 1);
    }
    const xFirst = this.scanLeftToRight ? x0 : x1 - 1;
    const xLast = this.scanLeftToRight ? x1 : x0 - 1;
    const xStep = this.scanLeftToRight ? 1 : -1;

    for (let y = y1 - 1; y >= y0; y--) {
      for (let x = xFirst; x !== xLast; x += xStep) {
        this.stepCell(grid, x, y);
      }
    }
  }

  private stepCell(grid: PowderGrid, x: number, y: number): void {
    const i = y * grid.width + x;
    if (grid.updated[i] === grid.stamp) return;
    const id = grid.cells[i];
    if (id === Material.Empty) return;
    if ((grid.flags[i] & CellFlag.Dynamic) === 0) return;
    const def = MATERIALS[id];
    if (!def || def.phase === 'static') return;

    if (this.react(grid, x, y, id)) return;
    if (id === Material.WetSand && this.processShaker(grid, x, y)) return;

    if (def.phase === 'liquid') {
      this.stepLiquid(grid, x, y, i, def.maxSpeed, def.flow, def.friction);
      return;
    }
    if (def.phase === 'gas') {
      this.stepGas(grid, x, y, i, def.maxSpeed, def.flow);
      return;
    }
    this.stepPowder(grid, x, y, i, def.maxSpeed, def.friction, def.phase === 'slushy', def.flow);
  }

  private stepPowder(
    grid: PowderGrid,
    x: number,
    y: number,
    i: number,
    maxSpeed: number,
    friction: number,
    slushy: boolean,
    flow: number,
  ): void {
    const wasSettled = grid.vx[i] === 0 && grid.vy[i] === 0;
    let vx = grid.vx[i];
    let vy = grid.vy[i] + 1;
    if (vy > maxSpeed) vy = maxSpeed;

    let cx = x;
    let cy = y;
    let fell = false;
    for (let s = 0; s < vy; s++) {
      if (grid.tryMove(cx, cy, cx, cy + 1)) {
        cy += 1;
        fell = true;
      } else {
        break;
      }
    }

    if (fell) {
      const ni = cy * grid.width + cx;
      const below = grid.get(cx, cy + 1);
      if (below !== Material.Empty && !grid.canDisplace(grid.cells[ni], below, grid.isDynamic(cx, cy + 1))) {
        if (vy > 1) {
          vx += this.rand() < 0.5 ? -1 : 1;
        }
        vy = 0;
      }
      grid.vx[ni] = vx;
      grid.vy[ni] = vy;
      return;
    }

    if (wasSettled && this.rand() < friction) {
      grid.vx[i] = 0;
      grid.vy[i] = 0;
      grid.tryFreeze(x, y);
      return;
    }

    let dir = vx > 0 ? 1 : vx < 0 ? -1 : this.rand() < 0.5 ? 1 : -1;
    if (grid.tryMove(x, y, x + dir, y + 1)) {
      const ni = (y + 1) * grid.width + (x + dir);
      grid.vx[ni] = dir;
      grid.vy[ni] = 0;
      return;
    }
    dir = -dir;
    if (grid.tryMove(x, y, x + dir, y + 1)) {
      const ni = (y + 1) * grid.width + (x + dir);
      grid.vx[ni] = dir;
      grid.vy[ni] = 0;
      return;
    }

    if (Math.abs(vx) >= 1 || slushy) {
      const hdir = Math.abs(vx) >= 1 ? (vx > 0 ? 1 : -1) : dir;
      const steps = slushy ? Math.max(1, flow) : 1;
      for (let s = 1; s <= steps; s++) {
        if (grid.tryMove(x, y, x + hdir * s, y)) {
          const ni = y * grid.width + (x + hdir * s);
          grid.vx[ni] = hdir;
          grid.vy[ni] = 0;
          return;
        }
        if (grid.get(x + hdir * s, y) !== Material.Empty) break;
      }
    }

    grid.vx[i] = 0;
    grid.vy[i] = 0;
    grid.tryFreeze(x, y);
  }

  private stepLiquid(grid: PowderGrid, x: number, y: number, i: number, maxSpeed: number, flow: number, friction: number): void {
    let vx = grid.vx[i];
    let vy = grid.vy[i] + 1;
    if (vy > maxSpeed) vy = maxSpeed;

    let cx = x;
    let cy = y;
    let fell = false;
    for (let s = 0; s < vy; s++) {
      if (grid.tryMove(cx, cy, cx, cy + 1)) {
        cy += 1;
        fell = true;
      } else {
        break;
      }
    }
    if (fell) {
      const ni = cy * grid.width + cx;
      grid.vx[ni] = vx;
      grid.vy[ni] = grid.get(cx, cy + 1) === Material.Empty ? vy : 0;
      return;
    }

    const prefer = vx !== 0 ? (vx > 0 ? 1 : -1) : this.scanLeftToRight ? 1 : -1;
    if (grid.tryMove(x, y, x + prefer, y + 1)) {
      const ni = (y + 1) * grid.width + (x + prefer);
      grid.vx[ni] = prefer;
      grid.vy[ni] = 0;
      return;
    }
    if (grid.tryMove(x, y, x - prefer, y + 1)) {
      const ni = (y + 1) * grid.width + (x - prefer);
      grid.vx[ni] = -prefer;
      grid.vy[ni] = 0;
      return;
    }

    if (this.rand() < friction) {
      grid.vx[i] = prefer;
      grid.vy[i] = 0;
      return;
    }

    for (const dir of [prefer, -prefer]) {
      let lx = x;
      let moved = false;
      for (let s = 0; s < flow; s++) {
        if (!grid.tryMove(lx, y, lx + dir, y)) break;
        lx += dir;
        moved = true;
      }
      if (moved) {
        const ni = y * grid.width + lx;
        grid.vx[ni] = dir;
        grid.vy[ni] = 0;
        return;
      }
    }

    grid.vx[i] = -prefer;
    grid.vy[i] = 0;
  }

  private stepGas(grid: PowderGrid, x: number, y: number, i: number, maxSpeed: number, flow: number): void {
    if (y === 0) {
      grid.set(x, y, Material.Empty);
      return;
    }

    const vx = grid.vx[i];
    let cx = x;
    let cy = y;
    let rose = false;
    for (let s = 0; s < maxSpeed; s++) {
      if (cy === 0) {
        grid.set(cx, cy, Material.Empty);
        return;
      }
      if (grid.tryMove(cx, cy, cx, cy - 1)) {
        cy -= 1;
        rose = true;
      } else {
        break;
      }
    }
    if (rose) {
      const ni = cy * grid.width + cx;
      grid.vx[ni] = vx;
      grid.vy[ni] = -1;
      return;
    }

    const prefer = this.rand() < 0.5 ? 1 : -1;
    if (grid.tryMove(x, y, x + prefer, y - 1)) {
      const ni = (y - 1) * grid.width + (x + prefer);
      grid.vx[ni] = prefer;
      grid.vy[ni] = -1;
      return;
    }
    if (grid.tryMove(x, y, x - prefer, y - 1)) {
      const ni = (y - 1) * grid.width + (x - prefer);
      grid.vx[ni] = -prefer;
      grid.vy[ni] = -1;
      return;
    }

    for (const dir of [prefer, -prefer]) {
      for (let s = 1; s <= flow; s++) {
        if (grid.tryMove(x, y, x + dir * s, y)) {
          const ni = y * grid.width + (x + dir * s);
          grid.vx[ni] = dir;
          grid.vy[ni] = 0;
          return;
        }
        if (grid.get(x + dir * s, y) !== Material.Empty) break;
      }
    }
  }

  private react(grid: PowderGrid, x: number, y: number, id: number): boolean {
    const nxs = [x, x, x - 1, x + 1];
    const nys = [y - 1, y + 1, y, y];
    for (let k = 0; k < 4; k++) {
      const nx = nxs[k];
      const ny = nys[k];
      if (!grid.inBounds(nx, ny)) continue;
      const nid = grid.get(nx, ny);

      if ((id === Material.Sand && nid === Material.Water) || (id === Material.Water && nid === Material.Sand)) {
        grid.setLoose(x, y, Material.WetSand, grid.shade[grid.index(x, y)]);
        grid.setLoose(nx, ny, Material.WetSand);
        return true;
      }

      if ((id === Material.Lava && nid === Material.Water) || (id === Material.Water && nid === Material.Lava)) {
        if (id === Material.Lava) {
          grid.set(x, y, Material.Stone);
          grid.setLoose(nx, ny, Material.Steam);
        } else {
          grid.setLoose(x, y, Material.Steam);
          grid.set(nx, ny, Material.Stone);
        }
        return true;
      }

      if (id === Material.Lava && nid === Material.Dirt) {
        grid.setLoose(nx, ny, Material.Sand);
      }
    }
    return false;
  }

  private processShaker(grid: PowderGrid, x: number, y: number): boolean {
    if (grid.get(x, y + 1) !== Material.Shaker) return false;
    grid.wake(x, y);
    if (this.rand() > 0.08) {
      return true;
    }

    const facing = this.scanLeftToRight ? 1 : -1;
    grid.setLoose(x, y, Material.Residue);
    const rx = x + facing;
    if (grid.get(rx, y) === Material.Empty) {
      grid.tryMove(x, y, rx, y);
    }

    if (this.rand() < 0.25) {
      const gy = y + 2;
      if (grid.get(x, gy) === Material.Empty) {
        grid.setLoose(x, gy, Material.Gold);
      }
    }
    return true;
  }

  private rand(): number {
    let x = this.rng | 0;
    x ^= x << 13;
    x ^= x >>> 17;
    x ^= x << 5;
    this.rng = x;
    return (x >>> 0) / 4294967296;
  }
}
