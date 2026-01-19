import { TSpark } from '../../app';
import { assignProps } from '../../engine';
import { Vector3Defaults } from '../../engine/core/types/components3D';
import { component3D, type Component, type Entity, type Properties, type System } from '../../engine/core/types/index';
import { Scene } from '../../engine/core/world';

export interface ICharacterControlComponent {}

export class CharacterControlComponent implements Component<ICharacterControlComponent> {
  constructor(props?: Properties<CharacterControlComponent>) {
    assignProps(this, props);
  }
}

export class CharacterControlSystem implements System {
  scene!: Scene;
  character?: component3D.Position3;

  init(scene: Scene): void {
    this.scene = scene;
  }

  exec(dt: number) {
    for (let [entity, component] of this.scene.getComponentStore<CharacterControlComponent>(CharacterControlComponent.name).entries()) {
      let cameraComponent = this.scene.getComponentStore<component3D.Camera3>(component3D.Camera3.name).get(entity);
      if (cameraComponent) {
        this.calculateCameraMovement(cameraComponent);
      }
    }
  }

  calculateCameraMovement(camera: component3D.Camera3) {
    if (TSpark.Instance.isKeyPressed('KeyW') || TSpark.Instance.isKeyPressed('ArrowUp')) {
      camera.position.x += Vector3Defaults.Front.x * 3;
      camera.position.y += Vector3Defaults.Front.y * 3;
      camera.position.z += Vector3Defaults.Front.z * 3;
    }
    if (TSpark.Instance.isKeyPressed('KeyA') || TSpark.Instance.isKeyPressed('ArrowLeft')) {
      camera.position.x += Vector3Defaults.Left.x * 3;
      camera.position.y += Vector3Defaults.Left.y * 3;
      camera.position.z += Vector3Defaults.Left.z * 3;
    }
    if (TSpark.Instance.isKeyPressed('KeyS') || TSpark.Instance.isKeyPressed('ArrowDown')) {
      camera.position.x += Vector3Defaults.Back.x * 3;
      camera.position.y += Vector3Defaults.Back.y * 3;
      camera.position.z += Vector3Defaults.Back.z * 3;
    }
    if (TSpark.Instance.isKeyPressed('KeyD') || TSpark.Instance.isKeyPressed('ArrowRight')) {
      camera.position.x += Vector3Defaults.Right.x * 3;
      camera.position.y += Vector3Defaults.Right.y * 3;
      camera.position.z += Vector3Defaults.Right.z * 3;
    }
    console.log(camera.position);
  }

  destroy(): void {}
}
