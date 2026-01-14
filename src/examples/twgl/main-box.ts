import { TSpark } from '../../app';
import { component3D, objFileToRenderItem } from '../../engine';
import { TwglRenderer } from '../../engine/core/renderer/twgl/renderer';
import { BaseColor3, Vector3Defaults } from '../../engine/core/types/components3D';

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
let boxEntity = scene.createEntity();
let mainCameraEntity = scene.createEntity();

function setup() {
  let boxComponent = new component3D.Box3();
  // TODO Hier ist ein Problem: Das RenderItem wird asynchron geladen, aber die Zuweisung der Materialeigenschaft erfolgt sofort.
  boxComponent.renderItem.material = new BaseColor3();
  boxComponent.renderItem.material.baseColor = [211, 57, 93, 1];
  
  let cameraComponent = new component3D.Camera3();
  cameraComponent.target = {
    position: new component3D.Position3(),
    up: Vector3Defaults.Up
  };
  scene.getComponentStore<component3D.Box3>(component3D.Box3.name).add(boxEntity, boxComponent);
  scene.getComponentStore<component3D.Camera3>(component3D.Camera3.name).add(mainCameraEntity, cameraComponent);
  scene.setActiveCameraEntity(mainCameraEntity);
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