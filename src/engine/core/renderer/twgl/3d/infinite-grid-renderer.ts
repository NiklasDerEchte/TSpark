import { component3D, type RenderLayer } from '../../../types';
import type { Scene, World } from '../../../world';
import * as twgljs from 'twgl.js';
import type { RenderEnvironment } from '../../environment';
import { degreeToRadians } from '../../../utils/common';

export class InfiniteGridRenderLayer implements RenderLayer {
  private environment!: RenderEnvironment;
  private gridBufferInfo!: twgljs.BufferInfo;
  private gridSize: number = 100.0;
  private gridMinPixelsBetweenCells: number = 2.0;
  private gridCellSize: number = 0.025;

  async init(environment: RenderEnvironment): Promise<void> {
    this.environment = environment;
    this.createGridBuffer();
  }

  private createGridBuffer(): void {
    // Erstelle 6 Vertices für den Quad (2 Dreiecke)
    // Positions: bottom-left, bottom-right, top-right, top-left
    const arrays: twgljs.Arrays = {
      position: {
        numComponents: 3,
        data: [
          // Dreieck 1
          -1.0, 0.0, -1.0,  // bottom-left
           1.0, 0.0,  1.0,  // top-right
           1.0, 0.0, -1.0,  // bottom-right
          // Dreieck 2
           1.0, 0.0,  1.0,  // top-right
          -1.0, 0.0, -1.0,  // bottom-left
          -1.0, 0.0,  1.0,  // top-left
        ],
      },
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

        // View-Projection Matrix
        const viewProjectionMatrix = twgljs.m4.multiply(projectionMatrix, viewMatrix);

        // Render das Grid
        gl.useProgram(this.environment.infiniteGridProgramInfo.program);

        const uniforms = {
          uViewProjection: viewProjectionMatrix,
          uGridSize: this.gridSize,
          uCameraPosition: camera.position.toArray(),
          uGridMinPixelsBetweenCells: this.gridMinPixelsBetweenCells,
          uGridCellSize: this.gridCellSize,
          uGridColorThin: [0.5, 0.5, 0.5, 1.0],
          uGridColorThick: [0.0, 0.0, 0.0, 1.0],
        };

        twgljs.setBuffersAndAttributes(gl, this.environment.infiniteGridProgramInfo, this.gridBufferInfo);
        twgljs.setUniforms(this.environment.infiniteGridProgramInfo, uniforms);
        twgljs.drawBufferInfo(gl, this.gridBufferInfo);
      });
    });

    gl.disable(gl.BLEND);
  }
}
