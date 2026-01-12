import { TSpark } from '../../app';
import { component3D } from '../../engine';
import { TwglRenderer } from '../../engine/core/renderer/twgl/renderer';
import { Vector3Defaults } from '../../engine/core/types/components3D';

let tspark = new TSpark({
  renderer: new TwglRenderer(),
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
let planeEntity = scene.createEntity();
let mainCamera = scene.createEntity();

function setup() {
  let planeComponent = new component3D.RenderItem3();
  planeComponent.geometry.vertices = [
    -0.5,
    0.0,
    -0.5, // bottom-left
    0.5,
    0.0,
    -0.5, // bottom-right
    0.5,
    0.0,
    0.5, // top-right
    -0.5,
    0.0,
    0.5, // top-left
  ];
  planeComponent.geometry.indices = [0, 1, 2, 0, 2, 3];
  planeComponent.material = new component3D.BaseColor3();
  planeComponent.material.baseColor = [120, 120, 160, 255];

  let cameraComponent = new component3D.Camera3();
  cameraComponent.target = {
    position: new component3D.Position3(),
    up: Vector3Defaults.Up
  };

  scene.getComponentStore<component3D.RenderItem3>(component3D.RenderItem3.name).add(planeEntity, planeComponent);
  scene.getComponentStore<component3D.Camera3>(component3D.Camera3.name).add(mainCamera, cameraComponent);
  scene.setActiveCameraEntity(mainCamera);
}

function update() {
  // Camera Rotation
  let camera = scene.getComponentStore<component3D.Camera3>(component3D.Camera3.name).get(scene.getActiveCameraEntity() ?? '') as component3D.Camera3 | undefined;
  if(camera) {
    const time = performance.now() * 0.001; // Zeit in Sekunden
    const cameraRadius = 5;
    const cameraX = Math.sin(time) * cameraRadius;
    const cameraZ = Math.cos(time) * cameraRadius;
    
    let position = new component3D.Position3();
    position.x = cameraX;
    position.y = Math.PI;
    position.z = cameraZ;
    camera.position = position;
  }
}

export default tspark;