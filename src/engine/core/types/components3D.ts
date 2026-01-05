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

export class Camera implements Component<SceneObject & { background?: string }> {
  id: string = "";
  background?: string | undefined;
}

export class Geometry
  implements
    Component<{
      vertices: Float32Array | number[];
      indices?: Uint16Array | Uint32Array | number[];
      uvs?: Float32Array | number[];
      vertexCount: number;
    }>
{
  vertices: number[] | Float32Array<ArrayBufferLike> = [];
  indices?: number[] | Uint16Array<ArrayBufferLike> | Uint32Array<ArrayBufferLike> | undefined;
  uvs?: number[] | Float32Array<ArrayBufferLike> | undefined;
  vertexCount: number = 0;
}

export class Mesh
  implements
    Component<
      SceneObject & {
        geometry: Geometry;
        material?: Material;
        visible?: boolean;
      }
    >
{
  id: string = "";
  geometry: Geometry = new Geometry();
  material?: Material | undefined;
  visible?: boolean | undefined;
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