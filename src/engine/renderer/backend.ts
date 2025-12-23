import type { Transform } from '../types/index';

export type Camera = { mode: '2d' | '3d'; background?: string };
export type Sprite2D = { color: string; width: number; height: number };
export type Mesh3D = { id: string };

export interface RendererBackend {
  init(canvas: HTMLCanvasElement): Promise<void>;
  resize(width: number, height: number): void;
  begin(camera: Camera): void;
  drawSprite(transform: Transform, sprite: Sprite2D): void;
  drawMesh(transform: Transform, mesh: Mesh3D): void;
  end(): void;
}
