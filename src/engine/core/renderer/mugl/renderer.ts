import { BufferUsage, ShaderStage, vertexBufferLayouts, VertexFormat, WebGL, type VertexBufferFormats } from 'mugl';
import type { Scene } from '../../../core/world';
import type { component2D, component3D, Dimension, RendererBackend } from '../../types/index';
import { triangleRenderItem2d } from './triangle2d';
import { createRenderItemFromGeometry } from './geometry3d';
import { mat4, vec3 } from 'gl-matrix';

export interface RenderItem {
  vertexShader: string;
  fragmentShader: string;
  bufferFormats: VertexBufferFormats[];
  verticies: Float32Array;
  indices?: Uint16Array | Uint32Array;
}

export class MuglRenderer implements RendererBackend {
  private canvas!: HTMLCanvasElement;
  private device?: any;

  async init(canvas: HTMLCanvasElement): Promise<void> {
    this.canvas = canvas;
    this.device = WebGL.requestWebGL2Device(canvas);
    if (!this.device) throw new Error('[mugl] WebGL 2.0 is unsupported');
    console.log('[mugl] WebGL 2.0 device initialized');
    return undefined;
  }

  resize(size: Dimension): void {
    this.canvas.width = size.width;
    this.canvas.height = size.height;
  }

  draw(scene: Scene): void {
    // Kamera aus der Szene holen (angenommen, es gibt nur eine)
    const cameraEntity = scene.getComponentStore<component3D.Camera>('camera3d').entries().next().value;
    let camera: component3D.Camera | undefined;
    if (cameraEntity) {
      camera = cameraEntity[1];  // [entity, component]
    }

    // View-Matrix berechnen (falls Kamera vorhanden)
    let viewMatrix = mat4.create();
    if (camera) {
      const eye = vec3.fromValues(camera.position.x, camera.position.y, camera.position.z);
      const center = vec3.fromValues(0, 0, 0);  // Blickrichtung (kann angepasst werden)
      const up = vec3.fromValues(0, 1, 0);      // Up-Vektor
      mat4.lookAt(viewMatrix, eye, center, up);
      
      // Rotation anwenden (Euler-Winkel zu Quaternion konvertieren, falls nötig)
      // Für Einfachheit: mat4.rotateY(viewMatrix, viewMatrix, camera.rotation.y);
      // Ähnlich für X und Z.
    }

    let renderItems: RenderItem[] = [];
    for (const [entity, triangle] of scene.getComponentStore<component2D.Triangle>('triangle2d').entries()) {
      if (!entity) continue;
      // TODO geometrie manipulation ausprogrammieren
      //triangle.position
      //triangle.rotation
      //triangle.scale
      renderItems.push(triangleRenderItem2d);
    }
    for (const [entity, mesh] of scene.getComponentStore<component3D.Mesh>('mesh3d').entries()) {
      if (!entity || !mesh.visible) continue;
      // TODO transform anwenden
      renderItems.push(createRenderItemFromGeometry(mesh.geometry));
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

      //TODO Camera ist iwie pain weil ich mit mugl nicht so einfach weitere variablen in den shader packen kann
      //TODO eventuell muss ich hier ein besseres framework nehmen oder komplett selber eine abstraktion schreiben
      // if (camera) {
      //   const uniformBuffer = WebGL.createBuffer(this.device, {
      //     usage: BufferUsage.Uniform,
      //     size: 64 // mat4 = 16 * 4 bytes = 64
      //   });
      //   WebGL.writeBuffer(this.device, uniformBuffer, viewMatrix as Float32Array);
      //   WebGL.setUniform(this.device, 0, uniformBuffer);
      // }

      if (renderItem.indices) {
        let indexBuffer = WebGL.createBuffer(this.device, { usage: BufferUsage.Index, size: renderItem.indices.byteLength });
        WebGL.writeBuffer(this.device, indexBuffer, renderItem.indices);
        WebGL.setIndex(this.device, indexBuffer);
        WebGL.drawIndexed(this.device, renderItem.indices.length);
        indexBuffer.destroy();
      } else {
        const floatsPerVertex = renderItem.bufferFormats[0].attributes.reduce((sum, attr) => {
          switch (attr) {
            case VertexFormat.F32x2:
              return sum + 2;
            case VertexFormat.F32x3:
              return sum + 3;
            case VertexFormat.F32x4:
              return sum + 4;
            default:
              return sum + 1;
          }
        }, 0);
        const vertexCount = renderItem.verticies.length / floatsPerVertex;
        WebGL.draw(this.device, vertexCount);
      }

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
