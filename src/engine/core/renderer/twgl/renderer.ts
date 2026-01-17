import * as twgljs from 'twgl.js';
import { component2D, component3D, degreeToRadians, type Dimension, type Entity, type RendererBackend } from '../../types/index';
import type { Scene } from '../../world';
import type { RenderItem3 } from '../../types/components3D';

const XYZ = 3;
const UV = 2;

let getShader = async () => {
  let baseColorVertex = await fetch('shader/base-color-vertex.shader');
  let baseColorFragment = await fetch('shader/base-color-fragment.shader');
  let textureVertex = await fetch('shader/texture-vertex.shader');
  let textureFragment = await fetch('shader/texture-fragment.shader');
  let uiTextureVertex = await fetch('shader/ui-texture-vertex.shader');
  let uiTextureFragment = await fetch('shader/ui-texture-fragment.shader');
  return await {
    baseColor: {
      vs: await baseColorVertex.text(),
      fs: await baseColorFragment.text(),
    },
    texture: {
      vs: await textureVertex.text(),
      fs: await textureFragment.text(),
    },
    uiTexture: {
      vs: await uiTextureVertex.text(),
      fs: await uiTextureFragment.text(),
    },
  };
};

interface RenderCache {
  buffer: twgljs.BufferInfo;
  texture?: WebGLTexture;
  programInfo: twgljs.ProgramInfo;
}

export interface TwglRenderSettings {
  clearColor: { r: number; g: number; b: number; a: number };
  enableDepthTest: boolean;
  enableCullFace: boolean;
}

export class TwglRenderer implements RendererBackend {
  private setup: TwglRenderSettings;
  private gl!: WebGLRenderingContext;
  private baseColorProgramInfo!: twgljs.ProgramInfo;
  private textureProgramInfo!: twgljs.ProgramInfo;
  private uiTextureProgramInfo!: twgljs.ProgramInfo;
  private renderCache: Map<Entity, RenderCache> = new Map<Entity, RenderCache>();
  private fontAtlas: { texture: WebGLTexture, data: any } | undefined;

  constructor(setup?: Partial<TwglRenderSettings>) {
    this.setup = {
      enableCullFace: setup?.enableCullFace ?? false,
      enableDepthTest: setup?.enableDepthTest ?? true,
      clearColor: setup?.clearColor ?? { r: 0.97, g: 0.97, b: 0.97, a: 1 },
    };
  }

  async init(canvas: HTMLCanvasElement): Promise<void> {
    const gl = canvas.getContext('webgl');
    if (!gl) {
      throw new Error('[twgl] WebGL is not supported');
    }
    let shader = await getShader();
    this.gl = gl;
    this.baseColorProgramInfo = twgljs.createProgramInfo(this.gl, [shader.baseColor.vs, shader.baseColor.fs]);
    this.textureProgramInfo = twgljs.createProgramInfo(this.gl, [shader.texture.vs, shader.texture.fs]);
    this.uiTextureProgramInfo = twgljs.createProgramInfo(this.gl, [shader.uiTexture.vs, shader.uiTexture.fs]); // NEU

    await this.loadFont('fonts/arial.fnt');

    console.log('[twgl] WebGL device initialized');
  }

  async loadFont(url: string) {
    const response = await fetch(url);
    const text = await response.text();
    // TODO Hier eine Parser-Bibliothek für .fnt Dateien, z.B. 'parse-bmfont-ascii' oder ttf file
    // const fontData = parseFont(text); 
    // const fontTexture = twgljs.createTexture(this.gl, { src: `fonts/${fontData.pages[0]}` });
    // this.fontAtlas = { texture: fontTexture, data: fontData };
    console.warn("Font-Laden ist nur ein Platzhalter. Sie benötigen einen .fnt-Parser.");
  }


  resize(size: Dimension): void {
    if (!this.gl) return;
    this.gl.canvas.width = size.width;
    this.gl.canvas.height = size.height;
    this.gl.viewport(0, 0, this.gl.canvas.width, this.gl.canvas.height);
  }

  /**
   * this function is called every frame to draw the scenes
   * @param scenes
   * @returns
   */
  draw(scenes: Scene[]): void {
    if (!this.gl) return;

    twgljs.resizeCanvasToDisplaySize(this.gl.canvas as HTMLCanvasElement);
    this.gl.viewport(0, 0, this.gl.canvas.width, this.gl.canvas.height);
    this.gl.clearColor(this.setup.clearColor.r, this.setup.clearColor.g, this.setup.clearColor.b, this.setup.clearColor.a);
    this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);
    if (this.setup.enableDepthTest) {
      this.gl.enable(this.gl.DEPTH_TEST);
    }
    if (this.setup.enableCullFace) {
      this.gl.enable(this.gl.CULL_FACE);
    }

    this.render3D(scenes);
    this.gl.clear(this.gl.DEPTH_BUFFER_BIT);
    this.render2D(scenes);
  }

  render2D(scenes: Scene[]) {
    this.gl.disable(this.gl.DEPTH_TEST);

    scenes.forEach((scene: Scene) => {
      const orthoProjection = twgljs.m4.ortho(0, this.gl.canvas.width, this.gl.canvas.height, 0, -1, 1);

      for (const [entity, rect] of scene.getComponentStore<component2D.Rect2D>(component2D.Rect2D.name).entries()) {
        // Hier würde die Logik zum Zeichnen eines farbigen Rechtecks hinkommen
      }

      for (const [entity, uiText] of scene.getComponentStore<component2D.UIText2>(component2D.UIText2.name).entries()) {
        this.drawText(uiText, orthoProjection);
      }
    });

    if (this.setup.enableDepthTest) {
      this.gl.enable(this.gl.DEPTH_TEST);
    }
  }

  drawText(uiText: component2D.UIText2, projectionMatrix: twgljs.m4.Mat4) {
    // TODO
    // if (!this.fontAtlas) {
    //     console.error("Kein Font-Atlas geladen!");
    //     return;
    // }

    // 1. Gehe durch jeden Buchstaben im `uiText.text`.
    // 2. Finde die Informationen für diesen Buchstaben im `this.fontAtlas.data` (Position im Atlas, Größe, Offset).
    // 3. Erstelle für jeden Buchstaben ein `twgl.Arrays` Objekt für ein Rechteck (Quad).
    //    - Die `position` des Rechtecks wird aus `uiText.rect.position` und dem Buchstaben-Offset berechnet.
    //    - Die `texCoord` wird aus den Atlas-Daten berechnet.
    // 4. Erstelle ein `BufferInfo` aus den Arrays.
    // 5. Setze die Uniforms: `u_projection`, `u_texture` (der Font-Atlas), `u_color`.
    // 6. Rufe `twgl.drawBufferInfo` auf.

    // Dies ist ein sehr vereinfachter Platzhalter:
    // console.log(`Platzhalter: Zeichne Text "${uiText.text}" an Position (${uiText.rect.position.x}, ${uiText.rect.position.y})`);
  }

  render3D(scenes: Scene[]) {
    scenes.forEach((scene: Scene) => {
      let camera: component3D.Camera3 | undefined = undefined;
      let cameraEntity = scene.getActiveCameraEntity();
      if (cameraEntity && scene.getComponentStore<component3D.Camera3>(component3D.Camera3.name).has(cameraEntity)) {
        camera = scene.getComponentStore<component3D.Camera3>(component3D.Camera3.name).get(cameraEntity);
      }

      let worldViewProjection;
      if (camera) {
        // --- Camera-Setup ---
        const aspect = this.gl.canvas.width / this.gl.canvas.height;
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
  }

  calculateRenderItem(
    entity: Entity,
    worldViewProjection: twgljs.m4.Mat4,
    item: {
      renderItem: RenderItem3;
      position?: component3D.Position3;
      rotation?: component3D.Rotation3;
      scale?: component3D.Scale3;
    }
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
        programInfo = this.textureProgramInfo;
        arrays.texCoord = {
          numComponents: UV,
          data: item.renderItem.material.uvs as number[] | Float32Array,
        };
        pixelTexture = twgljs.createTexture(this.gl, {
          src: item.renderItem.material.texture,
          flipY: 1, // TODO das hier muss wegen den Blender Textures gemacht werden, ansonsten 0
        });
      } else {
        programInfo = this.baseColorProgramInfo;
      }

      bufferInfo = twgljs.createBufferInfoFromArrays(this.gl, arrays);

      this.renderCache.set(entity, {
        buffer: bufferInfo,
        texture: pixelTexture,
        programInfo: programInfo,
      });
    }

    this.gl.useProgram(programInfo.program);

    const uniforms: { [key: string]: any } = {
      u_worldViewProjection: worldViewProjection,
      u_world: modelMatrix,
    };

    if (programInfo === this.textureProgramInfo) {
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

    twgljs.setBuffersAndAttributes(this.gl, programInfo, bufferInfo);
    twgljs.setUniforms(programInfo, uniforms);
    twgljs.drawBufferInfo(this.gl, bufferInfo);
  }

  destroy(): void {
    // twgl hat keine explizite destroy-Methode, der GC sollte das übernehmen.
    // WebGL-Kontextverlust kann hier behandelt werden, falls nötig.
  }
}
