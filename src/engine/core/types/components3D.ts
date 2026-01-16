import { colord, type Colord } from 'colord';
import type { Component, Properties, SceneObject } from './type';
import { assignProps, objFileToRenderItem } from './utils';

type VectorStructure = { x: number; y: number; z: number };

export class Vector3 implements Component<VectorStructure> {
  x: number = 0;
  y: number = 0;
  z: number = 0;

  constructor(x?: number, y?: number, z?: number) {
    this.x = x ?? 0;
    this.y = y ?? 0;
    this.z = z ?? 0;
  }

  toArray(): number[] {
    return [this.x, this.y, this.z];
  }
}

export class Position3 implements Component<VectorStructure> {
  x: number = 0;
  y: number = 0;
  z: number = 0;

  constructor(x?: number, y?: number, z?: number) {
    this.x = x ?? 0;
    this.y = y ?? 0;
    this.z = z ?? 0;
  }

  toArray(): number[] {
    return [this.x, this.y, this.z];
  }
}

export class Rotation3 implements Component<VectorStructure> {
  x: number = 0;
  y: number = 0;
  z: number = 0;

  constructor(x?: number, y?: number, z?: number) {
    this.x = x ?? 0;
    this.y = y ?? 0;
    this.z = z ?? 0;
  }

  toArray(): number[] {
    return [this.x, this.y, this.z];
  }
}

export class Scale3 implements Component<VectorStructure> {
  x: number = 0;
  y: number = 0;
  z: number = 0;

  constructor(x?: number, y?: number, z?: number) {
    this.x = x ?? 0;
    this.y = y ?? 0;
    this.z = z ?? 0;
  }

  toArray(): number[] {
    return [this.x, this.y, this.z];
  }
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

export const Vector3Defaults = {
  Zero: new Position3(0, 0, 0),
  Left: new Position3(-1, 0, 0),
  Right: new Position3(1, 0, 0),
  Up: new Position3(0, 1, 0),
  Down: new Position3(0, -1, 0),
  Front: new Position3(0, 0, 1),
  Back: new Position3(0, 0, -1),
  BlenderUp: new Position3(0, -1, 0),
  BlenderDown: new Position3(0, 1, 0),
} as const;

export class Camera3
  implements
    Component<
      SceneObject & {
        background?: string;
        position: Position3;
        rotation?: Rotation3;
        target?: { position: Position3; up: Position3 }; // target disables rotation
        fov?: number; // Field of View
        near?: number; // Near-Plane
        far?: number; // Far-Plane
      }
    >
{
  id: string = '';
  background?: string | undefined;
  position: Position3 = new Position3();
  target: { position: Position3; up: Position3 } | undefined = undefined;
  rotation: Rotation3 = new Rotation3();
  fov: number = 45;
  near: number = 0.1;
  far: number = 100;
}

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
      color: Colord;
      specularColor: Colord;
      shininess: Colord;
      ambient: Colord;
      diffuseMap: Colord;
      texture: HTMLImageElement;
      uvs: Float32Array | number[];
    }>
{
  color: Colord = colord('');
  specularColor: Colord = colord('');
  shininess: Colord = colord('');
  ambient: Colord = colord('');
  diffuseMap: Colord = colord('');
  texture: HTMLImageElement = new Image();
  uvs: Float32Array | number[] = []; // array of texture 2d positions x1,y1,x2,y2..
}

export class BaseColor3
  implements
    Component<{
      baseColor: Colord;
    }>
{
  baseColor: Colord = colord('');
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
      isDirty: boolean;
    }>
{
  geometry: Geometry3 = new Geometry3();
  material: BaseColor3 | Material3 = new BaseColor3();
  visible: boolean = true;
  isDirty: boolean = false;
}

export class Box3 implements Component<Transform3 & { renderItem: RenderItem3 }> {
  renderItem: RenderItem3 = new RenderItem3();
  position: Position3 = new Position3();
  rotation?: Rotation3 | undefined;
  scale?: Scale3 | undefined;

  constructor(onReady: () => void = () => {}, props?: Properties<Box3>) {
    objFileToRenderItem('cube/cube.obj').then((renderItem: RenderItem3) => {
      this.renderItem = renderItem;
      this.renderItem.isDirty = true;
      assignProps(this, props);
      onReady();
    });
    assignProps(this, props);
  }
}