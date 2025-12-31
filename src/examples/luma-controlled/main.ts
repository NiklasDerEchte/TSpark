import { LumaRenderer } from '../../engine/features/renderer/luma/renderer';
import { createTransform } from '../../engine/types/utils';
import type { Transform3D, Camera } from '../../engine/types';
import { TSpark } from '../../app';

let tspark = new TSpark({
  renderer: new LumaRenderer(),
  onUpdate: () => {},
  onFixedUpdate: () => {},
  onDrawUpdate: () => {},
});

const world = tspark.createWorld('main');
const scene = world.createScene('scene1');

// Kamera
const cam = scene.createEntity();
scene.getComponentStore<Camera>('cameras').add(cam, { id: 'cam', mode: '2d', background: '#4e6063ff' });

// Entity
const player = scene.createEntity();
scene.getComponentStore<Transform3D>('transforms').add(player, createTransform({ position: { x: 50, y: 50 } }));

export default tspark;
