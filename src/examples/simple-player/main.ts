import { TSpark } from '../../app';
import { component3D, TwglRenderer } from '../../engine';
import { CharacterControlComponent, CharacterControlSystem } from './character-control-system';

let tspark = new TSpark({
  renderer: new TwglRenderer({
    enableCullFace: false,
  }),
  size: { height: 680, width: 1200 },
});

const world = tspark.createWorld('main');
const scene = world.createScene('scene1');

// camera
let mainCameraEntity = scene.createEntity();
let cameraComponent = new component3D.Camera3();
scene.getComponentStore<component3D.Camera3>(component3D.Camera3.name).add(mainCameraEntity, cameraComponent);
scene.getComponentStore<CharacterControlComponent>(CharacterControlComponent.name).add(mainCameraEntity);
scene.setActiveCameraEntity(mainCameraEntity);

// box
let boxEntity = scene.createEntity();
let boxComponent = new component3D.Box3();
boxComponent.position = new component3D.Position3();
scene.getComponentStore<component3D.Box3>(component3D.Box3.name).add(boxEntity, boxComponent);

// systems
scene.registerSystem<CharacterControlSystem>({
  system: new CharacterControlSystem(),
});

export default tspark;
