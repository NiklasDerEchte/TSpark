import { GameLoop } from './engine/core/game-loop';
import { World } from './engine/core/world';
import { MovementSystem } from './engine/core/movement-system';
import { createEntity } from './engine/ecs/entity';
import { RenderSystem } from './engine/core/render-system';
import { Canvas2DRenderer } from './engine/renderer/canvas2d/renderer';
import { createTransform } from './engine/types/utils';
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
  world.cameras.add(cam, { mode: '2d', background: '#101010' });

  // Entity
  const player = createEntity();
  world.transforms.add(player, createTransform({ position: { x: 50, y: 50 }}));
  world.sprites2D.add(player, { color: 'tomato', width: 32, height: 32 });
  world.velocities.add(player, { x: 40, y: 0 });

  function update(deltaTime: number) {
    renderer.exec(deltaTime);
  }

  function fixedUpdate(deltaTime: number) {
    movement.exec(deltaTime);
  }

  loop.start(update, fixedUpdate);
});