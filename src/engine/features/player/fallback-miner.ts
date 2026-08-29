import type { SpriteClip, SpriteSheetData } from './sprite-animator';

const FW = 12;
const FH = 16;
const COLS = 6;
const ROWS = 6;

function idx(px: number, py: number): number {
  return (py * (FW * COLS) + px) * 4;
}

function put(pixels: Uint8Array, fx: number, fy: number, lx: number, ly: number, r: number, g: number, b: number, a: number = 255): void {
  if (lx < 0 || ly < 0 || lx >= FW || ly >= FH) return;
  const x = fx * FW + lx;
  const y = fy * FH + ly;
  const o = idx(x, y);
  pixels[o] = r;
  pixels[o + 1] = g;
  pixels[o + 2] = b;
  pixels[o + 3] = a;
}

function rect(pixels: Uint8Array, fx: number, fy: number, x: number, y: number, w: number, h: number, r: number, g: number, b: number): void {
  for (let oy = 0; oy < h; oy++) {
    for (let ox = 0; ox < w; ox++) {
      put(pixels, fx, fy, x + ox, y + oy, r, g, b);
    }
  }
}

function drawMiner(pixels: Uint8Array, fx: number, fy: number, bob: number, leg: number, crouch: number, arm: number): void {
  const top = 1 + bob + crouch;
  rect(pixels, fx, fy, 3, top, 6, 3, 232, 196, 72);
  rect(pixels, fx, fy, 2, top + 1, 1, 2, 232, 196, 72);
  rect(pixels, fx, fy, 4, top + 2, 4, 3, 224, 176, 132);
  put(pixels, fx, fy, 7, top + 3, 40, 36, 48);
  rect(pixels, fx, fy, 3, top + 5, 6, 5, 196, 92, 48);
  rect(pixels, fx, fy, 2 + arm, top + 5, 2, 4, 196, 92, 48);
  rect(pixels, fx, fy, 8 + arm, top + 5, 2, 4, 196, 92, 48);
  const leftLeg = 12 + crouch + (leg > 0 ? 1 : 0);
  const rightLeg = 12 + crouch + (leg < 0 ? 1 : 0);
  rect(pixels, fx, fy, 3, leftLeg, 3, 4 - (leg > 0 ? 1 : 0), 62, 58, 78);
  rect(pixels, fx, fy, 6, rightLeg, 3, 4 - (leg < 0 ? 1 : 0), 48, 46, 64);
}

function clip(name: string, row: number, frames: number, fps: number, loop: boolean, col = 0): SpriteClip {
  return { name, row, col, frames, fps, loop };
}

export function createFallbackMinerSheet(): SpriteSheetData {
  const width = FW * COLS;
  const height = FH * ROWS;
  const pixels = new Uint8Array(width * height * 4);

  for (let i = 0; i < 4; i++) {
    drawMiner(pixels, i, 0, i === 1 || i === 2 ? 0 : 1, 0, 0, 0);
  }
  const walkLegs = [1, 0, -1, 0, 1, -1];
  for (let i = 0; i < 6; i++) {
    drawMiner(pixels, i, 1, i % 2, walkLegs[i], 0, i % 2 === 0 ? -1 : 0);
  }
  drawMiner(pixels, 0, 2, 0, 0, 0, 1);
  drawMiner(pixels, 0, 3, 1, 0, 0, 0);
  drawMiner(pixels, 0, 4, 0, 0, 3, 0);
  for (let i = 0; i < 4; i++) {
    drawMiner(pixels, i, 5, i % 2, 0, 0, i % 2 === 0 ? 1 : -1);
  }

  return {
    pixels,
    width,
    height,
    frameWidth: FW,
    frameHeight: FH,
    clips: {
      idle: clip('idle', 0, 4, 6, true),
      walk: clip('walk', 1, 6, 10, true),
      jump: clip('jump', 2, 1, 1, false),
      fall: clip('fall', 3, 1, 1, false),
      crouch: clip('crouch', 4, 1, 1, true),
      dig: clip('dig', 5, 4, 12, true),
      grab: clip('grab', 5, 2, 8, true),
    },
  };
}
