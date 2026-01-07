import type { Component } from "./type";

export class TwglMaterial
  implements
    Component<{
      texture: HTMLImageElement;
      uvs: Float32Array | number[] | undefined;
    }>
{
  texture: HTMLImageElement = new Image();
  uvs: Float32Array | number[] = []; // array of texture 2d positions x1,y1,x2,y2..
}

export class TwglBaseColor
  implements
    Component<{
      baseColor: string | [number, number, number, number];
    }>
{
  baseColor: string | [number, number, number, number] = [255, 255, 255, 255];
}

export class TwglGeometry
  implements
    Component<{
      vertices: Float32Array | number[];
      indices: Uint16Array | Uint32Array | number[];
    }>
{
  vertices: number[] | Float32Array<ArrayBufferLike> = []; // array of x,y,z,x1,y1,z1..
  indices: number[] | Uint16Array<ArrayBufferLike> | Uint32Array<ArrayBufferLike> = []; // array of triangle segmentations 0,1,2,0,2,3..
}

export class TwglRenderItem
  implements
    Component<{
      geometry: TwglGeometry;
      material: TwglBaseColor | TwglMaterial;
      visible: boolean;
    }>
{
  geometry: TwglGeometry = new TwglGeometry();
  material: TwglBaseColor | TwglMaterial = new TwglBaseColor();
  visible: boolean = true;
}