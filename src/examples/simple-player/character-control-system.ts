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
  isPointerLocked: boolean = false;

  init(scene: Scene): void {
    this.scene = scene;
    document.addEventListener('mousemove', this.handleMouseMove.bind(this));
    TSpark.Instance.getDrawCanvas().addEventListener('click', () => {
      TSpark.Instance.getDrawCanvas().requestPointerLock();
    });
    document.addEventListener('pointerlockchange', () => {
      this.isPointerLocked = document.pointerLockElement === TSpark.Instance.getDrawCanvas();
    });
  }

  handleMouseMove(event: MouseEvent) {
    if (!this.isPointerLocked) return;

    for (let [entity, component] of this.scene.getComponentStore<CharacterControlComponent>(CharacterControlComponent.name).entries()) {
      let cameraComponent = this.scene.getComponentStore<component3D.Camera3>(component3D.Camera3.name).get(entity);
      if (cameraComponent) {
        const sensitivity = 0.002;
        cameraComponent.rotation.y -= event.movementX * sensitivity;
        cameraComponent.rotation.x -= event.movementY * sensitivity;

        // Clamp pitch to avoid flipping
        cameraComponent.rotation.x = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, cameraComponent.rotation.x));
      }
    }
  }

  exec(dt: number) {
    for (let [entity, component] of this.scene.getComponentStore<CharacterControlComponent>(CharacterControlComponent.name).entries()) {
      let cameraComponent = this.scene.getComponentStore<component3D.Camera3>(component3D.Camera3.name).get(entity);
      if (cameraComponent) {
        this.calculateCameraMovement(dt / 1000, cameraComponent);
      }
    }
  }

  calculateCameraMovement(deltaTimeSeconds: number, camera: component3D.Camera3) {
    let speed = 3 * deltaTimeSeconds;

    const yaw = camera.rotation.y;
    const forward = new component3D.Position3({
      x: Math.sin(yaw),
      y: 0,
      z: Math.cos(yaw)
    });
    const right = new component3D.Position3({
      x: Math.cos(yaw),
      y: 0,
      z: -Math.sin(yaw)
    });

    if (TSpark.Instance.isKeyPressed('KeyW') || TSpark.Instance.isKeyPressed('ArrowUp')) {
      camera.position.x -= forward.x * speed;
      camera.position.z -= forward.z * speed;
    }
    if (TSpark.Instance.isKeyPressed('KeyA') || TSpark.Instance.isKeyPressed('ArrowLeft')) {
      camera.position.x -= right.x * speed;
      camera.position.z -= right.z * speed;
    }
    if (TSpark.Instance.isKeyPressed('KeyS') || TSpark.Instance.isKeyPressed('ArrowDown')) {
      camera.position.x += forward.x * speed;
      camera.position.z += forward.z * speed;
    }
    if (TSpark.Instance.isKeyPressed('KeyD') || TSpark.Instance.isKeyPressed('ArrowRight')) {
      camera.position.x += right.x * speed;
      camera.position.z += right.z * speed;
    }
  }

  destroy(): void {
    document.removeEventListener('mousemove', this.handleMouseMove.bind(this));
  }
}
