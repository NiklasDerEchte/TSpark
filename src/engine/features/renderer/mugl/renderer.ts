import { BufferUsage, ShaderStage, vertexBufferLayouts, VertexFormat, WebGL } from "mugl";
import type { Scene } from "../../../core/world";
import type { Camera, RendererBackend } from "../../../types";

export class MuglRenderer implements RendererBackend {
  private canvas!: HTMLCanvasElement;
  private device?: any;
  private buffer?: any;
  private renderPass: any | null = null;
  private pipeline?: any;
  private fragment?: any;
  private vertex?: any;

  async init(canvas: HTMLCanvasElement): Promise<void> {
    this.canvas = canvas;
    import.meta.env.MUGL_DEBUG = 'development';
    this.device = WebGL.requestWebGL2Device(canvas);
    if (!this.device) throw new Error('WebGL 2.0 is unsupported');
    return undefined;
  }
  resize(width: number, height: number): void {}

  begin(camera: Camera): void {
    const triangle = new Float32Array([
      // position  color
      +0.0, +0.5, 1.0, 0.0, 0.0, 1.0, // vertex 0
      +0.5, -0.5, 0.0, 1.0, 0.0, 1.0, // vertex 1
      -0.5, -0.5, 0.0, 0.0, 1.0, 1.0, // vertex 2
    ]);
    this.buffer = WebGL.createBuffer(this.device, { usage: BufferUsage.Vertex, size: triangle.byteLength });
    WebGL.writeBuffer(this.device, this.buffer, triangle);
    this.vertex = WebGL.createShader(this.device, {
      usage: ShaderStage.Vertex,
      code: `#version 300 es
        layout (location=0) in vec2 position;
        layout (location=1) in vec4 color;
        out vec4 vColor;
        void main () {
          gl_Position = vec4(position, 0., 1.);
          vColor = color;
        }`,
    });
    this.fragment = WebGL.createShader(this.device, {
      usage: ShaderStage.Fragment,
      code: `#version 300 es
        precision mediump float;
        in vec4 vColor;
        out vec4 outColor;
        void main () {
          outColor = vColor;
        }`,
    });
    this.pipeline = WebGL.createRenderPipeline(this.device, {
      vertex: this.vertex,
      fragment: this.fragment,
      // vertexBufferLayouts(...) auto-calculates the stride and offsets of vertex attributes for you
      // Attribute indices / ordering must match the attribute locations specified in vertex shader
      buffers: vertexBufferLayouts([{ attributes: [/* position */ VertexFormat.F32x2, /* color */ VertexFormat.F32x4] }]),
    });
  }

  draw(scene: Scene): void {
    WebGL.beginRenderPass(this.device);
    WebGL.setRenderPipeline(this.device, this.pipeline);
    WebGL.setVertex(this.device, 0, this.buffer);
    WebGL.draw(this.device, 3); // 3 vertices to draw
    WebGL.submitRenderPass(this.device);
  }

  end(): void {
    this.vertex.destroy();
    this.fragment.destroy();
    this.pipeline.destroy();
    this.buffer.destroy();
    this.device.destroy();
  }
}