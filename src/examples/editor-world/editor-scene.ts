import { component3D, FreeCameraControlComponent, RotationLoop, World, XYZOverlayComponent, type Scene } from '../../engine';

export class EditorScene {
  private world: World;
  private scene: Scene;
  private cameraComponent?: component3D.Camera3;
  constructor(world: World) {
    this.world = world;
    this.scene = this.world.createScene('editor-scene');
    this.createFreeCamera();
    this.createBox();
    this.createUi();
  }

  createUi() {
    this.scene.getComponentStore<XYZOverlayComponent>(XYZOverlayComponent.name).add(
      this.scene.createEntity(),
      new XYZOverlayComponent({
        label: 'Position',
        xyz: this.cameraComponent?.position
      }),
    );
  }

  createFreeCamera() {
    // camera
    let cameraEntity = this.scene.createEntity();
    this.scene.setActiveCameraEntity(cameraEntity);

    this.cameraComponent = new component3D.Camera3();
    this.scene.getComponentStore<FreeCameraControlComponent>(FreeCameraControlComponent.name).add(cameraEntity, {
      camera: this.cameraComponent,
    });
    this.scene.getComponentStore<component3D.Camera3>(component3D.Camera3.name).add(cameraEntity, this.cameraComponent);
  }

  createBox() {
    // box
    let boxEntity = this.scene.createEntity();
    let boxComponent = new component3D.Box3();
    boxComponent.position = new component3D.Position3();
    this.scene.getComponentStore<component3D.Box3>(component3D.Box3.name).add(boxEntity, boxComponent);
    this.scene.getComponentStore<RotationLoop>(RotationLoop.name).add(boxEntity, { rotation: new component3D.Rotation3({ x: 1 }) });
  }
}