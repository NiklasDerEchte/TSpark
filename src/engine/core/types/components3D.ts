import type { Component, SceneObject } from './type';

type VectorStructure = { x: number; y: number; z: number };

export class Vector implements Component<VectorStructure> {
  x: number = 0;
  y: number = 0;
  z: number = 0;
}
export class Position implements Component<VectorStructure> {
  x: number = 0;
  y: number = 0;
  z: number = 0;
}
export class Rotation implements Component<VectorStructure> {
  x: number = 0;
  y: number = 0;
  z: number = 0;
}
export class Scale implements Component<VectorStructure> {
  x: number = 0;
  y: number = 0;
  z: number = 0;
}
export class Transform implements Component<{ position: Position; rotation?: Rotation; scale?: Scale }> {
  position: Position = new Position();
  rotation?: Rotation | undefined;
  scale?: Scale | undefined;
}

export class Velocity implements Component<VectorStructure> {
  x: number = 0;
  y: number = 0;
  z: number = 0;
}

export class Material implements Component<{ baseColor?: string | [number, number, number, number] }> {
  baseColor?: string | [number, number, number, number] | undefined;
}

export class Camera implements Component<SceneObject & { 
  background?: string; 
  position?: Position; 
  rotation?: Rotation; 
  fov?: number;  // Field of View
  near?: number; // Near-Plane
  far?: number;  // Far-Plane
}> {
  id: string = '';
  background?: string | undefined;
  position: Position = new Position();
  rotation: Rotation = new Rotation();
  fov: number = 45;
  near: number = 0.1;
  far: number = 100;
}

export class Geometry
  implements
    Component<{
      vertices: Float32Array | number[];
      indices?: Uint16Array | Uint32Array | number[];
      vertexCount?: number; //TODO in twgl nicht benötigt
      texture?: HTMLImageElement;
      uvs?: Float32Array | number[] | undefined;
    }>
{
  vertices: number[] | Float32Array<ArrayBufferLike> = []; // array of x,y,z,x1,y1,z1..
  indices?: number[] | Uint16Array<ArrayBufferLike> | Uint32Array<ArrayBufferLike> | undefined;
  vertexCount: number = 0;
  texture?: HTMLImageElement | undefined; // new Image()
  uvs?: Float32Array | number[] | undefined = undefined; // array of r,g,b,a,r1,g1,b1,a1..
}

export class Mesh
  implements
    Component<
      SceneObject & {
        geometry: Geometry;
        visible?: boolean;
      }
    >
{
  id: string = '';
  geometry: Geometry = {
    vertices: [
      -0.5,
      0.0,
      -0.5, // bottom-left
      0.5,
      0.0,
      -0.5, // bottom-right
      0.5,
      0.5,
      0.5, // top-right
      -0.5,
      0.5,
      0.5, // top-left
    ],
    indices: [0, 1, 2, 0, 2, 3],
    vertexCount: 4,
  };
  visible?: boolean | undefined = true;
}

export class Box implements Component<Transform> {
  position: Position = new Position();
  rotation?: Rotation | undefined;
  scale?: Scale | undefined;
}

export class Sphere implements Component<Transform> {
  position: Position = new Position();
  rotation?: Rotation | undefined;
  scale?: Scale | undefined;
}

export class Cylinder implements Component<Transform> {
  position: Position = new Position();
  rotation?: Rotation | undefined;
  scale?: Scale | undefined;
}

export class Cone implements Component<Transform> {
  position: Position = new Position();
  rotation?: Rotation | undefined;
  scale?: Scale | undefined;
}

export class Capsule implements Component<Transform> {
  position: Position = new Position();
  rotation?: Rotation | undefined;
  scale?: Scale | undefined;
}
