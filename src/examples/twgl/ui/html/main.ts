import { TSpark } from '../../../../app';
import { component3D, RotationLoopBox3System } from '../../../../engine';
import { TwglRenderer } from '../../../../engine/core/renderer/twgl/renderer';
import { Vector3Defaults } from '../../../../engine/core/types/components3D';
import { OrbitalCameraControlComponent, OrbitalCameraControlSystem } from '../../../../engine/features/camera/orbital-camera-control-system';
import { FPSOverlaySystem } from './fps-overlay-system';

let tspark = new TSpark({
  renderer: new TwglRenderer({
    enableCullFace: false,
  }),
  onStart: () => {
    tspark.getRenderer().resize({ height: 680, width: 1200 });
    setup();
  },
});

const world = tspark.createWorld('main');
const scene = world.createScene('scene1');

scene.registerSystem<RotationLoopBox3System>({
  key: RotationLoopBox3System.name,
  mode: 'normal',
  system: new RotationLoopBox3System(),
});
scene.registerSystem<OrbitalCameraControlSystem>({
  key: OrbitalCameraControlSystem.name,
  mode: 'normal',
  system: new OrbitalCameraControlSystem(),
});
scene.registerSystem<FPSOverlaySystem>({
  key: FPSOverlaySystem.name,
  mode: 'normal',
  system: new FPSOverlaySystem(),
});

let mainCameraEntity = scene.createEntity();
let boxEntity = scene.createEntity();

function setup() {
  let cameraComponent = new component3D.Camera3();
  cameraComponent.target = {
    position: new component3D.Position3(),
    up: Vector3Defaults.Up,
  };
  scene.getComponentStore<component3D.Camera3>(component3D.Camera3.name).add(mainCameraEntity, cameraComponent);
  scene.getComponentStore<component3D.Box3>(component3D.Box3.name).add(boxEntity, new component3D.Box3());
  scene.getComponentStore<OrbitalCameraControlComponent>(OrbitalCameraControlComponent.name).add(boxEntity, {
    cameraEntity: mainCameraEntity
  });
  scene.setActiveCameraEntity(mainCameraEntity);
}

export default tspark;
