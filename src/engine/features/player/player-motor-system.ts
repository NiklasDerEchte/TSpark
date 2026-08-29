import type { System, WorldQueryData } from '../../core/types';
import type { World } from '../../core/world';
import { Material } from '../particles/materials';
import { PowderWorldComponent } from '../particles/powder-world';
import type { PowderGrid } from '../particles/powder-grid';
import { PlayerComponent } from './player-component';
import { AnimatorControllerComponent } from './animator-controller';
import { SpriteAnimatorComponent } from './sprite-animator';

const GRAVITY = 0.32;
const FAST_FALL = 0.45;
const JUMP_V = -4.05;
const JUMP_CUT = -1.15;
const WALK = 0.52;
const AIR = 0.28;
const MAX_FALL = 7.2;
const COYOTE_TICKS = 8;

export class PlayerMotorSystem implements System {
  world!: World;

  init(world: World): void {
    this.world = world;
  }

  exec(_deltaTimeMs: number): void {
    this.world.query<PlayerComponent>(PlayerComponent.name, (result: WorldQueryData<PlayerComponent>) => {
      const powder = this.powder();
      if (!powder) return;
      this.step(result.component, powder.grid);
      this.syncAnim(result);
      if (!result.component.panHeld) {
        powder.cameraX += (result.component.centerX() - powder.cameraX) * 0.14;
        powder.cameraY += (result.component.centerY() - powder.cameraY) * 0.14;
      }
    });
  }

  destroy(): void {}

  private powder(): PowderWorldComponent | undefined {
    let found: PowderWorldComponent | undefined;
    this.world.query<PowderWorldComponent>(PowderWorldComponent.name, (result: WorldQueryData<PowderWorldComponent>) => {
      found = result.component;
    });
    return found;
  }

  private step(player: PlayerComponent, grid: PowderGrid): void {
    this.updateCrouch(player, grid);

    const accel = player.grounded ? WALK : AIR;
    if (player.moveX !== 0) {
      player.vx = player.moveX * accel;
      player.facing = player.moveX > 0 ? 1 : -1;
    } else {
      player.vx *= player.grounded ? 0.35 : 0.7;
      if (Math.abs(player.vx) < 0.04) player.vx = 0;
    }

    const canJump = (player.grounded || player.coyoteTicks > 0) && !player.crouching;
    if (player.jumpQueued && canJump) {
      player.vy = JUMP_V;
      player.grounded = false;
      player.coyoteTicks = 0;
    }
    player.jumpQueued = false;

    if (!player.jumpHeld && player.vy < JUMP_CUT) {
      player.vy = JUMP_CUT;
    }

    player.vy += GRAVITY;
    if (player.crouchHeld && !player.grounded) player.vy += FAST_FALL;
    if (player.vy > MAX_FALL) player.vy = MAX_FALL;

    const wasGrounded = player.grounded;
    const savedX = player.x;
    const savedY = player.y;
    player.x += player.vx;
    if (this.collides(player, grid)) {
      if (!this.tryStepUp(player, grid, savedY, wasGrounded)) {
        const dir = player.vx >= 0 ? 1 : -1;
        player.x = savedX;
        let guard = 0;
        while (this.collides(player, grid) && guard++ < 80) player.x -= dir * 0.05;
        player.vx = 0;
      }
    }

    this.trySnapDown(player, grid, wasGrounded);

    player.y += player.vy;
    player.grounded = false;
    if (this.collides(player, grid)) {
      const dir = player.vy >= 0 ? 1 : -1;
      let guard = 0;
      while (this.collides(player, grid) && guard++ < 80) player.y -= dir * 0.05;
      if (player.vy > 0) player.grounded = true;
      player.vy = 0;
    } else if (this.onGround(player, grid)) {
      player.grounded = true;
    }

    if (player.grounded) player.coyoteTicks = COYOTE_TICKS;
    else if (player.coyoteTicks > 0) player.coyoteTicks -= 1;

    this.clampAim(player);
  }

  private tryStepUp(player: PlayerComponent, grid: PowderGrid, savedY: number, wasGrounded: boolean): boolean {
    if (!wasGrounded) return false;
    if (player.vy < -0.2) return false;
    for (let step = 1; step <= player.maxStepHeight; step++) {
      player.y = savedY - step;
      if (!this.collides(player, grid)) {
        return true;
      }
    }
    player.y = savedY;
    return false;
  }

  private trySnapDown(player: PlayerComponent, grid: PowderGrid, wasGrounded: boolean): void {
    if (!wasGrounded) return;
    if (player.vy < -0.2) return;
    if (this.onGround(player, grid)) {
      player.grounded = true;
      return;
    }
    const savedY = player.y;
    for (let step = 1; step <= player.maxStepHeight + 1; step++) {
      player.y = savedY + step;
      if (this.collides(player, grid)) {
        let guard = 0;
        while (this.collides(player, grid) && guard++ < 80) player.y -= 0.05;
        player.grounded = true;
        player.vy = 0;
        return;
      }
      if (this.onGround(player, grid)) {
        player.grounded = true;
        player.vy = 0;
        return;
      }
    }
    player.y = savedY;
  }

  private updateCrouch(player: PlayerComponent, grid: PowderGrid): void {
    const feet = player.y + player.height;
    if (player.crouchHeld && player.grounded) {
      player.crouching = true;
      player.height = player.crouchHeight;
      player.y = feet - player.height;
      return;
    }
    if (player.crouching) {
      const standTop = feet - player.standHeight;
      const oldY = player.y;
      const oldH = player.height;
      player.y = standTop;
      player.height = player.standHeight;
      if (this.collides(player, grid)) {
        player.y = oldY;
        player.height = oldH;
        player.crouching = true;
        return;
      }
      player.crouching = false;
    }
  }

  private onGround(player: PlayerComponent, grid: PowderGrid): boolean {
    const y = player.y + player.height + 0.05;
    const x0 = player.x + 0.2;
    const x1 = player.x + player.width - 0.2;
    return this.solid(grid, x0, y) || this.solid(grid, x1, y) || this.solid(grid, player.centerX(), y);
  }

  private collides(player: PlayerComponent, grid: PowderGrid): boolean {
    const x0 = Math.floor(player.x);
    const y0 = Math.floor(player.y);
    const x1 = Math.ceil(player.x + player.width) - 1;
    const y1 = Math.ceil(player.y + player.height) - 1;
    for (let y = y0; y <= y1; y++) {
      for (let x = x0; x <= x1; x++) {
        if (this.solid(grid, x, y)) return true;
      }
    }
    return false;
  }

  private solid(grid: PowderGrid, x: number, y: number): boolean {
    const ix = Math.floor(x);
    const iy = Math.floor(y);
    const id = grid.get(ix, iy);
    if (id === Material.Empty || id === Material.Water || id === Material.Steam || id === Material.Lava) return false;
    if (grid.isDynamic(ix, iy)) return false;
    return true;
  }

  private clampAim(player: PlayerComponent): void {
    const dx = player.cursorX - player.centerX();
    const dy = player.cursorY - player.centerY();
    const dist = Math.sqrt(dx * dx + dy * dy);
    const range = player.grabHeld ? player.grabRange : player.digRange;
    if (dist <= range || dist < 0.001) {
      player.aimX = player.cursorX;
      player.aimY = player.cursorY;
      return;
    }
    const s = range / dist;
    player.aimX = player.centerX() + dx * s;
    player.aimY = player.centerY() + dy * s;
  }

  private syncAnim(result: WorldQueryData<PlayerComponent>): void {
    const player = result.component;
    this.world.queryOne<AnimatorControllerComponent>(AnimatorControllerComponent.name, result.entity, (anim: WorldQueryData<AnimatorControllerComponent>) => {
      anim.component.setNumber('Speed', Math.abs(player.vx));
      anim.component.setBool('Grounded', player.grounded);
      anim.component.setBool('Rising', player.vy < -0.15);
      anim.component.setBool('Crouch', player.crouching);
      anim.component.setBool('Dig', player.digHeld && player.inToolRange(player.digRange));
      anim.component.setBool('Grab', player.grabHeld);
    });
    this.world.queryOne<SpriteAnimatorComponent>(SpriteAnimatorComponent.name, result.entity, (sprite: WorldQueryData<SpriteAnimatorComponent>) => {
      sprite.component.flipX = player.facing < 0;
    });
  }
}
