import { ComponentStore } from '../ecs/component-store';
import type { Position, Velocity } from '../types';

export class World {
  positions = new ComponentStore<Position>();
  velocities = new ComponentStore<Velocity>();
}
