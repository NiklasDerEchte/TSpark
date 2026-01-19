import { Canvas2DRenderer } from '../../engine/core/renderer/canvas2d/renderer';
import { TSpark } from '../../app';

let tspark = new TSpark({
  renderer: new Canvas2DRenderer(),
});

const world = tspark.createWorld('main');
const scene = world.createScene('scene1');

// TODO ...

export default tspark;
