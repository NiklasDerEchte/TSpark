import { TSpark } from '../../app';
import { component2D } from '../../engine';
import { MuglRenderer } from '../../engine/core/renderer/mugl/renderer';


let tspark = new TSpark({
  renderer: new MuglRenderer(),
  onUpdate: () => {},
  onFixedUpdate: () => {},
  onDrawUpdate: () => {},
});

const world = tspark.createWorld("main");
const scene = world.createScene("scene1");

let triangle = scene.createEntity();
scene.getComponentStore<component2D.Triangle>('triangle2d').add(triangle, {id: 'triangle_1', position: {x: 0, y: 0}});

export default tspark;