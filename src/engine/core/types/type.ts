import type { Scene } from "../world";

export type Entity = string;
export type Dimension = {width: number, height: number};

export interface System {
  init(scene: Scene): void;
  exec(deltaTimeMs: number): void;
  destroy(): void;
}

export interface RendererBackend {
  init(canvas: HTMLCanvasElement): Promise<void>;
  draw(scenes: Scene[]): void;
  destroy(): void;
  resize(size: Dimension): void;
}

export type SceneObject = {id: string}
export type ComponentStructure = {
  [k: string]: any;
};
export type Component<T extends ComponentStructure> = T;
export type Properties<T> = { [P in keyof T]?: T[P] };
//export interface Component extends ComponentStructure {};

export interface SceneDefaultComponents {
  component: new () => Component<any>,
  key: string,
  options: {},
}
export interface SceneDefaultSystems {
  system: new () => System;
  key: string;
  options: {
    mode?: 'normal' | 'fixed'
  };
}