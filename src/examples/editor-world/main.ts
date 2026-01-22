import { TSpark } from '../../app';
import { DefaultRenderer, RotationLoopBox3System } from '../../engine';
import { FreeCameraControlOverlaySystem } from '../../engine/features/camera/free-camera-control-overlay-system';
import { FreeCameraControlSystem } from '../../engine/features/camera/free-camera-control-system';
import { XYZOverlaySystem } from '../../engine/features/movement/xyz-overlay-system';
import { FPSOverlaySystem } from '../twgl/ui/html/fps-overlay-system';
import { EditorScene } from './editor-scene';

let viewSize = 400 * 1;

let tspark = new TSpark({
  renderer: new DefaultRenderer({
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

world.registerSystem<FPSOverlaySystem>({
  system: new FPSOverlaySystem(),
});

world.registerSystem<XYZOverlaySystem>({
  system: new XYZOverlaySystem(),
});

let scene = new EditorScene(world);

export default tspark;
