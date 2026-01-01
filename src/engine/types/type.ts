import type { Scene } from "../core/world";

export type Entity = string;
export type Dimension = {width: number, height: number};

export interface System {
  init(scene: Scene): void; // TODO System und Render Cycle muss Ordentlicher werden
  exec(deltaTimeMs: number): void; // TODO Hier fehlt sowas wie destroy()
}

export interface RendererBackend {
  init(canvas: HTMLCanvasElement): Promise<void>;
  draw(scene: Scene): void;
  destroy(): void; // TODO Noch nicht implementiert, wird nirgends aufgerufen
  resize(size: Dimension): void;
}

export type SceneObject = {id: string}
export type ComponentStructure = {
  [k: string]: any;
};
export type Component<T extends ComponentStructure> = T;

export type Camera = Component<SceneObject & { mode: '2d' | '3d'; background?: string }>;