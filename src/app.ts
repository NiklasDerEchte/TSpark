import type { RendererBackend, System } from './engine';
import { GameLoop } from './engine/core/game-loop';
import { Scene, World } from './engine/core/world';

export interface TSparkSetup {
  renderer: RendererBackend;
  onStart?: () => void;
  onUpdate?: () => void;
  onFixedUpdate?: () => void;
  onDrawUpdate?: () => void;
  canvas?: HTMLCanvasElement | undefined;
}

export class TSpark {
  public static Instance: TSpark;
  private setup!: TSparkSetup;
  private gameLoop!: GameLoop;
  private drawCanvas!: HTMLCanvasElement;
  private worlds: Map<string, World> = new Map<string, World>();
  private activeWorldIndex: string = '';

  constructor(setup: TSparkSetup) {
    if (TSpark.Instance) {
      console.warn('TSpark instance already exists!');
      return;
    }
    this.setup = setup;
    this.gameLoop = new GameLoop();
    if(this.setup.canvas) {
      this.drawCanvas = this.setup.canvas;  
    } else {
      this.drawCanvas = document.createElement('canvas');
    }
    document.body.appendChild(this.drawCanvas);
    TSpark.Instance = this;
    console.log('TSpark initialized');
  }

  public getRenderer(): RendererBackend {
    return this.setup.renderer;
  }

  public getActiveWorld(): World {
    if (this.worlds.has(this.activeWorldIndex)) {
      let world = this.worlds.get(this.activeWorldIndex);
      if (world) {
        return world;
      }
    }
    throw new Error('No active world found');
  }

  public createWorld(name: string): World {
    if (this.worlds.size == 0) {
      this.activeWorldIndex = name;
    }
    let world = new World();
    this.worlds.set(name, world);
    return world;
  }

  public start() {
    this.setup.renderer.init(this.drawCanvas).then(() => {
      this.setup.onStart?.();
      this.gameLoop.start(this.update, this.fixedUpdate);
    });
  }

  public stop() {
    this.gameLoop.stop();
    this.setup.renderer.destroy();
  }

  private update = (deltaTimeMs: number) => {
    this.getActiveWorld()
      .getActiveScenes()
      .forEach((scene: Scene) => {
        scene.getSystems().forEach((system: System) => {
          system.exec(deltaTimeMs);
        });
      });
    this.setup.onUpdate?.();
    this.drawUpdate();
  };

  private fixedUpdate = (deltaTimeMs: number) => {
    this.getActiveWorld()
      .getActiveScenes()
      .forEach((scene: Scene) => {
        scene.getSystems('fixed').forEach((system: System) => {
          system.exec(deltaTimeMs);
        });
      });
    this.setup.onFixedUpdate?.();
  };

  private drawUpdate() {
    this.setup.renderer.draw(this.getActiveWorld().getActiveScenes());
    this.setup.onDrawUpdate?.();
  }
}
