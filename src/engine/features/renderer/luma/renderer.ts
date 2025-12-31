import type { Transform3D, RendererBackend, Camera, Mesh3D } from '../../../types/index';
import { webgl2Adapter } from '@luma.gl/webgl';
import { luma, Texture } from '@luma.gl/core';
import { AsyncTexture, CubeGeometry, Geometry, loadImageBitmap, Model } from '@luma.gl/engine';
import type { Scene } from '../../../core/world';
import { colord } from 'colord';

// // GLSL
// const VS_GLSL = /* glsl */ `#version 300 es
// #define SHADER_NAME cube-vs

// uniform appUniforms {
//   mat4 modelViewProjectionMatrix;
// } app;

// layout(location=0) in vec3 positions;
// layout(location=1) in vec2 texCoords;

// out vec2 fragUV;
// out vec4 fragPosition;

// void main() {
//   gl_Position = app.modelViewProjectionMatrix * vec4(positions, 1.0);
//   fragUV = texCoords;
//   fragPosition = 0.5 * (vec4(positions, 1.) + vec4(1., 1., 1., 1.));
// }
// `;

// const FS_GLSL = /* glsl */ `#version 300 es
// #define SHADER_NAME cube-fs
// precision highp float;

// uniform sampler2D uTexture;

// in vec2 fragUV;
// in vec4 fragPosition;

// layout (location=0) out vec4 fragColor;

// void main() {
//   fragColor = texture(uTexture, vec2(fragUV.x, 1.0 - fragUV.y));
// }
// `;

// const vs = `
// attribute vec3 positions;
// void main(void) {
//   gl_Position = vec4(positions, 1.0);
// }
// `;

// const fs = `
// precision highp float;
// void main(void) {
//   gl_FragColor = vec4(1.0, 0.3, 0.3, 1.0);
// }
// `;


const WGSL_SHADER = /* WGSL */ `\
struct Uniforms {
  modelViewProjectionMatrix : mat4x4<f32>,
};

@group(0) @binding(0) var<uniform> app : Uniforms;
@group(0) @binding(1) var uTexture : texture_2d<f32>;
@group(0) @binding(2) var uTextureSampler : sampler;

struct VertexInputs {
  // CUBE GEOMETRY
  @location(0) positions : vec4<f32>,
  @location(1) texCoords : vec2<f32>
};

struct FragmentInputs {
  @builtin(position) Position : vec4<f32>,
  @location(0) fragUV : vec2<f32>,
  @location(1) fragPosition: vec4<f32>,
}

@vertex
fn vertexMain(inputs: VertexInputs) -> FragmentInputs {
  var outputs : FragmentInputs;
  outputs.Position = app.modelViewProjectionMatrix * inputs.positions;
  outputs.fragUV = inputs.texCoords;
  outputs.fragPosition = 0.5 * (inputs.positions + vec4(1.0, 1.0, 1.0, 1.0));
  return outputs;
}

@fragment
fn fragmentMain(inputs: FragmentInputs) -> @location(0) vec4<f32> {
  // return inputs.fragPosition;
  return textureSample(uTexture, uTextureSampler, inputs.fragUV);
}
`;

// GLSL

export const VS_GLSL = /* glsl */ `\
#version 300 es
#define SHADER_NAME cube-vs

uniform appUniforms {
  mat4 modelViewProjectionMatrix;
} app;

layout(location=0) in vec3 positions;
layout(location=1) in vec2 texCoords;

out vec2 fragUV;
out vec4 fragPosition;

void main() {
  gl_Position = app.modelViewProjectionMatrix * vec4(positions, 1.0);
  fragUV = texCoords;
  fragPosition = 0.5 * (vec4(positions, 1.) + vec4(1., 1., 1., 1.));
}
`;

export const FS_GLSL = /* glsl */ `\
#version 300 es
#define SHADER_NAME cube-fs
precision highp float;

uniform sampler2D uTexture;

uniform appUniforms {
  mat4 modelViewProjectionMatrix;
} app;

in vec2 fragUV;
in vec4 fragPosition;

layout (location=0) out vec4 fragColor;

void main() {
  fragColor = fragPosition;
  fragColor = texture(uTexture, vec2(fragUV.x, 1.0 - fragUV.y));
}
`;

export class LumaRenderer implements RendererBackend {
  private canvas!: HTMLCanvasElement;
  // Keep device typed as any to be resilient across minor API changes
  private device!: any;
  private model!: Model;
  // private positionBuffer!: any; // kept for future 2D path (currently unused)
  private renderPass: any | null = null;

  async init(canvas: HTMLCanvasElement): Promise<void> {
    this.canvas = canvas;

    // Attach a luma Device to an existing WebGL2 context (idiomatic v9)
    const gl = canvas.getContext('webgl2', { antialias: true, depth: true }) as WebGL2RenderingContext | null;
    if (!gl) throw new Error('WebGL2 not available');
    this.device = await luma.attachDevice(gl, {
      adapters: [webgl2Adapter],
      createCanvasContext: { autoResize: false },
    });

    // Load image and create a WebGL texture with known size (disable mipmaps to avoid NPOT issues)
    // let imageBitmap: ImageBitmap | null = null;
    // try {
    //   imageBitmap = await loadImageBitmap('/vis-logo.png');
    // } catch (e) {
    //   console.warn('Failed to load texture image, using 1x1 fallback', e);
    //   const c = document.createElement('canvas');
    //   c.width = 1; c.height = 1;
    //   const ctx = c.getContext('2d');
    //   if (ctx) { ctx.fillStyle = '#ffffff'; ctx.fillRect(0, 0, 1, 1); }
    //   imageBitmap = await createImageBitmap(c);
    // }

    // const texture = new AsyncTexture(this.device, {
    //   usage: Texture.TEXTURE | Texture.COPY_DST,
    //   data: imageBitmap!,
    //   mipmaps: false,
    //   sampler: this.device.createSampler({
    //     minFilter: 'linear',
    //     magFilter: 'linear',
    //   }),
    // });

    // this.model = new Model(this.device, {
    //   vs: VS_GLSL,
    //   fs: FS_GLSL,
    //   geometry: new CubeGeometry(), // built-in geometry
    //   bindings: {
    //     uSampler: texture,
    //   },
    // });

    // this.model = new Model(this.device, {
    //   vs: VS_GLSL,
    //   fs: FS_GLSL,
    //   geometry: new CubeGeometry({ indices: false }),
    //   bindings: {
    //     uTexture: texture,
    //   },
    //   parameters: {
    //     depthWriteEnabled: true,
    //     depthCompare: 'less-equal',
    //   },
    // });

    // this.model = new Model(this.device, {
    //   vs: `#version 300 es
    //     in vec2 aPosition;
    //     in vec4 aColor;
    //     out vec4 vColor;
    //     void main() {
    //       vColor = aColor;
    //       gl_Position = vec4(aPosition, 0.0, 1.0);
    //     }
    //   `,
    //   fs: `#version 300 es
    //     precision highp float;
    //     in vec4 vColor;
    //     out vec4 fragColor;
    //     void main() {
    //       fragColor = vColor;
    //     }
    //   `,
    //   attributes: {
    //     aPosition: this.positionBuffer,
    //   },
    //   vertexCount: 6,
    //   topology: 'triangle-list',
    // });
  }

  resize(width: number, height: number): void {
    this.canvas.width = width;
    this.canvas.height = height;
  }

  begin(camera: Camera): void {
    const rgba = colord(camera.background ?? '#000000').toRgb();
    const gl = (this.device as any).gl as WebGLRenderingContext | WebGL2RenderingContext;
    gl.viewport(0, 0, this.canvas.width, this.canvas.height);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    // Create a render pass targeting the default framebuffer
    this.renderPass = this.device.beginRenderPass({ clearColor: [rgba.r / 255, rgba.g / 255, rgba.b / 255, rgba.a] });
  }

  draw(scene: Scene): void {
    // TODO TEST
    this.model.draw(this.renderPass);

    for (const [entity, mesh] of scene.getComponentStore<Mesh3D>('meshes3D').entries()) {
      const t = scene.getComponentStore<Transform3D>('transforms').get(entity);
      if (!t) continue;
      this.drawMesh(t, mesh);
    }
  }

  end(): void {
    if (this.renderPass) {
      this.renderPass.end();
      this.renderPass = null;
    }
    if (this.device) {
      this.device.submit?.();
    }
  }

  private drawMesh(_t: Transform3D, _m: Mesh3D): void {
    // 3D not implemented in this minimal example
  }
}
