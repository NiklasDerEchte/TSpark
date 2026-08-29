import { TSpark } from '../../../app';
import type { System, WorldQueryData } from '../../core/types';
import type { World } from '../../core/world';
import { Material, PAINTABLE_MATERIALS, type MaterialId } from './materials';
import { PowderWorldComponent } from './powder-world';

const HOTKEYS: Record<string, MaterialId> = {
  Digit1: Material.Sand,
  Digit2: Material.Water,
  Digit3: Material.WetSand,
  Digit4: Material.Gold,
  Digit5: Material.Residue,
  Digit6: Material.Dirt,
  Digit7: Material.Stone,
  Digit8: Material.Lava,
  Digit9: Material.Steam,
  Digit0: Material.Shaker,
  KeyX: Material.Empty,
};

export class PowderInputSystem implements System {
  world!: World;
  private canvas!: HTMLCanvasElement;
  private mouseX = 0;
  private mouseY = 0;
  private lastPaintX = 0;
  private lastPaintY = 0;
  private left = false;
  private right = false;
  private middle = false;
  private fitted = false;
  private keyWasDown = new Set<string>();

  init(world: World): void {
    this.world = world;
    this.canvas = TSpark.getInstance().getDrawCanvas();
    this.canvas.addEventListener('pointerdown', this.onPointerDown);
    this.canvas.addEventListener('pointerup', this.onPointerUp);
    this.canvas.addEventListener('pointermove', this.onPointerMove);
    this.canvas.addEventListener('pointerleave', this.onPointerLeave);
    this.canvas.addEventListener('contextmenu', this.onContextMenu);
    this.canvas.addEventListener('wheel', this.onWheel, { passive: false });
    window.addEventListener('pointerup', this.onPointerUp);
  }

  exec(deltaTimeMs: number): void {
    this.world.query<PowderWorldComponent>(PowderWorldComponent.name, (result: WorldQueryData<PowderWorldComponent>) => {
      this.update(result.component, deltaTimeMs / 1000);
    });
  }

  destroy(): void {
    this.canvas.removeEventListener('pointerdown', this.onPointerDown);
    this.canvas.removeEventListener('pointerup', this.onPointerUp);
    this.canvas.removeEventListener('pointermove', this.onPointerMove);
    this.canvas.removeEventListener('pointerleave', this.onPointerLeave);
    this.canvas.removeEventListener('contextmenu', this.onContextMenu);
    this.canvas.removeEventListener('wheel', this.onWheel);
    window.removeEventListener('pointerup', this.onPointerUp);
  }

  private update(powder: PowderWorldComponent, dt: number): void {
    if (!this.fitted && this.canvas.width > 0) {
      powder.fitCamera(this.canvas.width, this.canvas.height);
      this.fitted = true;
    }

    const worldPos = this.screenToWorld(powder, this.mouseX, this.mouseY);
    powder.cursorX = worldPos.x;
    powder.cursorY = worldPos.y;

    this.panWithKeys(powder, dt);
    this.handleHotkeys(powder);

    if (this.middle) return;

    if (this.left || this.right) {
      this.paintLine(powder, this.lastPaintX, this.lastPaintY, worldPos.x, worldPos.y);
      this.lastPaintX = worldPos.x;
      this.lastPaintY = worldPos.y;
    }
  }

  private paintLine(powder: PowderWorldComponent, x0: number, y0: number, x1: number, y1: number): void {
    let x = x0;
    let y = y0;
    const dx = Math.abs(x1 - x0);
    const dy = Math.abs(y1 - y0);
    const sx = x0 < x1 ? 1 : -1;
    const sy = y0 < y1 ? 1 : -1;
    let err = dx - dy;
    while (true) {
      this.paintAt(powder, x, y);
      if (x === x1 && y === y1) break;
      const e2 = 2 * err;
      if (e2 > -dy) {
        err -= dy;
        x += sx;
      }
      if (e2 < dx) {
        err += dx;
        y += sy;
      }
    }
  }

  private paintAt(powder: PowderWorldComponent, x: number, y: number): void {
    if (this.right) {
      powder.grid.digCircle(x, y, powder.brushRadius);
      return;
    }
    powder.grid.paintCircle(x, y, powder.brushRadius, powder.selectedMaterial);
  }

  private panWithKeys(powder: PowderWorldComponent, dt: number): void {
    const tspark = TSpark.getInstance();
    const speed = (220 * dt) / Math.max(0.5, powder.zoom);
    if (tspark.isKeyPressed('KeyW') || tspark.isKeyPressed('ArrowUp')) powder.cameraY -= speed;
    if (tspark.isKeyPressed('KeyS') || tspark.isKeyPressed('ArrowDown')) powder.cameraY += speed;
    if (tspark.isKeyPressed('KeyA') || tspark.isKeyPressed('ArrowLeft')) powder.cameraX -= speed;
    if (tspark.isKeyPressed('KeyD') || tspark.isKeyPressed('ArrowRight')) powder.cameraX += speed;

    const pad = 32;
    powder.cameraX = clamp(powder.cameraX, -pad, powder.grid.width + pad);
    powder.cameraY = clamp(powder.cameraY, -pad, powder.grid.height + pad);
  }

  private handleHotkeys(powder: PowderWorldComponent): void {
    const tspark = TSpark.getInstance();
    for (const [code, material] of Object.entries(HOTKEYS)) {
      const down = tspark.isKeyPressed(code);
      if (down && !this.keyWasDown.has(code)) {
        powder.selectedMaterial = material;
      }
      if (down) this.keyWasDown.add(code);
      else this.keyWasDown.delete(code);
    }

    const pauseDown = tspark.isKeyPressed('KeyP');
    if (pauseDown && !this.keyWasDown.has('KeyP')) {
      powder.paused = !powder.paused;
    }
    if (pauseDown) this.keyWasDown.add('KeyP');
    else this.keyWasDown.delete('KeyP');

    const fitDown = tspark.isKeyPressed('KeyF');
    if (fitDown && !this.keyWasDown.has('KeyF')) {
      powder.fitCamera(this.canvas.width, this.canvas.height);
    }
    if (fitDown) this.keyWasDown.add('KeyF');
    else this.keyWasDown.delete('KeyF');

    const resetDown = tspark.isKeyPressed('KeyR');
    if (resetDown && !this.keyWasDown.has('KeyR')) {
      powder.regenerate?.();
    }
    if (resetDown) this.keyWasDown.add('KeyR');
    else this.keyWasDown.delete('KeyR');

    const qDown = tspark.isKeyPressed('KeyQ');
    if (qDown && !this.keyWasDown.has('KeyQ')) this.zoomAtCursor(powder, 1 / 1.15);
    if (qDown) this.keyWasDown.add('KeyQ');
    else this.keyWasDown.delete('KeyQ');

    const eDown = tspark.isKeyPressed('KeyE');
    if (eDown && !this.keyWasDown.has('KeyE')) this.zoomAtCursor(powder, 1.15);
    if (eDown) this.keyWasDown.add('KeyE');
    else this.keyWasDown.delete('KeyE');

    const debugDown = tspark.isKeyPressed('KeyV');
    if (debugDown && !this.keyWasDown.has('KeyV')) {
      powder.debugMatter = !powder.debugMatter;
    }
    if (debugDown) this.keyWasDown.add('KeyV');
    else this.keyWasDown.delete('KeyV');

    if (!PAINTABLE_MATERIALS.includes(powder.selectedMaterial) && powder.selectedMaterial !== Material.Empty) {
      powder.selectedMaterial = Material.Sand;
    }
  }

  private zoomAtCursor(powder: PowderWorldComponent, factor: number): void {
    const before = this.screenToWorld(powder, this.mouseX, this.mouseY);
    powder.zoom = clamp(powder.zoom * factor, 0.75, 16);
    const after = this.screenToWorld(powder, this.mouseX, this.mouseY);
    powder.cameraX += before.x - after.x;
    powder.cameraY += before.y - after.y;
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
      x: Math.floor(left + (sx / this.canvas.width) * viewW),
      y: Math.floor(top + (sy / this.canvas.height) * viewH),
    };
  }

  private onPointerDown = (event: PointerEvent): void => {
    this.mouseX = event.clientX;
    this.mouseY = event.clientY;
    if (event.button === 0) this.left = true;
    if (event.button === 2) this.right = true;
    if (event.button === 1) this.middle = true;
    this.world.query<PowderWorldComponent>(PowderWorldComponent.name, (result: WorldQueryData<PowderWorldComponent>) => {
      const pos = this.screenToWorld(result.component, event.clientX, event.clientY);
      this.lastPaintX = pos.x;
      this.lastPaintY = pos.y;
    });
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
        const zoom = result.component.zoom;
        result.component.cameraX -= event.movementX / zoom;
        result.component.cameraY -= event.movementY / zoom;
      });
    }
  };

  private onPointerLeave = (): void => {
    this.world.query<PowderWorldComponent>(PowderWorldComponent.name, (result: WorldQueryData<PowderWorldComponent>) => {
      result.component.cursorX = -1;
      result.component.cursorY = -1;
    });
  };

  private onContextMenu = (event: Event): void => {
    event.preventDefault();
  };

  private onWheel = (event: WheelEvent): void => {
    event.preventDefault();
    this.mouseX = event.clientX;
    this.mouseY = event.clientY;
    if (event.shiftKey) {
      this.world.query<PowderWorldComponent>(PowderWorldComponent.name, (result: WorldQueryData<PowderWorldComponent>) => {
        const dir = event.deltaY > 0 ? -1 : 1;
        result.component.brushRadius = clamp(result.component.brushRadius + dir, 1, 24);
      });
      return;
    }
    this.world.query<PowderWorldComponent>(PowderWorldComponent.name, (result: WorldQueryData<PowderWorldComponent>) => {
      this.zoomAtCursor(result.component, event.deltaY > 0 ? 1 / 1.12 : 1.12);
    });
  };
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}
