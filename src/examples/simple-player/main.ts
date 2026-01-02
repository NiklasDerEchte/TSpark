import { Canvas2DRenderer } from '../../engine/features/renderer/canvas2d/renderer';
import { component2D } from '../../engine/types';
import { TSpark } from '../../app';

let tspark = new TSpark({
  renderer: new Canvas2DRenderer(),
  onUpdate: () => {},
  onFixedUpdate: () => {},
  onDrawUpdate: () => {},
});

const world = tspark.createWorld('main');
const scene = world.createScene('scene1');

// Kamera
const cam = scene.createEntity();
//scene.getComponentStore<Camera>().add(cam, { id: 'cam', mode: '2d', background: '#101010' });;

scene.registerComponent({ component: new component2D.Transform() });

// Entity
const player = scene.createEntity();
scene.getComponentStore<component2D.Transform>(component2D.Transform.name).add(player, { position: { x: 50, y: 50 } });
scene.getComponentStore<component2D.Sprite>(component2D.Sprite.name).add(player, { id: 'sprite_1', color: 'tomato', width: 32, height: 32 });
scene.getComponentStore<component2D.Velocity>(component2D.Velocity.name).add(player, { x: 1, y: 0 });

export default tspark;
