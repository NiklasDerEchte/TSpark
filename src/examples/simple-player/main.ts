import { TSpark } from '../../app';
import { component3D, RotationLoop, RotationLoopBox3System, TwglRenderer } from '../../engine';
import { FreeCameraControlComponent, FreeCameraControlSystem } from '../../engine/features/camera/free-camera-control-system';
import { createGameScene } from './game-scene';

let tspark = new TSpark({
  renderer: new TwglRenderer({
    enableCullFace: false,
  }),
  size: { height: 680, width: 1200 },
});

const world = tspark.createWorld('Simulation-World');

// systems
world.registerSystem<FreeCameraControlSystem>({
  system: new FreeCameraControlSystem(),
});

world.registerSystem<RotationLoopBox3System>({
  system: new RotationLoopBox3System(),
});

createGameScene(world);

export default tspark;
