import { createTransform } from '../../engine/types/utils';
import type { Camera, Mesh3D } from '../../engine/types';
import { TSpark } from '../../app';
import { MuglRenderer } from '../../engine/features/renderer/mugl/renderer';


let tspark = new TSpark({
  renderer: new MuglRenderer(),
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