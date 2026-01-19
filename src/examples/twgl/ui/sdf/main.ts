import { colord } from 'colord';
import { TSpark } from '../../../../app';
import { component2D, component3D, RotationLoopBox3System } from '../../../../engine';
import { TwglRenderer } from '../../../../engine/core/renderer/twgl/renderer';
import { Vector3Defaults } from '../../../../engine/core/types/components3D';
import { Rect2D } from '../../../../engine/core/types/components2D';
import { OrbitalCameraControlComponent, OrbitalCameraControlSystem } from '../../../../engine/features/camera/orbital-camera-control-system';

// TODO Die Renderer für dieses Beispiel funktionieren noch nicht ganz

let tspark = new TSpark({
  renderer: new TwglRenderer({
    enableCullFace: false,
  }),
  onStart: () => {
    setup();
    tspark.getRenderer().resize({ height: 680, width: 1200 });
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

let mainCameraEntity = scene.createEntity();
let uiTextEntity = scene.createEntity();
let boxEntity = scene.createEntity();

function setup() {
  console.log('UI Test');
  let cameraComponent = new component3D.Camera3();
  cameraComponent.target = {
    position: new component3D.Position3(),
    up: Vector3Defaults.Up,
  };
  let uiText = new component2D.UIText2();
  uiText.rect = new Rect2D();
  uiText.rect.position.x = 20;
  uiText.rect.position.y = 20;
  uiText.text = 'Test UI Text';
  uiText.size = 24;
  uiText.color = colord({ r: 153, g: 45, b: 45, a: 1 });
  scene.getComponentStore<component3D.Camera3>(component3D.Camera3.name).add(mainCameraEntity, cameraComponent);
  scene.getComponentStore<component2D.UIText2>(component2D.UIText2.name).add(uiTextEntity, uiText);
  scene.getComponentStore<component3D.Box3>(component3D.Box3.name).add(boxEntity, new component3D.Box3());
  scene.getComponentStore<OrbitalCameraControlComponent>(OrbitalCameraControlComponent.name).add(boxEntity, {
    cameraEntity: mainCameraEntity
  });
  scene.setActiveCameraEntity(mainCameraEntity);
}

export default tspark;
