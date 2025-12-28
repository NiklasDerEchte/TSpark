import { Canvas2DRenderer } from './engine/features/renderer/canvas2d/renderer';
import { createTransform } from './engine/types/utils';
import type { Transform, Velocity, Camera, Sprite2D } from './engine/types';
import { TSpark } from './app';
import { MovementSystem } from './engine/features/movement/movement-system';


let tspark = new TSpark({
  backendRenderer: new Canvas2DRenderer(),
  onUpdate: () => {},
  onFixedUpdate: () => {},
  onDrawUpdate: () => {},
});

const world = tspark.createWorld("main");
const scene = world.createScene("scene1");

//scene.registerSystem<MovementSystem>('movementSystem', new MovementSystem(), 'fixed');

// Kamera
const cam = scene.createEntity();
scene.getComponentStore<Camera>('cameras').add(cam, { mode: '2d', background: '#101010' });;

// Entity
const player = scene.createEntity();
scene.getComponentStore<Transform>('transforms').add(player, createTransform({ position: { x: 50, y: 50 } }));
scene.getComponentStore<Sprite2D>('sprites2D').add(player, { color: 'tomato', width: 32, height: 32 });
scene.getComponentStore<Velocity>('velocities').add(player, { x: 1, y: 0 });

tspark.start();