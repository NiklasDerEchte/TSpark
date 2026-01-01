import { BufferUsage, ShaderStage, vertexBufferLayouts, VertexFormat, WebGL, type VertexBufferFormats } from 'mugl';
import type { Scene } from '../../../core/world';
import type { Camera, Dimension, RendererBackend, Triangle2D } from '../../../types';

let VERTEX_SHADER_2D: string = `#version 300 es
        layout (location=0) in vec2 position;
        layout (location=1) in vec4 color;
        out vec4 vColor;
        void main () {
          gl_Position = vec4(position, 0., 1.);
          vColor = color;
        }`;
let FRAGMENT_SHADER_2D: string = `#version 300 es
        precision mediump float;
        in vec4 vColor;
        out vec4 outColor;
        void main () {
          outColor = vColor;
        }`;

let VERTEX_BUFFER_FORMAT_2D = [{ attributes: [VertexFormat.F32x2, VertexFormat.F32x4] }];

interface RenderItem {
  vertexShader: string;
  fragmentShader: string;
  bufferFormats: VertexBufferFormats[];
  verticies: Float32Array;
}

let TRIANGLE_RENDER_ITEM: RenderItem = {
  vertexShader: VERTEX_SHADER_2D,
  fragmentShader: FRAGMENT_SHADER_2D,
  verticies: new Float32Array([
    // position  color
    +0.0,
    +0.5,
    1.0,
    0.0,
    0.0,
    1.0, // vertex 0
    +0.5,
    -0.5,
    0.0,
    1.0,
    0.0,
    1.0, // vertex 1
    -0.5,
    -0.5,
    0.0,
    0.0,
    1.0,
    1.0, // vertex 2
  ]),
  bufferFormats: VERTEX_BUFFER_FORMAT_2D,
};

let triangleDown: RenderItem = {
  vertexShader: VERTEX_SHADER_2D,
  fragmentShader: FRAGMENT_SHADER_2D,
  verticies: new Float32Array([
    // position  color
    +0.0,
    -0.5,
    1.0,
    0.0,
    0.0,
    1.0, // vertex 0
    +0.5,
    0.5,
    0.0,
    1.0,
    0.0,
    1.0, // vertex 1
    -0.5,
    0.5,
    0.0,
    0.0,
    1.0,
    1.0, // vertex 2
  ]),
  bufferFormats: VERTEX_BUFFER_FORMAT_2D,
};

export class MuglRenderer implements RendererBackend {
  private canvas!: HTMLCanvasElement;
  private device?: any;

  async init(canvas: HTMLCanvasElement): Promise<void> {
    this.canvas = canvas;
    this.device = WebGL.requestWebGL2Device(canvas);
    if (!this.device) throw new Error('WebGL 2.0 is unsupported');
    return undefined;
  }

  resize(size: Dimension): void {
    this.canvas.width = size.width;
    this.canvas.height = size.height;
  }

  draw(scene: Scene): void {
    let renderItems: RenderItem[] = [];
    for (const [entity, triangle] of scene.getComponentStore<Triangle2D>('triangles2D').entries()) {
      if (!entity) continue;
      // TODO geometrie manipulation ausprogrammieren
      //triangle.position
      //triangle.rotation
      //triangle.scale
      renderItems.push(TRIANGLE_RENDER_ITEM);
    }

    WebGL.beginRenderPass(this.device);
    for (let renderItem of renderItems) {
      let buffer = WebGL.createBuffer(this.device, { usage: BufferUsage.Vertex, size: renderItem.verticies.byteLength });
      WebGL.writeBuffer(this.device, buffer, renderItem.verticies);

      let vertex = WebGL.createShader(this.device, {
        usage: ShaderStage.Vertex,
        code: renderItem.vertexShader,
      });
      let fragment = WebGL.createShader(this.device, {
        usage: ShaderStage.Fragment,
        code: renderItem.fragmentShader,
      });
      let pipeline = WebGL.createRenderPipeline(this.device, {
        vertex: vertex,
        fragment: fragment,
        buffers: vertexBufferLayouts(renderItem.bufferFormats),
      });
      WebGL.setRenderPipeline(this.device, pipeline);
      WebGL.setVertex(this.device, 0, buffer);
      WebGL.draw(this.device, 3);

      vertex.destroy();
      fragment.destroy();
      pipeline.destroy();
      buffer.destroy();
    }
    WebGL.submitRenderPass(this.device);
  }

  destroy(): void {
    this.device.destroy();
  }
}
