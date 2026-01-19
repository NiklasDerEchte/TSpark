import { assignProps } from '../../core';
import { component3D, type Component, type Entity, type Properties, type System } from '../../core/types/index';
import { Scene } from '../../core/world';

export interface IOrbitalCameraControlSystem {
  cameraEntity: Entity;
}

export class OrbitalCameraControlComponent implements Component<IOrbitalCameraControlSystem> {
  cameraEntity!: Entity;
  constructor(props?: Properties<OrbitalCameraControlComponent>) {
    assignProps(this, props);
  }
}

export class OrbitalCameraControlSystem implements System {
  scene!: Scene;
  init(scene: Scene): void {
    this.scene = scene;
  }

  exec(dt: number) {
    const deltaTimeInSeconds = dt / 1000;
    for (const [entity, orbitalCameraControlComponent] of this.scene
      .getComponentStore<OrbitalCameraControlComponent>(OrbitalCameraControlComponent.name)
      .entries()) {
      let camera = this.scene.getComponentStore<component3D.Camera3>(component3D.Camera3.name).get(orbitalCameraControlComponent.cameraEntity) as component3D.Camera3 | undefined;
      // TODO Durch einen Input austauschen WSAD Pfeiltasten etc.
      if (camera) {
        const time = performance.now() * 0.001; // Zeit in Sekunden
        const cameraRadius = 5;
        const cameraX = Math.sin(time) * cameraRadius;
        const cameraZ = Math.cos(time) * cameraRadius;

        let position = new component3D.Position3();
        position.x = cameraX;
        position.y = Math.sin(time) * Math.PI;
        position.z = cameraZ;
        camera.position = position;
      }
    }
  }

  destroy(): void {}
}
