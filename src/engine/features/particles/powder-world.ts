import { assignProps } from '../../core/utils/common';
import type { Component, Properties } from '../../core/types';
import { Material, type MaterialId } from './materials';
import { PowderGrid } from './powder-grid';

export class PowderWorldComponent implements Component<{
  grid: PowderGrid;
  cameraX: number;
  cameraY: number;
  zoom: number;
  selectedMaterial: MaterialId;
  brushRadius: number;
  paused: boolean;
  cursorX: number;
  cursorY: number;
  tick: number;
  particleCount: number;
  debugMatter: boolean;
  regenerate?: () => void;
}> {
  grid: PowderGrid;
  cameraX: number = 0;
  cameraY: number = 0;
  zoom: number = 2;
  selectedMaterial: MaterialId = Material.Sand;
  brushRadius: number = 4;
  paused: boolean = false;
  cursorX: number = -1;
  cursorY: number = -1;
  tick: number = 0;
  particleCount: number = 0;
  debugMatter: boolean = false;
  regenerate?: () => void;

  constructor(props?: Properties<PowderWorldComponent> & { width?: number; height?: number }) {
    this.grid = props?.grid ?? new PowderGrid(props?.width ?? 640, props?.height ?? 360);
    this.cameraX = this.grid.width * 0.5;
    this.cameraY = this.grid.height * 0.28;
    if (props) {
      const rest = { ...props } as Partial<PowderWorldComponent> & { width?: number; height?: number };
      delete rest.grid;
      delete rest.width;
      delete rest.height;
      assignProps(this, rest as Properties<PowderWorldComponent>);
    }
  }

  fitCamera(viewWidth: number, viewHeight: number): void {
    const z = Math.min(viewWidth / this.grid.width, viewHeight / this.grid.height);
    this.zoom = Math.max(1, z);
    this.cameraX = this.grid.width * 0.5;
    this.cameraY = this.grid.height * 0.5;
  }
}
