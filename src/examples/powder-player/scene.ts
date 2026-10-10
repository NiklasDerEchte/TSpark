import {
  AnimatorControllerComponent,
  PlayerComponent,
  PowderWorldComponent,
  SpriteAnimatorComponent,
  createFallbackMinerSheet,
  createPlayerAnimatorController,
  type PowderGrid,
  type Scene,
  type World,
} from '../../engine';
import { Material } from '../../engine/features/particles/materials';
import { resetTerrain } from '../powder-simulation/simulation';

export class PowderPlayerScene {
  private scene: Scene;

  constructor(world: World) {
    this.scene = world.createScene('powder-player-scene');
    const powder = this.createWorld();
    this.createPlayer(powder);
  }

  private createWorld(): PowderWorldComponent {
    const entity = this.scene.createEntity();
    const powder = new PowderWorldComponent({ width: 640, height: 360 });
    resetTerrain(powder);
    powder.zoom = 3.4;
    this.scene.getComponentStore<PowderWorldComponent>(PowderWorldComponent.name).add(entity, powder);
    return powder;
  }

  private createPlayer(powder: PowderWorldComponent): void {
    const entity = this.scene.createEntity();
    const spawn = findSpawn(powder.grid, Math.floor(powder.grid.width * 0.18), 16);
    const player = new PlayerComponent({
      x: spawn.x,
      y: spawn.y,
      width: 10,
      height: 16,
    });
    powder.cameraX = player.centerX();
    powder.cameraY = player.centerY();
    this.scene.getComponentStore<PlayerComponent>(PlayerComponent.name).add(entity, player);
    this.scene.getComponentStore<SpriteAnimatorComponent>(SpriteAnimatorComponent.name).add(
      entity,
      new SpriteAnimatorComponent({
        sheet: createFallbackMinerSheet(),
        currentClip: 'idle',
      }),
    );
    this.scene.getComponentStore<AnimatorControllerComponent>(AnimatorControllerComponent.name).add(
      entity,
      createPlayerAnimatorController(),
    );
  }
}

function findSpawn(grid: PowderGrid, preferX: number, height: number): { x: number; y: number } {
  const x = Math.max(4, Math.min(grid.width - 12, preferX));
  for (let y = 1; y < grid.height - 2; y++) {
    const id = grid.get(x, y);
    if (id === Material.Empty || id === Material.Water || id === Material.Steam) continue;
    if (grid.isDynamic(x, y)) continue;
    return { x: x - 4, y: y - height };
  }
  return { x, y: 20 };
}
