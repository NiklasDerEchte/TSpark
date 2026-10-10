import { colord } from 'colord';
import { TSpark } from '../../app';
import {
  PowderHudSystem,
  PowderInputSystem,
  PowderRenderLayer,
  PowderSystem,
  TwglRenderer,
} from '../../engine';
import { FPSOverlaySystem } from '../twgl/ui/html/fps-overlay-system';
import { PowderSimulationScene, TerrainResetSystem } from './simulation';

const viewSize = 600 * 1.6;

const renderer = new TwglRenderer({
  clearColor: colord('#07080c'),
  enableCullFace: false,
  enableDepthTest: false,
});
renderer.addRenderLayer(PowderRenderLayer.name, new PowderRenderLayer());

const tspark = new TSpark({
  renderer,
  size: { height: viewSize, width: viewSize * (16 / 9) },
});

const world = tspark.createWorld('Powder-Simulation');

world.registerSystem({
  system: new PowderSystem(),
  mode: 'fixed',
});

world.registerSystem({
  system: new PowderInputSystem(),
});

world.registerSystem({
  system: new TerrainResetSystem(),
});

world.registerSystem({
  system: new PowderHudSystem(),
});

world.registerSystem({
  system: new FPSOverlaySystem(),
});

new PowderSimulationScene(world);

export default tspark;
