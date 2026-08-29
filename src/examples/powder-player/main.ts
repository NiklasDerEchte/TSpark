import { colord } from 'colord';
import { TSpark } from '../../app';
import {
  AnimatorControllerSystem,
  PlayerHudSystem,
  PlayerInputSystem,
  PlayerMotorSystem,
  PlayerRenderLayer,
  PlayerToolSystem,
  PowderRenderLayer,
  PowderSystem,
  TwglRenderer,
} from '../../engine';
import { FPSOverlaySystem } from '../twgl/ui/html/fps-overlay-system';
import { PowderPlayerScene } from './scene';

const viewSize = 600 * 1.6;

const renderer = new TwglRenderer({
  clearColor: colord('#07080c'),
  enableCullFace: false,
  enableDepthTest: false,
});
renderer.addRenderLayer(PowderRenderLayer.name, new PowderRenderLayer());
renderer.addRenderLayer(PlayerRenderLayer.name, new PlayerRenderLayer());

const tspark = new TSpark({
  renderer,
  size: { height: viewSize, width: viewSize * (16 / 9) },
});

const world = tspark.createWorld('Powder-Player');

world.registerSystem({ system: new PowderSystem(), mode: 'fixed' });
world.registerSystem({ system: new PlayerInputSystem(), mode: 'fixed' });
world.registerSystem({ system: new PlayerMotorSystem(), mode: 'fixed' });
world.registerSystem({ system: new PlayerToolSystem(), mode: 'fixed' });
world.registerSystem({ system: new AnimatorControllerSystem() });
world.registerSystem({ system: new PlayerHudSystem() });
world.registerSystem({ system: new FPSOverlaySystem() });

new PowderPlayerScene(world);

export default tspark;
