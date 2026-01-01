import { TSpark } from '../../app';
import { MuglRenderer } from '../../engine/features/renderer/mugl/renderer';


let tspark = new TSpark({
  renderer: new MuglRenderer(),
  onUpdate: () => {},
  onFixedUpdate: () => {},
  onDrawUpdate: () => {},
});

const world = tspark.createWorld("main");
const scene = world.createScene("scene1");

export default tspark;