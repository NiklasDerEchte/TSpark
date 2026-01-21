import type { Scene, World } from "../world";

export type Entity = string;
export type Dimension = {width: number, height: number};

export interface WorldQueryData<T> {
  scene: Scene;
  entity: Entity;
  component: T;
}

export interface System {
  init(world: World): void;
  exec(deltaTimeMs: number): void;
  destroy(): void; // TODO Werden nur beim entfernen aufgerufen, hier eventuell auch destroy() und exit() einführen
}

export interface RendererBackend { // TODO Eventuell die möglichkeit schaffen, dynamisch SubRenderer hinzuzufügen
  init(canvas: HTMLCanvasElement): Promise<void>;
  draw(scenes: Scene[]): void; // TODO Die Scenen werden hier nicht, da man über die Querys arbeiten kann und es bald mehrere Worlds gibt
  destroy(): void;
  resize(size: Dimension): void;
}

export interface SubRendererBackend {
  draw(scenes: Scene[]): void; // TODO Die Scenen werden hier nicht, da man über die Querys arbeiten kann und es bald mehrere Worlds gibt
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