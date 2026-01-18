import type { RendererBackend, System } from './engine';
import { GameLoop } from './engine/core/game-loop';
import { Scene, World } from './engine/core/world';

export interface TSparkSetup {
  renderer: RendererBackend;
  canvas?: HTMLCanvasElement | undefined;
  onAsyncStart?: () => Promise<void>;
  onStart?: () => void;
  onUpdate?: () => void;
  onFixedUpdate?: () => void;
  onDrawUpdate?: (scenes: Scene[]) => void;
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
    if (this.setup.canvas) {
      this.drawCanvas = this.setup.canvas;
    } else {
      let drawCanvas = document.getElementById('canvas');
      if (!drawCanvas || !(drawCanvas instanceof HTMLCanvasElement)) {
        drawCanvas = document.createElement('canvas');
        drawCanvas.id = 'canvas';
        document.body.appendChild(drawCanvas);
      }
      this.drawCanvas = drawCanvas as HTMLCanvasElement;
    }
    TSpark.Instance = this;
    console.log('TSpark initialized');
  }

  public async inject(data: { html?: string[]; css?: string[] }) {
    if (data.css) {
      for (const path of data.css) {
        await this.injectCss(path);
      }
    }
    if (data.html) {
      for (const path of data.html) {
        await this.injectHtml(path);
      }
    }
  }

  public async injectHtml(path: string) {
    try {
      const response = await fetch(path);
      if (!response.ok) {
        throw new Error(`Failed to fetch HTML from ${path}: ${response.statusText}`);
      }
      const injectedHtml = await response.text();
      this.getDrawCanvas().insertAdjacentHTML('beforebegin', injectedHtml);
    } catch (error) {
      console.error('Error injecting HTML:', error);
    }
  }

  public async injectCss(path: string) {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = path;
    document.head.appendChild(link);
  }

  // public injectHtml(path: string) {
  //   import injectedHtml from `${path}?raw`;
  //   this.getDrawCanvas().insertAdjacentHTML('beforebegin', injectedHtml);
  // }

  // public injectCss(path: string) {
  //   import `${path}`;
  // }

  public getRenderer(): RendererBackend {
    return this.setup.renderer;
  }

  public getDrawCanvas(): HTMLCanvasElement {
    return this.drawCanvas;
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

  public getFPS(): number {
    return this.gameLoop.getFps();
  }

  public async start() {
    await this.setup.renderer.init(this.drawCanvas);
    await this.setup.onAsyncStart?.();
    this.setup.onStart?.();
    this.gameLoop.start(this.update, this.fixedUpdate);
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
    this.setup.onDrawUpdate?.(this.getActiveWorld().getActiveScenes());
  }
}
