import { Forward3DRenderLayer } from "./twgl/3d/forward-renderer";
import { TwglRenderer, type TwglRenderSettings } from "./twgl/renderer";

export class DefaultRenderer extends TwglRenderer {
  constructor(setup?: Partial<TwglRenderSettings>) {
    super(setup);
    this.addRenderLayer(Forward3DRenderLayer.name, new Forward3DRenderLayer());
  }
}