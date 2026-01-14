import { component2D, component3D, type Properties } from '.';
import type { Scene } from '../world';

export function generateUniqueId(prefix?: string): string {
  try {
    if (typeof globalThis.crypto?.randomUUID === 'function') {
      const id = globalThis.crypto.randomUUID();
      return prefix ? `${prefix}-${id}` : id;
    }
    if (typeof globalThis.crypto?.getRandomValues === 'function') {
      const bytes = new Uint8Array(16);
      globalThis.crypto.getRandomValues(bytes);
      // RFC 4122 version 4
      bytes[6] = (bytes[6] & 0x0f) | 0x40;
      bytes[8] = (bytes[8] & 0x3f) | 0x80;
      const hex = Array.from(bytes).map((b) => b.toString(16).padStart(2, '0'));
      const id = `${hex.slice(0, 4).join('')}-${hex.slice(4, 6).join('')}-${hex.slice(6, 8).join('')}-${hex.slice(8, 10).join('')}-${hex.slice(10).join('')}`;
      return prefix ? `${prefix}-${id}` : id;
    }
  } catch (_) {
    // fall through to non-crypto fallback
  }
  const id = `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
  return prefix ? `${prefix}-${id}` : id;
}

export function getDefaultCamera(scene: Scene): component2D.Camera | component3D.Camera3 | undefined {
  let camera: component2D.Camera | component3D.Camera3 | undefined;
  for (const [, cam] of scene.getComponentStore<component2D.Camera>('camera2d').entries()) {
    camera = cam;
    break;
  }
  if(!camera) {
    for (const [, cam] of scene.getComponentStore<component3D.Camera3>(component3D.Camera3.name).entries()) {
      camera = cam;
      break;
    }
  }
  camera ??= { id: 'cam', background: '#f8f8f8f8' };
  return camera;
}

export function degreeToRadians(degree: number): number {
  return degree * (Math.PI / 180);
}

/**
 * Weist die Eigenschaften eines Teilobjekts einer Klasseninstanz zu.
 * Nützlich für die Initialisierung in Konstruktoren.
 * @param instance Die Klasseninstanz (this)
 * @param props Das Objekt mit den zu setzenden Eigenschaften
 */
export function assignProps<T>(instance: T, props?: Properties<T>): void {
  if (props) {
    Object.assign<any, any>(instance, props);
  }
}

export async function objFileToRenderItem(filePath: string): Promise<component3D.RenderItem3> {
  const response = await fetch(filePath);
  const objText = await response.text();

  const renderItem = new component3D.RenderItem3();
  const vertices: number[][] = [];
  const indices: number[] = [];

  const lines = objText.split('\n');

  for (const line of lines) {
    const parts = line.trim().split(/\s+/);
    const type = parts.shift();

    if (type === 'v') {
      vertices.push(parts.map(parseFloat));
    } else if (type === 'f') {
      for (const part of parts) {
        const faceIndices = part.split('/');
        const vertexIndex = parseInt(faceIndices[0], 10) - 1;
        indices.push(vertexIndex);
      }
    }
  }

  const flatVertices = vertices.flat();
  renderItem.geometry.vertices = flatVertices;
  renderItem.geometry.indices = indices;

  return renderItem;
}