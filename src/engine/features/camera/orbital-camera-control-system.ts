import { assignProps } from '../../core';
import { component3D, type Component, type Entity, type Properties, type System, type WorldQueryData } from '../../core/types/index';
import { Scene, World } from '../../core/world';

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
  world!: World;
  init(world: World): void {
    this.world = world;
  }

  exec(dt: number) {
    this.world.query<OrbitalCameraControlComponent>(OrbitalCameraControlComponent.name, (result: WorldQueryData<OrbitalCameraControlComponent>) => {
      this.world.queryOne<component3D.Camera3>(
        component3D.Camera3.name,
        result.component.cameraEntity,
        (result: WorldQueryData<component3D.Camera3>) => {
          if (result.component) {
            const time = performance.now() * 0.001; // Zeit in Sekunden
            const cameraRadius = 5;
            const cameraX = Math.sin(time) * cameraRadius;
            const cameraZ = Math.cos(time) * cameraRadius;

            let position = new component3D.Position3();
            position.x = cameraX;
            position.y = Math.sin(time) * Math.PI;
            position.z = cameraZ;
            result.component.position = position;
          }
        },
      );
    });
  }

  destroy(): void {}
}
