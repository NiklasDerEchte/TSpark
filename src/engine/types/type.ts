import type { Scene } from "../core/scene-manager";

export type Entity = string;

export interface System {
  init(scene: Scene): void;
  exec(deltaTimeMs: number): void;
}

export type ComponentData = {
  [k: string]: any;
};

export type Component<T extends ComponentData> = T;

export type Vector = Component<{ x: number; y: number; z?: number }>;
export type Position = Component<Vector>;
export type Rotation = Component<Vector>;
export type Scale = Component<Vector>;
export type Transform = Component<{ position: Position; rotation?: Rotation; scale?: Scale }>;
export type Velocity = Component<Vector>;

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
