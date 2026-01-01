import { createTransform } from '../../engine/types/utils';
import type { Camera, Mesh3D, Triangle2D } from '../../engine/types';
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
scene.getComponentStore<Triangle2D>('triangles2D').add(mesh, { //TODO sind diese namen für die component stores wirklich nötig?
  id: 'mesh',
  position: {x: 0, y: 0}
});
// TODO wie könnte ich mehrere components des gleichen typen auf ein entity setzten? eventuell ist das aber nicht für alle erlaubt
export default tspark;