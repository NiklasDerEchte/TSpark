import type { Scene } from "../core/world";

export type Entity = string;
export type Dimension = {width: number, height: number};

export interface System {
  init(scene: Scene): void; // TODO System und Render Cycle muss Ordentlicher werden
  exec(deltaTimeMs: number): void; // TODO Hier fehlt sowas wie destroy()
}

export type ComponentData = {
  [k: string]: any;
};

export interface RendererBackend {
  init(canvas: HTMLCanvasElement): Promise<void>;
  draw(scene: Scene): void;
  destroy(): void; // TODO Noch nicht implementiert, wird nirgends aufgerufen
  resize(size: Dimension): void;
}

export type Component<T extends ComponentData> = T;
export type SceneObject = {id: string}
export type Camera = Component<SceneObject & { mode: '2d' | '3d'; background?: string }>;

// 2D
export type Vector2D = Component<{ x: number; y: number }>;
export type Position2D = Component<Vector2D>;
export type Rotation2D = Component<Vector2D>;
export type Scale2D = Component<Vector2D>;
export type Transform2D = Component<{ position: Position2D; rotation?: Rotation2D; scale?: Scale2D }>;
export type Velocity2D = Component<Vector2D>;
export type Sprite2D = Component<SceneObject & {color: string, width: number, height: number}>
export type Triangle2D = Component<SceneObject & Transform2D & {color?: string}>;

// 3D
export type Vector3D = { x: number; y: number; z: number };
export type Position3D = Component<Vector3D>;
export type Rotation3D = Component<Vector3D>;
export type Scale3D = Component<Vector3D>;
export type Transform3D = Component<{ position: Position3D; rotation?: Rotation3D; scale?: Scale3D }>;

export type Material3D = Component<{baseColor?: string | [number, number, number, number];}>;

export type BoundsAABB = { min: Vector3D; max: Vector3D };
export type BoundsSphere = { center: Vector3D; radius: number };
export type Bounds3D = BoundsAABB | BoundsSphere;
export type Geometry3D = {
  vertices: Float32Array | number[];
  indices?: Uint16Array | Uint32Array | number[];
  normals?: Float32Array | number[];
  uvs?: Float32Array | number[];
  vertexCount: number;
};
export type Mesh3D = Component<SceneObject & {
  geometry: Geometry3D;
  material?: Material3D;
  bounds?: Bounds3D;
  visible?: boolean;
}>;
export type Box3D = Component<Transform3D>;
export type Sphere3D = Component<Transform3D>;
export type Cylinder3D = Component<Transform3D>;
export type Cone3D = Component<Transform3D>;
export type Capsule3D = Component<Transform3D>;