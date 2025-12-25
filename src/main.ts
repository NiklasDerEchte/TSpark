import { GameLoop } from './engine/core/game-loop';
import { World } from './engine/core/world';
import { MovementSystem } from './engine/features/movement/movement-system';
import { createEntity } from './engine/ecs/entity';
import { RenderSystem } from './engine/features/renderer/render-system';
import { Canvas2DRenderer } from './engine/features/renderer/canvas2d/renderer';
import { createTransform } from './engine/types/utils';
import type { Transform, Velocity, Camera, Sprite2D } from './engine/types';
// Alternative:
// import { WebGLRenderer } from './engine/renderer/webgl/renderer';
// import { WebGPURenderer } from './engine/renderer/webgpu/renderer';

const canvas = document.createElement('canvas');
document.body.appendChild(canvas);

const world = new World();
const movement = new MovementSystem(world);
const loop = new GameLoop();

const backend = new Canvas2DRenderer(); // oder new WebGLRenderer(), new WebGPURenderer()
backend.init(canvas).then(() => {
  backend.resize(800, 600);
  const renderer = new RenderSystem(world, backend);

  // Kamera
  const cam = createEntity();
  world.sceneManager.getComponentStore<Camera>('cameras').add(cam, { mode: '2d', background: '#101010' });

  // Entity
  const player = createEntity();
  world.sceneManager.getComponentStore<Transform>('transforms').add(player, createTransform({ position: { x: 50, y: 50 } }));
  world.sceneManager.getComponentStore<Sprite2D>('sprites2D').add(player, { color: 'tomato', width: 32, height: 32 });
  world.sceneManager.getComponentStore<Velocity>('velocities').add(player, { x: 1, y: 0 });

  function update(deltaTime: number) {
    renderer.exec(deltaTime);
  }

  function fixedUpdate(deltaTime: number) {
    movement.exec(deltaTime);
  }

  loop.start(update, fixedUpdate);
});