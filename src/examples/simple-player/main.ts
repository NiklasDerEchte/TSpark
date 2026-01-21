import { TSpark } from '../../app';
import { RotationLoopBox3System, TwglRenderer } from '../../engine';
import { FreeCameraControlOverlaySystem } from '../../engine/features/camera/free-camera-control-overlay-system';
import { FreeCameraControlSystem } from '../../engine/features/camera/free-camera-control-system';
import { XYZOverlaySystem } from '../../engine/features/movement/xyz-overlay-system';
import { GameScene } from './game-scene';

let viewSize = 400 * 1.5;

let tspark = new TSpark({
  renderer: new TwglRenderer({
    enableCullFace: false,
  }),
  size: { height: viewSize, width: viewSize * (16 / 9) },
});

const world = tspark.createWorld('Simulation-World');

// systems
world.registerSystem<FreeCameraControlSystem>({
  system: new FreeCameraControlSystem(),
});

world.registerSystem<RotationLoopBox3System>({
  system: new RotationLoopBox3System(),
});

world.registerSystem<FreeCameraControlOverlaySystem>({
  system: new FreeCameraControlOverlaySystem(),
});

world.registerSystem<XYZOverlaySystem>({
  system: new XYZOverlaySystem(),
});

let gameScene = new GameScene(world);

export default tspark;
