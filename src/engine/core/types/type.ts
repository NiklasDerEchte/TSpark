import type { RenderEnvironment } from "../renderer/environment";
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
  destroy(): void; // TODO Werden nur beim entfernen aufgerufen, hier eventuell auch destroy() und exit() einführen; OnActivate und OnDeactivate
}

export interface RenderLayer {
  init(environment: RenderEnvironment): Promise<void>;
  draw(worlds: World[]): void;
  destroy(): void;
}

export interface RendererBackend {
  init(canvas: HTMLCanvasElement): Promise<void>;
  draw(worlds: World[]): void;
  resize(size: Dimension): void;
  destroy(): void;

  /**
   * Add a render layer to the renderer
   * @param key 
   * @param renderLayer 
   */
  addRenderLayer(key: string, renderLayer: RenderLayer): Promise<void>;

  /**
   * Get a render layer by key
   * @param key 
   */
  getRenderLayer(key: string): RenderLayer | undefined;

  /**
   * Remove a render layer by key
   * @param key 
   */
  removeRenderLayer(key: string): void;
}

export type SceneObject = {id: string}
export type ComponentStructure = {
  [k: string]: any;
};
export type Component<T extends ComponentStructure> = T;
export type Properties<T> = { [P in keyof T]?: T[P] };
//export interface Component extends ComponentStructure {};