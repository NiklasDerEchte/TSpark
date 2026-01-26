import { component3D, type Entity, type RenderLayer } from '../../../types';
import type { RenderItem3 } from "../../../types/components3D";
import type { Scene, World } from "../../../world";
import * as twgljs from 'twgl.js';
import { createProgramInfo, type RenderEnvironment } from "../../environment";
import { degreeToRadians } from "../../../utils/common";

const XYZ = 3;
const UV = 2;

interface RenderCache {
  buffer: twgljs.BufferInfo;
  texture?: WebGLTexture;
  programInfo: twgljs.ProgramInfo;
}

export class Forward3DRenderLayer implements RenderLayer {
  private renderCache: Map<Entity, RenderCache> = new Map<Entity, RenderCache>();
  private environment!: RenderEnvironment;
  private textureProgramInfo: twgljs.ProgramInfo | undefined;
  private baseColorProgramInfo: twgljs.ProgramInfo | undefined;

  async init(environment: RenderEnvironment): Promise<void> {
    this.environment = environment;
    this.textureProgramInfo = await createProgramInfo(this.environment, 'shader/texture-vertex.glsl', 'shader/texture-fragment.glsl');
    this.baseColorProgramInfo = await createProgramInfo(this.environment, 'shader/base-color-vertex.glsl', 'shader/base-color-fragment.glsl');
    console.log('init');
  }

  destroy(): void {}

  draw(worlds: World[]) {
    if (!this.environment || !this.textureProgramInfo || !this.baseColorProgramInfo) {
      return;
    }
    worlds.forEach((world: World) => {
      world.getActiveScenes().forEach((scene: Scene) => {
        let camera: component3D.Camera3 | undefined = undefined;
        let cameraEntity = scene.getActiveCameraEntity();
        if (cameraEntity && scene.getComponentStore<component3D.Camera3>(component3D.Camera3.name).has(cameraEntity)) {
          camera = scene.getComponentStore<component3D.Camera3>(component3D.Camera3.name).get(cameraEntity);
        }

        let worldViewProjection;
        if (camera) {
          // --- Camera-Setup ---
          const aspect = this.environment.gl.canvas.width / this.environment.gl.canvas.height;
          const projectionMatrix = twgljs.m4.perspective(degreeToRadians(camera.fov), aspect, camera.near, camera.far);

          // Camera Rotation
          let viewMatrix;
          if (camera.target) {
            viewMatrix = twgljs.m4.inverse(twgljs.m4.lookAt(camera.position.toArray(), camera.target.position.toArray(), camera.target.up.toArray()));
          } else {
            let rotation = camera.rotation;
            let cameraMatrix = twgljs.m4.identity();
            cameraMatrix = twgljs.m4.translate(cameraMatrix, camera.position.toArray());
            cameraMatrix = twgljs.m4.rotateY(cameraMatrix, rotation.y);
            cameraMatrix = twgljs.m4.rotateX(cameraMatrix, rotation.x);
            cameraMatrix = twgljs.m4.rotateZ(cameraMatrix, rotation.z);
            viewMatrix = twgljs.m4.inverse(cameraMatrix);
          }
          worldViewProjection = twgljs.m4.multiply(projectionMatrix, viewMatrix);
        } else {
          worldViewProjection = twgljs.m4.identity();
        }

        for (const [entity, renderItem] of scene.getComponentStore<component3D.RenderItem3>(component3D.RenderItem3.name).entries()) {
          this.calculateRenderItem(entity, worldViewProjection, { renderItem: renderItem });
        }

        for (const [entity, component] of scene.getComponentStore<component3D.Box3>(component3D.Box3.name).entries()) {
          this.calculateRenderItem(entity, worldViewProjection, {
            renderItem: component.renderItem,
            position: component.position,
            rotation: component.rotation,
            scale: component.scale,
          });
        }
      });
    });
  }

  calculateRenderItem(
    entity: Entity,
    worldViewProjection: twgljs.m4.Mat4,
    item: {
      renderItem: RenderItem3;
      position?: component3D.Position3;
      rotation?: component3D.Rotation3;
      scale?: component3D.Scale3;
    },
  ) {
    if (!item.renderItem.visible) return;

    let modelMatrix = twgljs.m4.identity();
    if (item.position) {
      modelMatrix = twgljs.m4.translate(modelMatrix, item.position.toArray());
    }
    if (item.rotation) {
      modelMatrix = twgljs.m4.rotateX(modelMatrix, item.rotation.x);
      modelMatrix = twgljs.m4.rotateY(modelMatrix, item.rotation.y);
      modelMatrix = twgljs.m4.rotateZ(modelMatrix, item.rotation.z);
    }
    if (item.scale) {
      modelMatrix = twgljs.m4.scale(modelMatrix, item.scale.toArray());
    }

    let pixelTexture;
    let bufferInfo;
    let programInfo;

    if (item.renderItem.isDirty) {
      this.renderCache.delete(entity);
      item.renderItem.isDirty = false;
    }

    if (this.renderCache.has(entity) && this.renderCache.get(entity) != undefined) {
      let cache = this.renderCache.get(entity);
      pixelTexture = cache!.texture;
      bufferInfo = cache!.buffer;
      programInfo = cache!.programInfo;
    } else {
      const arrays: twgljs.Arrays = {
        position: {
          numComponents: XYZ,
          data: item.renderItem.geometry.vertices as number[] | Float32Array,
        },
        indices: item.renderItem.geometry.indices as number[] | Uint16Array | Uint32Array,
      };

      if (
        item.renderItem.material instanceof component3D.Material3 &&
        item.renderItem.material.texture.src &&
        item.renderItem.material.uvs.length > 0
      ) {
        programInfo = this.textureProgramInfo!;
        arrays.texCoord = {
          numComponents: UV,
          data: item.renderItem.material.uvs as number[] | Float32Array,
        };
        pixelTexture = twgljs.createTexture(this.environment.gl, {
          src: item.renderItem.material.texture,
          flipY: 1, // TODO das hier muss wegen den Blender Textures gemacht werden, ansonsten 0
        });
      } else {
        programInfo = this.baseColorProgramInfo!;
      }

      bufferInfo = twgljs.createBufferInfoFromArrays(this.environment.gl, arrays);

      this.renderCache.set(entity, {
        buffer: bufferInfo,
        texture: pixelTexture,
        programInfo: programInfo,
      });
    }

    this.environment.gl.useProgram(programInfo.program);

    const uniforms: { [key: string]: any } = {
      u_worldViewProjection: worldViewProjection,
      u_world: modelMatrix,
    };

    if (programInfo === this.textureProgramInfo!) {
      uniforms.u_texture = pixelTexture;
    } else {
      if (item.renderItem.material instanceof component3D.BaseColor3) {
        const color = item.renderItem.material.baseColor.toRgb();
        uniforms.u_color = [color.r / 255, color.g / 255, color.b / 255, color.a]; // TODO: Dieses Teilen ist nicht geil
      } else if (item.renderItem.material instanceof component3D.Material3) {
        const color = item.renderItem.material.color.toRgb();
        uniforms.u_color = [color.r / 255, color.g / 255, color.b / 255, color.a]; // TODO: Dieses Teilen ist nicht geil
      } else {
        uniforms.u_color = [0.556, 0.556, 0.556, 1]; // Default color
      }
    }

    twgljs.setBuffersAndAttributes(this.environment.gl, programInfo, bufferInfo);
    twgljs.setUniforms(programInfo, uniforms);
    twgljs.drawBufferInfo(this.environment.gl, bufferInfo);
  }
}