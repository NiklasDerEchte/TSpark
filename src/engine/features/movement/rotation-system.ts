import { Rotation3 } from '../../core/types/components3D';
import { assignProps, component3D, type Component, type Properties, type System } from '../../core/types/index';
import { Scene } from '../../core/world';

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
  scene!: Scene;
  init(scene: Scene): void {
    this.scene = scene;
  }

  exec(dt: number) {
    const deltaTimeInSeconds = dt / 1000;
    for (const [entity, rotationLoopComponent] of this.scene.getComponentStore<RotationLoop>(RotationLoop.name).entries()) {
      if(this.scene.getComponentStore<component3D.Box3>(component3D.Box3.name).has(entity)) {
        const boxComponent = this.scene.getComponentStore<component3D.Box3>(component3D.Box3.name).get(entity);
        if (boxComponent?.rotation && rotationLoopComponent.rotation) {
          boxComponent.rotation.x += rotationLoopComponent.rotation.x * deltaTimeInSeconds;
          boxComponent.rotation.y += rotationLoopComponent.rotation.y * deltaTimeInSeconds;
          boxComponent.rotation.z += rotationLoopComponent.rotation.z * deltaTimeInSeconds;
        }
      }
    }
  }

  destroy(): void {
    
  }
}
