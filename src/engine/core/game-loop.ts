export class GameLoop {
  private lastTime = 0;
  private isRunning = false;
  private updateCallback: (dt: number) => void = () => {};
  private fixedUpdateCallback: (dt: number) => void = () => {};
  private deltaTime = 0;
  private fixedUpdateInterval = 1000 / 60; // every ~16.667ms = ~0.01667. 60 Times per second
  private fixedUpdateIntervalCounter = 0;
  private elapsedTimeSeconds = 0;

  // FPS Calculation
  private frameCount: number = 0;
  private lastFpsUpdateTime: number = 0;
  private fps: number = 0;

  private loop = (currentTime: number) => {
    if (!this.isRunning) return;
    if (this.lastTime === 0) {
      this.lastTime = currentTime;
    }
    this.deltaTime = currentTime - this.lastTime;
    this.lastTime = currentTime;
    this.elapsedTimeSeconds = currentTime / 1000;
    this.fixedUpdateIntervalCounter += this.deltaTime;
    while (this.fixedUpdateIntervalCounter >= this.fixedUpdateInterval) {
      this.fixedUpdateCallback(this.fixedUpdateInterval);
      this.fixedUpdateIntervalCounter -= this.fixedUpdateInterval;
    }
    this.updateCallback(this.deltaTime);

    this.frameCount++;
    if (currentTime > this.lastFpsUpdateTime + 1000) {
      this.fps = this.frameCount;
      this.frameCount = 0;
      this.lastFpsUpdateTime = currentTime;
    }

    requestAnimationFrame(this.loop);
  };

  start(update: (dt: number) => void, fixedUpdate: (dt: number) => void) {
    this.updateCallback = update;
    this.fixedUpdateCallback = fixedUpdate;
    this.isRunning = true;
    this.lastTime = performance.now();
    this.lastFpsUpdateTime = this.lastTime;
    requestAnimationFrame(this.loop);
  }

  stop() {
    this.isRunning = false;
  }

  public getFps(): number {
    return this.fps;
  }
}
