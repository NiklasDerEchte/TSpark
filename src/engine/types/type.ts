import type { Scene } from "../core/world";

export type Entity = string;
export type Dimension = {width: number, height: number};

export interface System {
  init(scene: Scene): void;
  exec(deltaTimeMs: number): void;
  destroy(): void;
}

export interface RendererBackend {
  init(canvas: HTMLCanvasElement): Promise<void>;
  draw(scene: Scene): void;
  destroy(): void;
  resize(size: Dimension): void;
}

export type SceneObject = {id: string}
export type ComponentStructure = {
  [k: string]: any;
};
export type Component<T extends ComponentStructure> = T;
//export interface Component extends ComponentStructure {};