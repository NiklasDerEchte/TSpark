import { Forward3DRenderLayer } from "./twgl/3d/forward-renderer";
import { EditorRenderLayer } from "./twgl/3d/editor-renderer";
import { TwglRenderer, type TwglRenderSettings } from "./twgl/renderer";
import { InfiniteGridRenderLayer } from "./twgl/3d/infinite-grid-renderer";

export class DefaultRenderer extends TwglRenderer {
  constructor(setup?: Partial<TwglRenderSettings>) {
    super(setup);
    // TODO NEXT
    this.addRenderLayer(EditorRenderLayer.name, new EditorRenderLayer());
    // TODO this.addRenderLayer(InfiniteGridRenderLayer.name, new InfiniteGridRenderLayer());
    this.addRenderLayer(Forward3DRenderLayer.name, new Forward3DRenderLayer());
  }
}