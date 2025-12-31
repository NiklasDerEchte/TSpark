import { LumaRenderer } from '../../engine/features/renderer/luma/renderer';
import { createTransform } from '../../engine/types/utils';
import type { Camera, Mesh3D } from '../../engine/types';
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
const mesh = scene.createEntity();
scene.getComponentStore<Mesh3D>('transforms').add(mesh, {
  id: 'mesh',
  geometry: {vertexCount: 3, vertices: []}
});

export default tspark;
