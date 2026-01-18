import { TSpark } from "../../../../app";

export class FPSOverlay {
  private fpsNode: Text | undefined;
  constructor() {}
  async init() {
    await TSpark.Instance.inject({
      html: ['ui/fps-overlay/overlay.html'],
      css: ['ui/fps-overlay/overlay.css'],
    });
    let fpsElement = document.querySelector('#fps');
    this.fpsNode = document.createTextNode('');
    fpsElement?.appendChild(this.fpsNode);
  }
  draw() {
    if(this.fpsNode) {
      this.fpsNode.nodeValue = TSpark.Instance.getFPS().toFixed(0);
    }
  }
}