import { TSpark } from '../../app';
import { twgl } from '../../engine';
import { TwglRenderer } from '../../engine/core/renderer/twgl/renderer';
import { Mesh } from '../../engine/core/types/components3D';


let tspark = new TSpark({
  renderer: new TwglRenderer(),
  onStart: () => {
    tspark.getRenderer().resize({ height: 680, width: 1200 });
  },
  onUpdate: () => {},
  onFixedUpdate: () => {},
  onDrawUpdate: () => {},
});

const world = tspark.createWorld("main");
const scene = world.createScene("scene1");

let planeComponent = new twgl.TwglRenderItem();
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
planeComponent.material = new twgl.TwglBaseColor();
planeComponent.material.baseColor = [120, 120, 160, 255];

let planeEntity = scene.createEntity();
scene.getComponentStore<twgl.TwglRenderItem>(twgl.TwglRenderItem.name).add(planeEntity, planeComponent);

export default tspark;