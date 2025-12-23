import type { Vector, Position, Rotation, Scale, Transform } from './type';

export function createTransform(transformInput: Transform): Transform {
  return {
    position: transformInput.position,
    rotation: {
      x: transformInput.rotation?.x ?? 0,
      y: transformInput.rotation?.y ?? 0,
      z: transformInput.rotation?.z ?? 0,
    },
    scale: {
      x: transformInput.scale?.x ?? 1,
      y: transformInput.scale?.y ?? 1,
      z: transformInput.scale?.z ?? 1,
    },
  };
}
