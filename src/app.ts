import { TwglRenderer, type Dimension, type RendererBackend, type System } from './engine';
import { GameLoop } from './engine/core/game-loop';
import { Scene, World } from './engine/core/world';

export interface TSparkSetup {
  renderer: RendererBackend;
  canvas?: HTMLCanvasElement | undefined;
  size?: Dimension;
  onAsyncStart?: () => Promise<void>;
  onStart?: () => void;
  onUpdate?: () => void;
  onFixedUpdate?: () => void;
  onDrawUpdate?: (scenes: Scene[]) => void;
}

/**
 * TSpark Engine Main Class
 */
export class TSpark {
  public static Instance: TSpark;
  private setup!: TSparkSetup;
  private gameLoop!: GameLoop;
  private drawCanvas!: HTMLCanvasElement;
  private worlds: Map<string, World> = new Map<string, World>();
  private pressedKeys: Map<string, boolean> = new Map();
  private activeWorldIndex: string = '';

  /**
   * TSpark Constructor
   * @param setup TSparkSetup
   * @returns TSpark instance
   */
  constructor(setup: Partial<TSparkSetup> = {}) {
    if (TSpark.Instance) {
      console.warn('TSpark instance already exists!');
      return;
    }
    let defaultSetup: TSparkSetup = {
      renderer: new TwglRenderer(),
      size: { height: 640, width: 640 * (16 / 9) },
    };
    this.setup = { ...defaultSetup, ...setup };
    if (this.setup.canvas) {
      this.drawCanvas = this.setup.canvas;
    } else {
      let drawCanvas = document.getElementById('tspark-canvas');
      if (!drawCanvas || !(drawCanvas instanceof HTMLCanvasElement)) {
        drawCanvas = document.createElement('canvas');
        drawCanvas.id = 'tspark-canvas';
        document.body.appendChild(drawCanvas);
      }
      this.drawCanvas = drawCanvas as HTMLCanvasElement;
    }
    this.gameLoop = new GameLoop();
    TSpark.Instance = this;
    console.log('TSpark initialized');
  }

  /**
   * Inject HTML and CSS into the document
   * @param data
   */
  public async inject(data: { html?: string[]; css?: string[] }): Promise<void> {
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

  /**
   * The `code` property represents a physical key on the keyboard.
   *
   * [MDN Reference](https://developer.mozilla.org/docs/Web/API/KeyboardEvent/code)
   *
   * [Event Codes](https://developer.mozilla.org/de/docs/Web/API/UI_Events/Keyboard_event_code_values)
   */
  public isKeyPressed(code: string): boolean {
    let k = this.pressedKeys.get(code);
    if (!k) {
      return false;
    }
    return k;
  }

  /**
   * Inject HTML into the document to the draw canvas
   * @param path
   */
  public async injectHtml(path: string, position: InsertPosition = 'beforebegin') {
    try {
      const response = await fetch(path);
      if (!response.ok) {
        throw new Error(`Failed to fetch HTML from ${path}: ${response.statusText}`);
      }
      const injectedHtml = await response.text();
      this.getDrawCanvas().insertAdjacentHTML(position, injectedHtml);
    } catch (error) {
      console.error('Error injecting HTML:', error);
    }
  }

  /**
   * Inject CSS into the document head
   * @param path
   */
  public async injectCss(path: string) {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = path;
    document.head.appendChild(link);
  }

  /**
   * Get the renderer backend
   * @returns RendererBackend
   */
  public getRenderer(): RendererBackend {
    return this.setup.renderer;
  }

  /**
   * Get the draw canvas
   * @returns HTMLCanvasElement
   */
  public getDrawCanvas(): HTMLCanvasElement {
    return this.drawCanvas;
  }

  /**
   * Get the active world
   * @returns World
   */
  public getActiveWorld(): World {
    if (this.worlds.has(this.activeWorldIndex)) {
      let world = this.worlds.get(this.activeWorldIndex);
      if (world) {
        return world;
      }
    }
    throw new Error('No active world found');
  }

  /**
   * Create a new world
   * @param name
   * @returns World
   */
  public createWorld(name: string): World {
    if (this.worlds.size == 0) {
      this.activeWorldIndex = name;
    }
    let world = new World();
    this.worlds.set(name, world);
    return world;
  }

  /**
   * Get the current FPS
   * @returns number
   */
  public getFPS(): number {
    return this.gameLoop.getFps();
  }

  /**
   * Start the TSpark engine
   */
  public async start() {
    window.addEventListener('keydown', this.onKeyDown);
    window.addEventListener('keyup', this.onKeyUp);
    await this.setup.renderer.init(this.drawCanvas);
    await this.setup.onAsyncStart?.();
    if (this.setup.size) {
      this.setup.renderer.resize(this.setup.size);
      console.log('Resize!');
    }
    this.setup.onStart?.();
    this.gameLoop.start(this.update, this.fixedUpdate);
  }

  /**
   * Stop the TSpark engine
   */
  public stop() {
    window.removeEventListener('keydown', this.onKeyDown);
    window.removeEventListener('keyup', this.onKeyUp);
    this.gameLoop.stop();
    this.setup.renderer.destroy();
  }

  /**
   * Update function called every frame
   * @param deltaTimeMs number
   */
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

  /**
   * Fixed update function called at fixed intervals
   * @param deltaTimeMs number
   */
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

  /**
   * Draw update function, called after update()
   */
  private drawUpdate() {
    this.setup.renderer.draw(this.getActiveWorld().getActiveScenes());
    this.setup.onDrawUpdate?.(this.getActiveWorld().getActiveScenes());
  }

  /**
   * Handle key down events
   * @param event
   */
  private onKeyDown = (event: KeyboardEvent) => {
    this.pressedKeys.set(event.code, true);
  };

  /**
   * Handle key up events
   * @param event
   */
  private onKeyUp = (event: KeyboardEvent) => {
    this.pressedKeys.set(event.code, false);
  };
}
