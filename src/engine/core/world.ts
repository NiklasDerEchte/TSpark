import { ComponentStore } from '../ecs/component-store';
import type { Position, Velocity, Transform } from '../types/index';
import type { Camera, Sprite2D, Mesh3D } from '../renderer/backend';

export class World {
  positions = new ComponentStore<Position>();
  velocities = new ComponentStore<Velocity>();
  transforms = new ComponentStore<Transform>();
  sprites2D = new ComponentStore<Sprite2D>();
  meshes3D = new ComponentStore<Mesh3D>();
  cameras = new ComponentStore<Camera>();
}
