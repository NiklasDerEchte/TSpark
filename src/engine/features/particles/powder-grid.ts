import { MATERIALS, Material, paintsLoose, type MaterialId } from './materials';

const CHUNK_SIZE = 16;
const FREEZE_AFTER = 45;

export const CellFlag = {
  Dynamic: 1 << 0,
  /** Was loose and froze in place. Neighbor holes may wake it; worldgen ore stays put. */
  Settled: 1 << 1,
} as const;

export class PowderGrid {
  readonly width: number;
  readonly height: number;
  readonly cells: Uint8Array;
  readonly flags: Uint8Array;
  readonly shade: Uint8Array;
  readonly vx: Int8Array;
  readonly vy: Int8Array;
  readonly updated: Uint8Array;
  readonly stillness: Uint8Array;

  readonly chunkSize: number = CHUNK_SIZE;
  readonly chunkCols: number;
  readonly chunkRows: number;
  readonly chunkDirty: Uint8Array;
  readonly chunkActive: Uint8Array;
  readonly chunkDirtyMinX: Int16Array;
  readonly chunkDirtyMinY: Int16Array;
  readonly chunkDirtyMaxX: Int16Array;
  readonly chunkDirtyMaxY: Int16Array;
  readonly chunkActiveMinX: Int16Array;
  readonly chunkActiveMinY: Int16Array;
  readonly chunkActiveMaxX: Int16Array;
  readonly chunkActiveMaxY: Int16Array;

  stamp: number = 1;

  constructor(width: number, height: number) {
    this.width = width;
    this.height = height;
    const n = width * height;
    this.cells = new Uint8Array(n);
    this.flags = new Uint8Array(n);
    this.shade = new Uint8Array(n);
    this.vx = new Int8Array(n);
    this.vy = new Int8Array(n);
    this.updated = new Uint8Array(n);
    this.stillness = new Uint8Array(n);

    this.chunkCols = Math.ceil(width / CHUNK_SIZE);
    this.chunkRows = Math.ceil(height / CHUNK_SIZE);
    const chunks = this.chunkCols * this.chunkRows;
    this.chunkDirty = new Uint8Array(chunks);
    this.chunkActive = new Uint8Array(chunks);
    this.chunkDirtyMinX = new Int16Array(chunks);
    this.chunkDirtyMinY = new Int16Array(chunks);
    this.chunkDirtyMaxX = new Int16Array(chunks);
    this.chunkDirtyMaxY = new Int16Array(chunks);
    this.chunkActiveMinX = new Int16Array(chunks);
    this.chunkActiveMinY = new Int16Array(chunks);
    this.chunkActiveMaxX = new Int16Array(chunks);
    this.chunkActiveMaxY = new Int16Array(chunks);
    this.resetChunkRects(this.chunkDirtyMinX, this.chunkDirtyMinY, this.chunkDirtyMaxX, this.chunkDirtyMaxY);
    this.resetChunkRects(this.chunkActiveMinX, this.chunkActiveMinY, this.chunkActiveMaxX, this.chunkActiveMaxY);
  }

  inBounds(x: number, y: number): boolean {
    return x >= 0 && y >= 0 && x < this.width && y < this.height;
  }

  index(x: number, y: number): number {
    return y * this.width + x;
  }

  get(x: number, y: number): number {
    if (!this.inBounds(x, y)) return Material.Bedrock;
    return this.cells[this.index(x, y)];
  }

  isDynamic(x: number, y: number): boolean {
    if (!this.inBounds(x, y)) return false;
    return (this.flags[this.index(x, y)] & CellFlag.Dynamic) !== 0;
  }

  /**
   * Place a cell. Terrain (default) stays static and does not wake the sim.
   * Pass `dynamic: true` for loose powder / liquid that should fall.
   */
  set(x: number, y: number, material: MaterialId, shade?: number, dynamic: boolean = false): void {
    if (!this.inBounds(x, y)) return;
    const i = this.index(x, y);
    this.cells[i] = material;
    this.shade[i] = material === Material.Empty ? 0 : (shade ?? ((Math.random() * 48) | 0));
    this.vx[i] = 0;
    this.vy[i] = 0;
    this.stillness[i] = 0;
    if (material === Material.Empty) {
      this.flags[i] = 0;
      this.wake(x, y);
      return;
    }
    if (dynamic) {
      this.flags[i] = CellFlag.Dynamic;
      this.wake(x, y);
    } else {
      this.flags[i] = 0;
    }
  }

  setLoose(x: number, y: number, material: MaterialId, shade?: number): void {
    this.set(x, y, material, shade, true);
  }

  /** Break a static cell into falling material. Never deletes. */
  loosen(x: number, y: number): void {
    if (!this.inBounds(x, y)) return;
    const i = this.index(x, y);
    const id = this.cells[i];
    if (id === Material.Empty || id === Material.Bedrock || id === Material.Shaker) return;
    if ((this.flags[i] & CellFlag.Dynamic) !== 0) return;
    const def = MATERIALS[id];
    if (!def) return;
    if (def.digsTo !== undefined && def.digsTo !== id) {
      this.set(x, y, def.digsTo, this.shade[i], true);
      return;
    }
    this.flags[i] = CellFlag.Dynamic;
    this.stillness[i] = 0;
    this.wake(x, y);
  }

  tryFreeze(x: number, y: number): void {
    const i = this.index(x, y);
    const def = MATERIALS[this.cells[i]];
    if (!def?.canFreeze) return;
    const next = this.stillness[i] + 1;
    this.stillness[i] = next > 255 ? 255 : next;
    if (next >= FREEZE_AFTER) {
      this.flags[i] = CellFlag.Settled;
      this.vx[i] = 0;
      this.vy[i] = 0;
      this.stillness[i] = 0;
    }
  }

  clear(): void {
    this.cells.fill(0);
    this.flags.fill(0);
    this.shade.fill(0);
    this.vx.fill(0);
    this.vy.fill(0);
    this.updated.fill(0);
    this.stillness.fill(0);
    this.chunkDirty.fill(0);
    this.chunkActive.fill(0);
    this.resetChunkRects(this.chunkDirtyMinX, this.chunkDirtyMinY, this.chunkDirtyMaxX, this.chunkDirtyMaxY);
    this.resetChunkRects(this.chunkActiveMinX, this.chunkActiveMinY, this.chunkActiveMaxX, this.chunkActiveMaxY);
    this.stamp = 1;
  }

  beginTick(): void {
    this.stamp++;
    if (this.stamp === 255) {
      this.updated.fill(0);
      this.stamp = 1;
    }
    this.chunkActive.set(this.chunkDirty);
    this.chunkActiveMinX.set(this.chunkDirtyMinX);
    this.chunkActiveMinY.set(this.chunkDirtyMinY);
    this.chunkActiveMaxX.set(this.chunkDirtyMaxX);
    this.chunkActiveMaxY.set(this.chunkDirtyMaxY);
    this.chunkDirty.fill(0);
    this.resetChunkRects(this.chunkDirtyMinX, this.chunkDirtyMinY, this.chunkDirtyMaxX, this.chunkDirtyMaxY);
  }

  wake(x: number, y: number): void {
    this.mark(x, y);
    this.mark(x - 1, y);
    this.mark(x + 1, y);
    this.mark(x, y - 1);
    this.mark(x, y + 1);
    this.unfreeze(x - 1, y);
    this.unfreeze(x + 1, y);
    this.unfreeze(x, y - 1);
    this.unfreeze(x, y + 1);
    this.exposeFluid(x - 1, y);
    this.exposeFluid(x + 1, y);
    this.exposeFluid(x, y - 1);
    this.exposeFluid(x, y + 1);
  }

  canDisplace(src: number, dest: number, destDynamic: boolean): boolean {
    if (dest === Material.Empty) return true;
    if (!destDynamic) return false;
    const a = MATERIALS[src];
    const b = MATERIALS[dest];
    if (!a || !b) return false;
    if (b.phase === 'static' || a.phase === 'static') return false;
    return a.density > b.density;
  }

  tryMove(x: number, y: number, nx: number, ny: number): boolean {
    if (!this.inBounds(nx, ny)) return false;
    const ni = this.index(nx, ny);
    if (this.updated[ni] === this.stamp) return false;
    const dest = this.cells[ni];
    if (dest === Material.Empty) {
      this.moveCell(x, y, nx, ny);
      return true;
    }
    const src = this.cells[this.index(x, y)];
    const destDynamic = (this.flags[ni] & CellFlag.Dynamic) !== 0;
    if (this.canDisplace(src, dest, destDynamic)) {
      this.swapCell(x, y, nx, ny);
      return true;
    }
    return false;
  }

  moveCell(x: number, y: number, nx: number, ny: number): void {
    const i = this.index(x, y);
    const ni = this.index(nx, ny);
    this.cells[ni] = this.cells[i];
    this.flags[ni] = this.flags[i];
    this.shade[ni] = this.shade[i];
    this.vx[ni] = this.vx[i];
    this.vy[ni] = this.vy[i];
    this.stillness[ni] = 0;
    this.cells[i] = Material.Empty;
    this.flags[i] = 0;
    this.shade[i] = 0;
    this.vx[i] = 0;
    this.vy[i] = 0;
    this.stillness[i] = 0;
    this.updated[ni] = this.stamp;
    this.wake(x, y);
    this.wake(nx, ny);
  }

  swapCell(x: number, y: number, nx: number, ny: number): void {
    const i = this.index(x, y);
    const ni = this.index(nx, ny);
    const c = this.cells[i];
    const f = this.flags[i];
    const s = this.shade[i];
    const vx = this.vx[i];
    const vy = this.vy[i];
    const st = this.stillness[i];
    this.cells[i] = this.cells[ni];
    this.flags[i] = this.flags[ni];
    this.shade[i] = this.shade[ni];
    this.vx[i] = this.vx[ni];
    this.vy[i] = this.vy[ni];
    this.stillness[i] = this.stillness[ni];
    this.cells[ni] = c;
    this.flags[ni] = f;
    this.shade[ni] = s;
    this.vx[ni] = vx;
    this.vy[ni] = vy;
    this.stillness[ni] = st;
    this.updated[i] = this.stamp;
    this.updated[ni] = this.stamp;
    this.wake(x, y);
    this.wake(nx, ny);
  }

  paintCircle(cx: number, cy: number, radius: number, material: MaterialId): void {
    const r2 = radius * radius;
    const loose = paintsLoose(material);
    for (let dy = -radius; dy <= radius; dy++) {
      for (let dx = -radius; dx <= radius; dx++) {
        if (dx * dx + dy * dy > r2) continue;
        const x = cx + dx;
        const y = cy + dy;
        if (!this.inBounds(x, y)) continue;
        if (this.get(x, y) === Material.Bedrock) continue;
        this.set(x, y, material, undefined, loose);
      }
    }
  }

  digCircle(cx: number, cy: number, radius: number): void {
    const r2 = radius * radius;
    for (let dy = -radius; dy <= radius; dy++) {
      for (let dx = -radius; dx <= radius; dx++) {
        if (dx * dx + dy * dy > r2) continue;
        this.loosen(cx + dx, cy + dy);
      }
    }
  }

  countParticles(): number {
    let n = 0;
    const flags = this.flags;
    const cells = this.cells;
    for (let i = 0; i < cells.length; i++) {
      if (cells[i] !== Material.Empty && (flags[i] & CellFlag.Dynamic) !== 0) n++;
    }
    return n;
  }

  private mark(x: number, y: number): void {
    if (!this.inBounds(x, y)) return;
    const cx = (x / CHUNK_SIZE) | 0;
    const cy = (y / CHUNK_SIZE) | 0;
    const idx = cy * this.chunkCols + cx;
    this.chunkDirty[idx] = 1;
    if (this.chunkDirtyMinX[idx] < 0) {
      this.chunkDirtyMinX[idx] = x;
      this.chunkDirtyMaxX[idx] = x;
      this.chunkDirtyMinY[idx] = y;
      this.chunkDirtyMaxY[idx] = y;
    } else {
      if (x < this.chunkDirtyMinX[idx]) this.chunkDirtyMinX[idx] = x;
      if (x > this.chunkDirtyMaxX[idx]) this.chunkDirtyMaxX[idx] = x;
      if (y < this.chunkDirtyMinY[idx]) this.chunkDirtyMinY[idx] = y;
      if (y > this.chunkDirtyMaxY[idx]) this.chunkDirtyMaxY[idx] = y;
    }
  }

  private unfreeze(x: number, y: number): void {
    if (!this.inBounds(x, y)) return;
    const i = this.index(x, y);
    if ((this.flags[i] & CellFlag.Settled) === 0) return;
    this.flags[i] = CellFlag.Dynamic;
    this.stillness[i] = 0;
    this.mark(x, y);
  }

  private exposeFluid(x: number, y: number): void {
    if (!this.inBounds(x, y)) return;
    const i = this.index(x, y);
    if ((this.flags[i] & CellFlag.Dynamic) !== 0) return;
    const def = MATERIALS[this.cells[i]];
    if (!def?.exposesWhenOpen) return;
    this.flags[i] = CellFlag.Dynamic;
    this.stillness[i] = 0;
    this.mark(x, y);
  }

  private resetChunkRects(minX: Int16Array, minY: Int16Array, maxX: Int16Array, maxY: Int16Array): void {
    minX.fill(-1);
    minY.fill(-1);
    maxX.fill(-1);
    maxY.fill(-1);
  }
}
