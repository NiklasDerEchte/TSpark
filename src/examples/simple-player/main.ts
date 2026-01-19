import { TSpark } from '../../app';
import { component3D } from '../../engine';
import { CharacterControlComponent } from './character-control-system';
import { KeyboardControlSystem } from './keyboard-control-system';

let tspark = new TSpark({ size: { height: 680, width: 1200 } });

const world = tspark.createWorld('main');
const scene = world.createScene('scene1');

let boxEntity = scene.createEntity();
scene.getComponentStore<component3D.Box3>(component3D.Box3.name).add(boxEntity, new component3D.Box3());

let mainCameraEntity = scene.createEntity();
scene.getComponentStore<CharacterControlComponent>(CharacterControlComponent.name).add(mainCameraEntity, {});
scene.setActiveCameraEntity(mainCameraEntity);


scene.registerSystem<KeyboardControlSystem>({
  system: new KeyboardControlSystem(),
});

export default tspark;
