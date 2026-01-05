import { TSpark } from '../../app';
import { component2D, component3D } from '../../engine';
import { MuglRenderer } from '../../engine/core/renderer/mugl/renderer';
import { Mesh } from '../../engine/core/types/components3D';


let tspark = new TSpark({
  renderer: new MuglRenderer(),
  onUpdate: () => {},
  onFixedUpdate: () => {},
  onDrawUpdate: () => {},
});

const world = tspark.createWorld("main");
const scene = world.createScene("scene1");

//let triangle = scene.createEntity();
//scene.getComponentStore<component2D.Triangle>('triangle2d').add(triangle, {id: 'triangle_1', position: {x: 0, y: 0}});

let mesh = scene.createEntity();
scene.getComponentStore<component3D.Mesh>('mesh3d').add(mesh, new Mesh())

export default tspark;