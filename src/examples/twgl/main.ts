import { TSpark } from '../../app';
import { component3D } from '../../engine';
import { TwglRenderer } from '../../engine/core/renderer/twgl/renderer';

let tspark = new TSpark({
  renderer: new TwglRenderer(),
  onStart: () => {
    setup();
    tspark.getRenderer().resize({ height: 680, width: 1200 });
  },
  onUpdate: () => {},
  onFixedUpdate: () => {},
  onDrawUpdate: () => {},
});


function setup() {
  const world = tspark.createWorld('main');
  const scene = world.createScene('scene1');

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

  let planeEntity = scene.createEntity();
  scene.getComponentStore<component3D.RenderItem3>(component3D.RenderItem3.name).add(planeEntity, planeComponent);

  let mainCamera = scene.createEntity();
  scene.getComponentStore<component3D.Camera3>(component3D.Camera3.name).add(mainCamera, new component3D.Camera3());

  scene.setActiveCameraEntity(mainCamera);
}

export default tspark;