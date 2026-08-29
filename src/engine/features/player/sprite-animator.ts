import { assignProps } from '../../core/utils/common';
import type { Component, Properties } from '../../core/types';

export interface SpriteClip {
  name: string;
  row: number;
  col: number;
  frames: number;
  fps: number;
  loop: boolean;
}

export interface SpriteSheetData {
  pixels: Uint8Array;
  width: number;
  height: number;
  frameWidth: number;
  frameHeight: number;
  clips: Record<string, SpriteClip>;
}

export class SpriteAnimatorComponent implements Component<{
  sheet: SpriteSheetData;
  currentClip: string;
  time: number;
  frame: number;
  flipX: boolean;
}> {
  sheet!: SpriteSheetData;
  currentClip: string = 'idle';
  time: number = 0;
  frame: number = 0;
  flipX: boolean = false;

  constructor(props?: Properties<SpriteAnimatorComponent>) {
    assignProps(this, props);
  }

  play(clip: string): void {
    if (this.currentClip === clip) return;
    this.currentClip = clip;
    this.time = 0;
    this.frame = 0;
  }

  clip(): SpriteClip | undefined {
    return this.sheet.clips[this.currentClip] ?? this.sheet.clips['idle'];
  }
}
