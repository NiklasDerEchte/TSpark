import { Canvas2DRenderer } from '../../engine/core/renderer/canvas2d/renderer';
import { component2D } from '../../engine/types';
import { TSpark } from '../../app';


let tspark = new TSpark({
  renderer: new Canvas2DRenderer(),
  onUpdate: () => {},
  onFixedUpdate: () => {},
  onDrawUpdate: () => {},
});

const world = tspark.createWorld("main");
const scene = world.createScene("scene1");

// Kamera
const cam = scene.createEntity();
scene.getComponentStore<component2D.Camera>('camera2d').add(cam, { id: 'cam', background: '#101010' });;

//scene.registerComponent({component: new component2D.Transform()});
component2D.Vector.toString();

// Entity
const player = scene.createEntity();
scene.getComponentStore<component2D.Transform>('transform2d').add(player, {position: { x: 50, y: 50 }});
scene.getComponentStore<component2D.Sprite>('sprite2d').add(player, { id: 'sprite_1', color: 'tomato', width: 32, height: 32 });
scene.getComponentStore<component2D.Velocity>('velocity2d').add(player, { x: 1, y: 0 });

export default tspark;