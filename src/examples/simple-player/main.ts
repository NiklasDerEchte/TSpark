import { TSpark } from '../../app';
import { KeyboardControlSystem, TwglRenderer } from '../../engine';

let tspark = new TSpark({
  renderer: new TwglRenderer({
    enableCullFace: false,
  }),
  onStart: () => {
    tspark.getRenderer().resize({ height: 680, width: 1200 });
  },
});

const world = tspark.createWorld('main');
const scene = world.createScene('scene1');

scene.registerSystem<KeyboardControlSystem>({
  key: KeyboardControlSystem.name,
  system: new KeyboardControlSystem(),
});

export default tspark;
