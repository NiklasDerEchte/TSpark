import * as twgljs from 'twgl.js';
import type { RenderLayer } from '../../core/types';
import type { Scene, World } from '../../core/world';
import { createProgramInfo, type RenderEnvironment } from '../../core/renderer/environment';
import { MATERIALS } from '../particles/materials';
import { PowderWorldComponent } from '../particles/powder-world';
import { PlayerComponent } from './player-component';
import { SpriteAnimatorComponent } from './sprite-animator';

export class PlayerRenderLayer implements RenderLayer {
  private environment!: RenderEnvironment;
  private spriteProgram: twgljs.ProgramInfo | undefined;
  private colorProgram: twgljs.ProgramInfo | undefined;
  private overlayProgram: twgljs.ProgramInfo | undefined;
  private overlayBuffer: twgljs.BufferInfo | undefined;
  private spriteTexture: WebGLTexture | undefined;
  private sheetWidth = 0;
  private sheetHeight = 0;

  async init(environment: RenderEnvironment): Promise<void> {
    this.environment = environment;
    this.spriteProgram = await createProgramInfo(environment, 'shader/player-sprite-vertex.glsl', 'shader/player-sprite-fragment.glsl');
    this.colorProgram = await createProgramInfo(environment, 'shader/player-color-vertex.glsl', 'shader/player-color-fragment.glsl');
    this.overlayProgram = await createProgramInfo(environment, 'shader/powder-vertex.glsl', 'shader/player-overlay-fragment.glsl');
    this.overlayBuffer = twgljs.createBufferInfoFromArrays(environment.gl, {
      position: { numComponents: 2, data: [-1, 1, 1, 1, 1, -1, -1, -1] },
      texCoord: { numComponents: 2, data: [0, 0, 1, 0, 1, 1, 0, 1] },
      indices: [0, 1, 2, 0, 2, 3],
    });
  }

  draw(worlds: World[]): void {
    if (!this.environment || !this.spriteProgram || !this.colorProgram || !this.overlayProgram || !this.overlayBuffer) return;
    const gl = this.environment.gl;
    gl.disable(gl.DEPTH_TEST);
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

    worlds.forEach((world: World) => {
      world.getActiveScenes().forEach((scene: Scene) => {
        const powderStore = scene.getComponentStore<PowderWorldComponent>(PowderWorldComponent.name);
        const playerStore = scene.getComponentStore<PlayerComponent>(PlayerComponent.name);
        const animStore = scene.getComponentStore<SpriteAnimatorComponent>(SpriteAnimatorComponent.name);
        let powder: PowderWorldComponent | undefined;
        for (const [, component] of powderStore.entries()) powder = component;
        if (!powder) return;
        const canvas = gl.canvas as HTMLCanvasElement;
        const view = {
          originX: powder.cameraX - canvas.width / powder.zoom / 2,
          originY: powder.cameraY - canvas.height / powder.zoom / 2,
          viewW: canvas.width / powder.zoom,
          viewH: canvas.height / powder.zoom,
        };
        for (const [entity, player] of playerStore.entries()) {
          this.drawRange(gl, player, view);
          this.drawBeamAndCargo(gl, player, view);
          const animator = animStore.get(entity);
          if (animator) this.drawSprite(gl, player, animator, view);
        }
      });
    });
  }

  destroy(): void {
    if (this.spriteTexture && this.environment) this.environment.gl.deleteTexture(this.spriteTexture);
  }

  private drawSprite(
    gl: WebGLRenderingContext,
    player: PlayerComponent,
    animator: SpriteAnimatorComponent,
    view: { originX: number; originY: number; viewW: number; viewH: number },
  ): void {
    if (!this.spriteProgram) return;
    this.ensureSheet(gl, animator);
    const clip = animator.clip();
    if (!clip || !this.spriteTexture) return;
    const sheet = animator.sheet;
    const col = clip.col + animator.frame;
    const u0 = (col * sheet.frameWidth) / sheet.width;
    const v0 = (clip.row * sheet.frameHeight) / sheet.height;
    const u1 = u0 + sheet.frameWidth / sheet.width;
    const v1 = v0 + sheet.frameHeight / sheet.height;
    const leftU = animator.flipX ? u1 : u0;
    const rightU = animator.flipX ? u0 : u1;
    const x0 = player.x;
    const y0 = player.y;
    const x1 = player.x + player.width;
    const y1 = player.y + player.height;
    const p00 = this.worldToClip(x0, y0, view);
    const p10 = this.worldToClip(x1, y0, view);
    const p11 = this.worldToClip(x1, y1, view);
    const p01 = this.worldToClip(x0, y1, view);
    const buffer = twgljs.createBufferInfoFromArrays(gl, {
      position: { numComponents: 2, data: [p00[0], p00[1], p10[0], p10[1], p11[0], p11[1], p01[0], p01[1]] },
      texCoord: { numComponents: 2, data: [leftU, v0, rightU, v0, rightU, v1, leftU, v1] },
      indices: [0, 1, 2, 0, 2, 3],
    });
    gl.useProgram(this.spriteProgram.program);
    twgljs.setBuffersAndAttributes(gl, this.spriteProgram, buffer);
    twgljs.setUniforms(this.spriteProgram, { u_sheet: this.spriteTexture });
    twgljs.drawBufferInfo(gl, buffer);
  }

  private drawBeamAndCargo(
    gl: WebGLRenderingContext,
    player: PlayerComponent,
    view: { originX: number; originY: number; viewW: number; viewH: number },
  ): void {
    if (!this.colorProgram) return;
    const positions: number[] = [];
    const colors: number[] = [];
    const indices: number[] = [];

    const pushQuad = (x: number, y: number, w: number, h: number, r: number, g: number, b: number, a: number) => {
      const i = positions.length / 2;
      const p00 = this.worldToClip(x, y, view);
      const p10 = this.worldToClip(x + w, y, view);
      const p11 = this.worldToClip(x + w, y + h, view);
      const p01 = this.worldToClip(x, y + h, view);
      positions.push(p00[0], p00[1], p10[0], p10[1], p11[0], p11[1], p01[0], p01[1]);
      for (let n = 0; n < 4; n++) colors.push(r, g, b, a);
      indices.push(i, i + 1, i + 2, i, i + 2, i + 3);
    };

    if (player.grabHeld || player.digHeld) {
      const inRange = player.grabHeld ? player.inToolRange(player.grabRange) : player.inToolRange(player.digRange);
      const cr = inRange ? 0.45 : 0.85;
      const cg = inRange ? 0.9 : 0.25;
      const cb = inRange ? 0.55 : 0.2;
      const x0 = player.centerX();
      const y0 = player.centerY();
      const x1 = player.aimX;
      const y1 = player.aimY;
      const dx = x1 - x0;
      const dy = y1 - y0;
      const len = Math.sqrt(dx * dx + dy * dy) || 1;
      const nx = (-dy / len) * 0.35;
      const ny = (dx / len) * 0.35;
      const i = positions.length / 2;
      const q0 = this.worldToClip(x0 + nx, y0 + ny, view);
      const q1 = this.worldToClip(x1 + nx, y1 + ny, view);
      const q2 = this.worldToClip(x1 - nx, y1 - ny, view);
      const q3 = this.worldToClip(x0 - nx, y0 - ny, view);
      positions.push(q0[0], q0[1], q1[0], q1[1], q2[0], q2[1], q3[0], q3[1]);
      for (let n = 0; n < 4; n++) colors.push(cr, cg, cb, 0.85);
      indices.push(i, i + 1, i + 2, i, i + 2, i + 3);
    }

    const cx = player.aimX;
    const cy = player.aimY;
    const n = player.cargo.length;
    for (let i = 0; i < n; i++) {
      const pixel = player.cargo[i];
      const def = MATERIALS[pixel.id];
      const ang = (i / Math.max(1, n)) * Math.PI * 2;
      const rad = 1.2 + (i % 7) * 0.35;
      const px = cx + Math.cos(ang) * rad - 0.5;
      const py = cy + Math.sin(ang) * rad - 0.5;
      pushQuad(px, py, 1, 1, def.color[0] / 255, def.color[1] / 255, def.color[2] / 255, 1);
    }

    if (positions.length === 0) return;
    const buffer = twgljs.createBufferInfoFromArrays(gl, {
      position: { numComponents: 2, data: positions },
      color: { numComponents: 4, data: colors },
      indices,
    });
    gl.useProgram(this.colorProgram.program);
    twgljs.setBuffersAndAttributes(gl, this.colorProgram, buffer);
    twgljs.drawBufferInfo(gl, buffer);
  }

  private drawRange(
    gl: WebGLRenderingContext,
    player: PlayerComponent,
    view: { originX: number; originY: number; viewW: number; viewH: number },
  ): void {
    if (!this.overlayProgram || !this.overlayBuffer) return;
    const grabbing = player.grabHeld;
    const range = grabbing ? player.grabRange : player.digRange;
    const inRange = player.inToolRange(range);
    gl.useProgram(this.overlayProgram.program);
    twgljs.setBuffersAndAttributes(gl, this.overlayProgram, this.overlayBuffer);
    twgljs.setUniforms(this.overlayProgram, {
      u_origin: [view.originX, view.originY],
      u_viewSize: [view.viewW, view.viewH],
      u_center: [player.centerX(), player.centerY()],
      u_radius: range,
      u_color: inRange ? [0.35, 0.9, 0.45, 0.55] : [0.9, 0.25, 0.2, 0.7],
    });
    twgljs.drawBufferInfo(gl, this.overlayBuffer);
  }

  private worldToClip(x: number, y: number, view: { originX: number; originY: number; viewW: number; viewH: number }): [number, number] {
    return [((x - view.originX) / view.viewW) * 2 - 1, 1 - ((y - view.originY) / view.viewH) * 2];
  }

  private ensureSheet(gl: WebGLRenderingContext, animator: SpriteAnimatorComponent): void {
    const sheet = animator.sheet;
    if (this.spriteTexture && this.sheetWidth === sheet.width && this.sheetHeight === sheet.height) return;
    if (this.spriteTexture) gl.deleteTexture(this.spriteTexture);
    this.spriteTexture = twgljs.createTexture(gl, {
      mag: gl.NEAREST,
      min: gl.NEAREST,
      wrap: gl.CLAMP_TO_EDGE,
      width: sheet.width,
      height: sheet.height,
      src: sheet.pixels,
    });
    this.sheetWidth = sheet.width;
    this.sheetHeight = sheet.height;
  }
}
