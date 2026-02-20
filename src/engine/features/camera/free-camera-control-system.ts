import { TSpark } from '../../../app';
import { assignProps } from '../../../engine';
import { component3D, type Component, type Properties, type System, type WorldQueryData } from '../../../engine/core/types/index';
import { World } from '../../../engine/core/world';

export interface IFreeCameraControlComponent {
  camera:
    | component3D.Camera3
    | {
        position?: component3D.Position3;
        rotation?: component3D.Rotation3;
      };
}

export class FreeCameraControlComponent implements Component<IFreeCameraControlComponent> {
  camera:
    | component3D.Camera3
    | {
        position: component3D.Position3;
        rotation: component3D.Rotation3;
      } = {
        position: new component3D.Position3(),
        rotation: new component3D.Rotation3()
      };
  constructor(props?: Properties<FreeCameraControlComponent>) {
    assignProps(this, props);
  }
}

export class FreeCameraControlSystem implements System {
  world!: World;
  character?: component3D.Position3;
  isPointerLocked: boolean = false;

  init(world: World): void {
    this.world = world;
    document.addEventListener('mousemove', this.handleMouseMove.bind(this));
    document.addEventListener('pointerlockchange', this.onPointerLockChange);
    TSpark.getInstance().getDrawCanvas().addEventListener('click', this.onClick);
  }

  exec(dt: number) {
    this.world.query<FreeCameraControlComponent>(FreeCameraControlComponent.name, (result: WorldQueryData<FreeCameraControlComponent>) => {
      if (result.component.camera.position) {
        this.calculatComponentPosition(dt / 1000, result.component);
      }
    });
  }

  destroy(): void {
    document.removeEventListener('mousemove', this.handleMouseMove.bind(this));
  }

  /**
   * Handle pointer lock change events
   */
  private onPointerLockChange = () => {
    this.isPointerLocked = document.pointerLockElement === TSpark.getInstance().getDrawCanvas();
  };

  /**
   * Handle click events to request pointer lock
   */
  private onClick = () => {
    TSpark.getInstance().getDrawCanvas().requestPointerLock();
  };

  /**
   * Handle mouse move events
   * @param event
   * @returns
   */
  handleMouseMove(event: MouseEvent) {
    if (!this.isPointerLocked) return;
    this.world.query<FreeCameraControlComponent>(FreeCameraControlComponent.name, (result: WorldQueryData<FreeCameraControlComponent>) => {
      if (result.component.camera.rotation) {
        const sensitivity = 0.002;
        result.component.camera.rotation.y -= event.movementX * sensitivity;
        result.component.camera.rotation.x -= event.movementY * sensitivity;
        result.component.camera.rotation.x = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, result.component.camera.rotation.x));
      }
    });
  }

  /**
   * Calculate component movement based on pressed keys
   * @param deltaTimeSeconds
   * @param camera
   */
  calculatComponentPosition(deltaTimeSeconds: number, component: FreeCameraControlComponent) {
    if (!component.camera.position) {
      return;
    }
    let speed = 3 * deltaTimeSeconds;

    let yaw = 1;
    if (component.camera.rotation) {
      yaw = component.camera.rotation.y;
    }
    const forward = new component3D.Position3({
      x: Math.sin(yaw),
      y: 0,
      z: Math.cos(yaw),
    });
    const right = new component3D.Position3({
      x: Math.cos(yaw),
      y: 0,
      z: -Math.sin(yaw),
    });

    if (TSpark.getInstance().isKeyPressed('KeyW') || TSpark.getInstance().isKeyPressed('ArrowUp')) {
      component.camera.position.x -= forward.x * speed;
      component.camera.position.z -= forward.z * speed;
    }
    if (TSpark.getInstance().isKeyPressed('KeyA') || TSpark.getInstance().isKeyPressed('ArrowLeft')) {
      component.camera.position.x -= right.x * speed;
      component.camera.position.z -= right.z * speed;
    }
    if (TSpark.getInstance().isKeyPressed('KeyS') || TSpark.getInstance().isKeyPressed('ArrowDown')) {
      component.camera.position.x += forward.x * speed;
      component.camera.position.z += forward.z * speed;
    }
    if (TSpark.getInstance().isKeyPressed('KeyD') || TSpark.getInstance().isKeyPressed('ArrowRight')) {
      component.camera.position.x += right.x * speed;
      component.camera.position.z += right.z * speed;
    }
    if (TSpark.getInstance().isKeyPressed('Space')) {
      component.camera.position.y += speed;
    }
    if (TSpark.getInstance().isKeyPressed('ShiftLeft')) {
      component.camera.position.y -= speed;
    }
  }
}
