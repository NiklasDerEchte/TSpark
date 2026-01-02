import type { Component, SceneObject } from "./type";

type VectorStructure = { x: number; y: number };

export class Vector implements Component<VectorStructure> {
  x: number = 0;
  y: number = 0;
}
export class Position implements Component<VectorStructure> {
  x: number = 0;
  y: number = 0;
}
export class Rotation implements Component<VectorStructure> {
  x: number = 0;
  y: number = 0;
}
export class Scale implements Component<VectorStructure> {
  x: number = 0;
  y: number = 0;
}
export class Transform implements Component<{ position: Position; rotation?: Rotation; scale?: Scale }> {
  position: Position = new Position();
  rotation?: Rotation | undefined;
  scale?: Scale | undefined;
}

export class Camera implements Component<SceneObject & { background?: string }> {
  id: string = '';
  background?: string | undefined;
}

export class Velocity implements Component<VectorStructure> {
  x: number = 0;
  y: number = 0;
}

export class Sprite implements Component<SceneObject & { color: string; width: number; height: number }> {
  id: string = "";
  color: string = "";
  width: number = 0;
  height: number = 0;
}

export class Triangle implements Component<SceneObject & Transform & { color?: string }> {
  id: string = "";
  position: Position = new Position();
  rotation?: Rotation | undefined;
  scale?: Scale | undefined;
  color?: string | undefined;
}
