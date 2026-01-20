import { assignProps } from '../../core';
import { Rotation3 } from '../../core/types/components3D';
import { component3D, type Component, type Properties, type System, type WorldQueryData } from '../../core/types/index';
import { World } from '../../core/world';

export class RotationLoop
  implements
    Component<{
      rotation?: Rotation3;
    }>
{
  rotation: Rotation3 = new Rotation3;
  constructor(props?: Properties<RotationLoop>) {
    assignProps(this, props);
  }
}

export class RotationLoopBox3System implements System {
  world!: World;
  init(world: World): void {
    this.world = world;
  }

  exec(dt: number) {
    const deltaTimeInSeconds = dt / 1000;
    this.world.query<RotationLoop>(RotationLoop.name, (result: WorldQueryData<RotationLoop>) => {
      this.world.queryOne<component3D.Box3>(component3D.Box3.name, result.entity, (boxResult: WorldQueryData<component3D.Box3>) => {
        if (boxResult.component?.rotation && result.component.rotation) {
          boxResult.component.rotation.x += result.component.rotation.x * deltaTimeInSeconds;
          boxResult.component.rotation.y += result.component.rotation.y * deltaTimeInSeconds;
          boxResult.component.rotation.z += result.component.rotation.z * deltaTimeInSeconds;
        }
      });
    });
  }

  destroy(): void {}
}
