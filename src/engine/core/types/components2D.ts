import { colord, type Colord } from "colord";
import type { Component } from "./type";

type VectorStructure = { x: number; y: number };

export class Vector2 implements Component<VectorStructure> {
  x: number = 0;
  y: number = 0;
}

export class Rect2D implements Component<{ position: Vector2; size: { width: number; height: number }, color: Colord}> {
  position: Vector2 = {
    x: 0,
    y: 0
  };
  size: { width: number; height: number } = {
    width: 0,
    height: 0
  };
  color: Colord = colord("");
}

export class UIText2 implements Component<{rect: Rect2D, text: string, size: number, color: Colord}> {
  rect: Rect2D = new Rect2D();
  text: string = "";
  size: number = 0;
  color: Colord = colord("");
}

