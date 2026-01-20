import { TSpark } from '../../app';
import { component3D, TwglRenderer } from '../../engine';
import { FreeCameraControlComponent, FreeCameraControlSystem } from '../../engine/features/camera/free-camera-control-system';

let tspark = new TSpark({
  renderer: new TwglRenderer({
    enableCullFace: false,
  }),
  size: { height: 680, width: 1200 },
});

const world = tspark.createWorld('main');


// systems
scene.registerSystem<FreeCameraControlSystem>({
  system: new FreeCameraControlSystem(),
});



export default tspark;
