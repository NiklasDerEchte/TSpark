import type { Component, SceneObject } from './type';

type VectorStructure = { x: number; y: number; z: number };

export class Vector3 implements Component<VectorStructure> {
  x: number = 0;
  y: number = 0;
  z: number = 0;
}

export class Position3 implements Component<VectorStructure> {
  x: number = 0;
  y: number = 0;
  z: number = 0;

  toArray(): number[] {
    return [this.x, this.y, this.z];
  }
}

export class Rotation3 implements Component<VectorStructure> {
  x: number = 0;
  y: number = 0;
  z: number = 0;
}

export class Scale3 implements Component<VectorStructure> {
  x: number = 0;
  y: number = 0;
  z: number = 0;
}

export class Transform3 implements Component<{ position: Position3; rotation?: Rotation3; scale?: Scale3 }> {
  position: Position3 = new Position3();
  rotation?: Rotation3 | undefined;
  scale?: Scale3 | undefined;
}

export class Velocity3 implements Component<VectorStructure> {
  x: number = 0;
  y: number = 0;
  z: number = 0;
}

export class Camera3
  implements
    Component<
      SceneObject & {
        background?: string;
        position: Position3;
        target: Position3;
        up: Position3;
        rotation?: Rotation3;
        fov?: number; // Field of View
        near?: number; // Near-Plane
        far?: number; // Far-Plane
      }
    >
{
  id: string = '';
  background?: string | undefined;
  position: Position3 = new Position3();
  up: Position3 = new Position3();
  target: Position3 = new Position3();
  rotation: Rotation3 = new Rotation3();
  fov: number = 45;
  near: number = 0.1;
  far: number = 100;

  constructor() {
    this.up.y = 1;
  }
}

// export class Box implements Component<Transform3> {
//   position: Position3 = new Position3();
//   rotation?: Rotation3 | undefined;
//   scale?: Scale3 | undefined;
// }

// export class Sphere implements Component<Transform3> {
//   position: Position3 = new Position3();
//   rotation?: Rotation3 | undefined;
//   scale?: Scale3 | undefined;
// }

// export class Cylinder implements Component<Transform3> {
//   position: Position3 = new Position3();
//   rotation?: Rotation3 | undefined;
//   scale?: Scale3 | undefined;
// }

// export class Cone implements Component<Transform3> {
//   position: Position3 = new Position3();
//   rotation?: Rotation3 | undefined;
//   scale?: Scale3 | undefined;
// }

// export class Capsule implements Component<Transform3> {
//   position: Position3 = new Position3();
//   rotation?: Rotation3 | undefined;
//   scale?: Scale3 | undefined;
// }

export class Material3
  implements
    Component<{
      texture: HTMLImageElement;
      uvs: Float32Array | number[] | undefined;
    }>
{
  texture: HTMLImageElement = new Image();
  uvs: Float32Array | number[] = []; // array of texture 2d positions x1,y1,x2,y2..
}

export class BaseColor3
  implements
    Component<{
      baseColor: string | [number, number, number, number];
    }>
{
  baseColor: string | [number, number, number, number] = [255, 255, 255, 255];
}

export class Geometry3
  implements
    Component<{
      vertices: Float32Array | number[];
      indices: Uint16Array | Uint32Array | number[];
    }>
{
  vertices: number[] | Float32Array<ArrayBufferLike> = []; // array of x,y,z,x1,y1,z1..
  indices: number[] | Uint16Array<ArrayBufferLike> | Uint32Array<ArrayBufferLike> = []; // array of triangle segmentations 0,1,2,0,2,3..
}

export class RenderItem3
  implements
    Component<{
      geometry: Geometry3;
      material: BaseColor3 | Material3;
      visible: boolean;
    }>
{
  geometry: Geometry3 = new Geometry3();
  material: BaseColor3 | Material3 = new BaseColor3();
  visible: boolean = true;
}
