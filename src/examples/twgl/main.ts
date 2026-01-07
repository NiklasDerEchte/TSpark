import { TSpark } from '../../app';
import { twgl } from '../../engine';
import { TwglRenderer } from '../../engine/core/renderer/twgl/renderer';
import { Mesh } from '../../engine/core/types/components3D';


let tspark = new TSpark({
  renderer: new TwglRenderer(),
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
  0.5,
  0.5, // top-right
  -0.5,
  0.5,
  0.5, // top-left
];
planeComponent.geometry.indices = [0, 1, 2, 0, 2, 3];

let planeEntity = scene.createEntity();
scene.getComponentStore<twgl.TwglRenderItem>(twgl.TwglRenderItem.name).add(planeEntity, planeComponent);

export default tspark;