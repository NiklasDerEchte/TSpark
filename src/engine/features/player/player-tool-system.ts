import type { System, WorldQueryData } from '../../core/types';
import type { World } from '../../core/world';
import { Material, type MaterialId } from '../particles/materials';
import type { PowderGrid } from '../particles/powder-grid';
import { PowderWorldComponent } from '../particles/powder-world';
import { PlayerComponent, type CargoPixel } from './player-component';

const PICKABLE = new Set<number>([Material.Sand, Material.WetSand, Material.Gold, Material.Residue, Material.Stone]);

export class PlayerToolSystem implements System {
  world!: World;

  init(world: World): void {
    this.world = world;
  }

  exec(_deltaTimeMs: number): void {
    let grid: PowderGrid | undefined;
    this.world.query<PowderWorldComponent>(PowderWorldComponent.name, (result: WorldQueryData<PowderWorldComponent>) => {
      grid = result.component.grid;
    });
    if (!grid) return;
    const powderGrid = grid;

    this.world.query<PlayerComponent>(PlayerComponent.name, (result: WorldQueryData<PlayerComponent>) => {
      const player = result.component;
      if (player.digHeld && player.inToolRange(player.digRange)) {
        powderGrid.digCircle(Math.floor(player.aimX), Math.floor(player.aimY), player.digRadius);
      }
      if (player.grabHeld) {
        this.pickUp(player, powderGrid);
      } else if (player.wasGrabbing) {
        this.dropOff(player, powderGrid);
      }
      player.wasGrabbing = player.grabHeld;
    });
  }

  destroy(): void {}

  private pickUp(player: PlayerComponent, grid: PowderGrid): void {
    if (player.cargo.length >= player.grabCapacity) return;
    if (!player.inToolRange(player.grabRange)) return;
    const cx = Math.floor(player.aimX);
    const cy = Math.floor(player.aimY);
    const r = player.grabRadius;
    const r2 = r * r;
    for (let dy = -r; dy <= r; dy++) {
      for (let dx = -r; dx <= r; dx++) {
        if (dx * dx + dy * dy > r2) continue;
        if (player.cargo.length >= player.grabCapacity) return;
        const x = cx + dx;
        const y = cy + dy;
        if (!grid.inBounds(x, y)) continue;
        if (!grid.isDynamic(x, y)) continue;
        const id = grid.get(x, y) as MaterialId;
        if (!PICKABLE.has(id)) continue;
        const i = grid.index(x, y);
        player.cargo.push({ id, shade: grid.shade[i] });
        grid.set(x, y, Material.Empty);
      }
    }
  }

  private dropOff(player: PlayerComponent, grid: PowderGrid): void {
    if (player.cargo.length === 0) return;
    const cx = Math.floor(player.aimX);
    const cy = Math.floor(player.aimY);
    const leftover: CargoPixel[] = [];
    for (const pixel of player.cargo) {
      const spot = this.findEmpty(grid, cx, cy, 8);
      if (!spot) {
        leftover.push(pixel);
        continue;
      }
      grid.setLoose(spot.x, spot.y, pixel.id, pixel.shade);
    }
    player.cargo = leftover;
  }

  private findEmpty(grid: PowderGrid, cx: number, cy: number, radius: number): { x: number; y: number } | undefined {
    if (grid.get(cx, cy) === Material.Empty) return { x: cx, y: cy };
    for (let r = 1; r <= radius; r++) {
      for (let y = cy - r; y <= cy + r; y++) {
        for (let x = cx - r; x <= cx + r; x++) {
          if (Math.abs(x - cx) !== r && Math.abs(y - cy) !== r) continue;
          if (grid.get(x, y) === Material.Empty) return { x, y };
        }
      }
    }
    return undefined;
  }
}
