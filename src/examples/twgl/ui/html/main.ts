import { colord } from 'colord';
import { TSpark } from '../../../../app';
import { component2D, component3D, RotationLoopBox3System } from '../../../../engine';
import { TwglRenderer } from '../../../../engine/core/renderer/twgl/renderer';
import { Vector3Defaults } from '../../../../engine/core/types/components3D';
import { Rect2D } from '../../../../engine/core/types/components2D';
import { OrbitalCameraControlComponent, OrbitalCameraControlSystem } from '../../../../engine/features/camera/OrbitalCameraControlSystem';
import { FPSOverlay } from './fps-overlay';

let fpsOverlay = new FPSOverlay();

let tspark = new TSpark({
  renderer: new TwglRenderer({
    enableCullFace: false,
  }),
  onAsyncStart: async () => {
    await fpsOverlay.init();
  },
  onStart: () => {
    tspark.getRenderer().resize({ height: 680, width: 1200 });
    fpsOverlay.start();
    setup();
  },
  onUpdate: () => {
    fpsOverlay.update();
  }
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
