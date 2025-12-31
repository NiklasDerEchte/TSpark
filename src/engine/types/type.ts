import type { Scene } from "../core/world";

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

// 2D
export type Sprite2D = { color: string; width: number; height: number };

// 3D
export type Mesh3D = { id: string };
export type Box3D = Component<Transform>;
export type Sphere3D = Component<Transform>;
export type Cylinder3D = Component<Transform>;
export type Cone3D = Component<Transform>;
export type Capsule3D = Component<Transform>;

export interface RendererBackend {
  init(canvas: HTMLCanvasElement): Promise<void>;
  resize(width: number, height: number): void;
  begin(camera: Camera): void;
  draw(scene: Scene): void;
  end(): void;
}
