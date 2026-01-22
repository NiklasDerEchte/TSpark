import { component3D, type RenderLayer } from '../../../types';
import type { Scene, World } from '../../../world';
import * as twgljs from 'twgl.js';
import type { RenderEnvironment } from '../../environment';
import { degreeToRadians } from '../../../utils/common';

export class EditorRenderLayer implements RenderLayer {
  private environment!: RenderEnvironment;
  private gridBufferInfo!: twgljs.BufferInfo;
  private gridSize: number = 1.0;
  private gridPlaneSize: number = 1000.0; // Große Plane für "unendliches" Grid

  async init(environment: RenderEnvironment): Promise<void> {
    this.environment = environment;
    this.createGridPlane();
  }

  private createGridPlane(): void {
    // Erstelle eine große horizontale Plane auf der XZ-Ebene (Y = 0)
    const halfSize = this.gridPlaneSize / 2;

    const arrays: twgljs.Arrays = {
      position: {
        numComponents: 3,
        data: [
          // Zwei Dreiecke für die Plane
          -halfSize,
          0,
          -halfSize,
          halfSize,
          0,
          -halfSize,
          halfSize,
          0,
          halfSize,
          -halfSize,
          0,
          halfSize,
        ],
      },
      indices: [0, 1, 2, 0, 2, 3],
    };

    this.gridBufferInfo = twgljs.createBufferInfoFromArrays(this.environment.gl, arrays);
  }

  destroy(): void {}

  draw(worlds: World[]) {
    if (!this.environment) {
      return;
    }

    const gl = this.environment.gl;

    // Enable blending für Transparenz
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
    
    // Depth testing anpassen für weniger Z-Fighting
    gl.enable(gl.DEPTH_TEST);
    gl.depthFunc(gl.LEQUAL);
    gl.depthMask(false); // Grid schreibt nicht in Depth-Buffer
    
    // Polygon Offset gegen Zittern/Z-Fighting
    gl.enable(gl.POLYGON_OFFSET_FILL);
    gl.polygonOffset(-1, -1);

    worlds.forEach((world: World) => {
      world.getActiveScenes().forEach((scene: Scene) => {
        let camera: component3D.Camera3 | undefined = undefined;
        let cameraEntity = scene.getActiveCameraEntity();
        if (cameraEntity && scene.getComponentStore<component3D.Camera3>(component3D.Camera3.name).has(cameraEntity)) {
          camera = scene.getComponentStore<component3D.Camera3>(component3D.Camera3.name).get(cameraEntity);
        }

        if (!camera) {
          return;
        }

        // Camera-Setup
        const aspect = gl.canvas.width / gl.canvas.height;
        const projectionMatrix = twgljs.m4.perspective(degreeToRadians(camera.fov), aspect, camera.near, camera.far);

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

        // Model-Matrix: Plane folgt der Kamera auf der XZ-Ebene (Y bleibt bei 0)
        let modelMatrix = twgljs.m4.identity();
        modelMatrix = twgljs.m4.translate(modelMatrix, [camera.position.x, 0, camera.position.z]);

        // Render das Grid
        gl.useProgram(this.environment.editorGridProgramInfo.program);

        const uniforms = {
          uModel: modelMatrix,
          uView: viewMatrix,
          uProjection: projectionMatrix,
          uGridSize: this.gridSize,
          uLineWidth: 0.05,
          uCameraPosition: camera.position.toArray(),
        };

        twgljs.setBuffersAndAttributes(gl, this.environment.editorGridProgramInfo, this.gridBufferInfo);
        twgljs.setUniforms(this.environment.editorGridProgramInfo, uniforms);
        twgljs.drawBufferInfo(gl, this.gridBufferInfo);
      });
    });

    // Restore states
    gl.disable(gl.POLYGON_OFFSET_FILL);
    gl.depthMask(true);
    gl.disable(gl.BLEND);
  }
}
