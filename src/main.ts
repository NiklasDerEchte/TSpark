import { GameLoop } from './engine/core/game-loop';
import { World } from './engine/core/world';
import { MovementSystem } from './engine/core/movement-system';
import { createEntity } from './engine/ecs/entity';

const world = new World();
const movement = new MovementSystem(world);
const loop = new GameLoop();

// Entity erstellen
const player = createEntity();

world.positions.add(player, { x: 0, y: 0 });
world.velocities.add(player, { x: 1, y: 0 });

function update(deltaTime: number) {}

let fixedCalls = 0;
let lastLogTime = performance.now();
function fixedUpdate(deltaTime: number) {
  movement.update(deltaTime);

  fixedCalls++;
  const now = performance.now();
  if (now - lastLogTime >= 1000) {
    console.log(`fixedUpdate/s: ${fixedCalls}`);
    fixedCalls = 0;
    lastLogTime = now;
  }
}

loop.start(update, fixedUpdate);