import { colord } from 'colord';
import { TSpark } from '../../app';
import { component2D, component3D, RotationLoop, RotationLoopBox3System } from '../../engine';
import { TwglRenderer } from '../../engine/core/renderer/twgl/renderer';
import { Vector3Defaults } from '../../engine/core/types/components3D';
import { Rect2D } from '../../engine/core/types/components2D';

let tspark = new TSpark({
  renderer: new TwglRenderer({
    enableCullFace: false,
  }),
  onStart: () => {
    setup();
    tspark.getRenderer().resize({ height: 680, width: 1200 });
  },
  onUpdate: () => {
    update();
  },
  onFixedUpdate: () => {},
  onDrawUpdate: () => {},
});

const world = tspark.createWorld('main');
const scene = world.createScene('scene1');
scene.registerSystem<RotationLoopBox3System>({
  key: RotationLoopBox3System.name,
  mode: 'normal',
  system: new RotationLoopBox3System(),
});
let mainCameraEntity = scene.createEntity();
let uiTextEntity = scene.createEntity();
let cubeCounter = 0;

function setup() {
  console.log("Stress Test");
  let cameraComponent = new component3D.Camera3();
  cameraComponent.target = {
    position: new component3D.Position3(),
    up: Vector3Defaults.Up
  };
  let uiText = new component2D.UIText2();
  uiText.rect = new Rect2D()
  uiText.rect.position.x =20;
  uiText.rect.position.y = 20;
  uiText.text = "Stress Test: Cubes are spawning every second!";
  uiText.size = 24;
  uiText.color = colord({ r: 255, g: 255, b: 210 });
  scene.getComponentStore<component3D.Camera3>(component3D.Camera3.name).add(mainCameraEntity, cameraComponent);
  scene.getComponentStore<component2D.UIText2>(component2D.UIText2.name).add(uiTextEntity, uiText);
  scene.setActiveCameraEntity(mainCameraEntity);
  setInterval(spawnCube, 1000);
}

function spawnCube() {
  let entity = scene.createEntity();
  let box = new component3D.Box3();
  let position = new component3D.Position3();
  position.x = (Math.random() - 0.5) * 100;
  position.y = (Math.random() - 0.5) * 60;
  position.z = (Math.random() - 0.5) * 100;
  box.position = position;
  scene.getComponentStore<component3D.Box3>(component3D.Box3.name).add(entity, box);
  scene.getComponentStore<RotationLoop>(RotationLoop.name).add(entity, {
    rotation: new component3D.Rotation3({z: 1, y: 1})
  });
  console.log(`Spawned cube #${++cubeCounter} fps: ${Math.round(tspark.getFPS())}`);
}

function update() {
  // Camera Rotation
  let camera = scene.getComponentStore<component3D.Camera3>(component3D.Camera3.name).get(mainCameraEntity) as component3D.Camera3 | undefined;
  if(camera) {
    const time = performance.now() * 0.001; // Zeit in Sekunden
    const cameraRadius = 5;
    const cameraX = Math.sin(time) * cameraRadius;
    const cameraZ = Math.cos(time) * cameraRadius;
    
    let position = new component3D.Position3();
    position.x = cameraX;
    position.y = Math.sin(time) * Math.PI;
    position.z = cameraZ;
    camera.position = position;
  }
}

export default tspark;