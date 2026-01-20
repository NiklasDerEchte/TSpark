import { component3D, FreeCameraControlComponent, RotationLoop, World, type Scene } from "../../engine";

export function createGameScene(world: World) {
  let scene = world.createScene('game-scene');
  createFreeCamera(scene);
  createBox(scene);
}

function createFreeCamera(scene: Scene) {
  // camera
  let cameraEntity = scene.createEntity();
  scene.setActiveCameraEntity(cameraEntity);

  let cameraComponent = new component3D.Camera3();
  scene.getComponentStore<FreeCameraControlComponent>(FreeCameraControlComponent.name).add(cameraEntity, {
    camera: cameraComponent,
  });
  scene.getComponentStore<component3D.Camera3>(component3D.Camera3.name).add(cameraEntity, cameraComponent);
}

function createBox(scene: Scene) {
  // box
  let boxEntity = scene.createEntity();
  let boxComponent = new component3D.Box3();
  boxComponent.position = new component3D.Position3();
  scene.getComponentStore<component3D.Box3>(component3D.Box3.name).add(boxEntity, boxComponent);
  scene.getComponentStore<RotationLoop>(RotationLoop.name).add(boxEntity, {rotation: new component3D.Rotation3({x: 1})});
}
