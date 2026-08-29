import { assignProps } from '../../core/utils/common';
import type { Component, Properties } from '../../core/types';
import type { MaterialId } from '../particles/materials';
import { DEFAULT_HOTBAR, TOOLS, type ToolDef, type ToolId } from './tools';

export interface CargoPixel {
  id: MaterialId;
  shade: number;
}

export class PlayerComponent implements Component<{
  x: number;
  y: number;
  vx: number;
  vy: number;
  width: number;
  height: number;
  standHeight: number;
  crouchHeight: number;
  facing: number;
  grounded: boolean;
  crouching: boolean;
  moveX: number;
  jumpQueued: boolean;
  crouchHeld: boolean;
  digHeld: boolean;
  grabHeld: boolean;
  wasGrabbing: boolean;
  cursorX: number;
  cursorY: number;
  aimX: number;
  aimY: number;
  digRange: number;
  grabRange: number;
  digRadius: number;
  grabRadius: number;
  grabCapacity: number;
  cargo: CargoPixel[];
  panHeld: boolean;
  jumpHeld: boolean;
  maxStepHeight: number;
  coyoteTicks: number;
  hotbar: ToolId[];
  selectedSlot: number;
  wrongTool: boolean;
}> {
  x: number = 0;
  y: number = 0;
  vx: number = 0;
  vy: number = 0;
  width: number = 10;
  height: number = 16;
  standHeight: number = 16;
  crouchHeight: number = 10;
  facing: number = 1;
  grounded: boolean = false;
  crouching: boolean = false;
  moveX: number = 0;
  jumpQueued: boolean = false;
  crouchHeld: boolean = false;
  digHeld: boolean = false;
  grabHeld: boolean = false;
  wasGrabbing: boolean = false;
  cursorX: number = 0;
  cursorY: number = 0;
  aimX: number = 0;
  aimY: number = 0;
  digRange: number = 36;
  grabRange: number = 40;
  digRadius: number = 3;
  grabRadius: number = 5;
  grabCapacity: number = 180;
  cargo: CargoPixel[] = [];
  panHeld: boolean = false;
  jumpHeld: boolean = false;
  /** How many solid cells the player can walk up or down without jumping. */
  maxStepHeight: number = 4;
  coyoteTicks: number = 0;
  hotbar: ToolId[] = [...DEFAULT_HOTBAR];
  selectedSlot: number = 0;
  wrongTool: boolean = false;

  constructor(props?: Properties<PlayerComponent>) {
    assignProps(this, props);
  }

  centerX(): number {
    return this.x + this.width * 0.5;
  }

  centerY(): number {
    return this.y + this.height * 0.5;
  }

  activeTool(): ToolDef {
    const id = this.hotbar[this.selectedSlot] ?? this.hotbar[0];
    return TOOLS[id];
  }

  inToolRange(range: number): boolean {
    const dx = this.cursorX - this.centerX();
    const dy = this.cursorY - this.centerY();
    return dx * dx + dy * dy <= range * range;
  }
}
