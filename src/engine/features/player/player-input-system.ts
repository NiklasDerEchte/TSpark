import { TSpark } from '../../../app';
import type { System, WorldQueryData } from '../../core/types';
import type { World } from '../../core/world';
import { PowderWorldComponent } from '../particles/powder-world';
import { PlayerComponent } from './player-component';

export class PlayerInputSystem implements System {
  world!: World;
  private canvas!: HTMLCanvasElement;
  private mouseX = 0;
  private mouseY = 0;
  private left = false;
  private right = false;
  private middle = false;
  private jumpWasDown = false;
  private fitted = false;

  init(world: World): void {
    this.world = world;
    this.canvas = TSpark.getInstance().getDrawCanvas();
    this.canvas.addEventListener('pointerdown', this.onPointerDown);
    this.canvas.addEventListener('pointerup', this.onPointerUp);
    this.canvas.addEventListener('pointermove', this.onPointerMove);
    this.canvas.addEventListener('contextmenu', this.onContextMenu);
    this.canvas.addEventListener('wheel', this.onWheel, { passive: false });
    window.addEventListener('pointerup', this.onPointerUp);
  }

  exec(_deltaTimeMs: number): void {
    this.world.query<PlayerComponent>(PlayerComponent.name, (result: WorldQueryData<PlayerComponent>) => {
      this.world.query<PowderWorldComponent>(PowderWorldComponent.name, (powderResult: WorldQueryData<PowderWorldComponent>) => {
        this.update(result.component, powderResult.component);
      });
    });
  }

  destroy(): void {
    this.canvas.removeEventListener('pointerdown', this.onPointerDown);
    this.canvas.removeEventListener('pointerup', this.onPointerUp);
    this.canvas.removeEventListener('pointermove', this.onPointerMove);
    this.canvas.removeEventListener('contextmenu', this.onContextMenu);
    this.canvas.removeEventListener('wheel', this.onWheel);
    window.removeEventListener('pointerup', this.onPointerUp);
  }

  private update(player: PlayerComponent, powder: PowderWorldComponent): void {
    if (!this.fitted && this.canvas.width > 0) {
      powder.zoom = 3.4;
      powder.cameraX = player.centerX();
      powder.cameraY = player.centerY();
      this.fitted = true;
    }

    const tspark = TSpark.getInstance();
    let moveX = 0;
    if (tspark.isKeyPressed('KeyA') || tspark.isKeyPressed('ArrowLeft')) moveX -= 1;
    if (tspark.isKeyPressed('KeyD') || tspark.isKeyPressed('ArrowRight')) moveX += 1;
    player.moveX = moveX;

    const jumpDown = tspark.isKeyPressed('KeyW') || tspark.isKeyPressed('ArrowUp');
    if (jumpDown && !this.jumpWasDown) player.jumpQueued = true;
    this.jumpWasDown = jumpDown;
    player.jumpHeld = jumpDown;

    player.crouchHeld = tspark.isKeyPressed('KeyS') || tspark.isKeyPressed('ArrowDown');
    player.digHeld = this.left;
    player.grabHeld = this.right;
    player.panHeld = this.middle;

    const world = this.screenToWorld(powder, this.mouseX, this.mouseY);
    player.cursorX = world.x;
    player.cursorY = world.y;
    powder.cursorX = Math.floor(world.x);
    powder.cursorY = Math.floor(world.y);
    powder.brushRadius = player.digRadius;
  }

  private screenToWorld(powder: PowderWorldComponent, clientX: number, clientY: number): { x: number; y: number } {
    const rect = this.canvas.getBoundingClientRect();
    const sx = (clientX - rect.left) * (this.canvas.width / Math.max(1, rect.width));
    const sy = (clientY - rect.top) * (this.canvas.height / Math.max(1, rect.height));
    const viewW = this.canvas.width / powder.zoom;
    const viewH = this.canvas.height / powder.zoom;
    const left = powder.cameraX - viewW * 0.5;
    const top = powder.cameraY - viewH * 0.5;
    return {
      x: left + (sx / this.canvas.width) * viewW,
      y: top + (sy / this.canvas.height) * viewH,
    };
  }

  private onPointerDown = (event: PointerEvent): void => {
    this.mouseX = event.clientX;
    this.mouseY = event.clientY;
    if (event.button === 0) this.left = true;
    if (event.button === 2) this.right = true;
    if (event.button === 1) this.middle = true;
    this.canvas.setPointerCapture(event.pointerId);
  };

  private onPointerUp = (event: PointerEvent): void => {
    if (event.button === 0) this.left = false;
    if (event.button === 2) this.right = false;
    if (event.button === 1) this.middle = false;
  };

  private onPointerMove = (event: PointerEvent): void => {
    this.mouseX = event.clientX;
    this.mouseY = event.clientY;
    if (this.middle) {
      this.world.query<PowderWorldComponent>(PowderWorldComponent.name, (result: WorldQueryData<PowderWorldComponent>) => {
        result.component.cameraX -= event.movementX / result.component.zoom;
        result.component.cameraY -= event.movementY / result.component.zoom;
      });
    }
  };

  private onContextMenu = (event: Event): void => {
    event.preventDefault();
  };

  private onWheel = (event: WheelEvent): void => {
    event.preventDefault();
    this.world.query<PowderWorldComponent>(PowderWorldComponent.name, (result: WorldQueryData<PowderWorldComponent>) => {
      const factor = event.deltaY > 0 ? 1 / 1.12 : 1.12;
      result.component.zoom = Math.max(1.4, Math.min(10, result.component.zoom * factor));
    });
  };
}
