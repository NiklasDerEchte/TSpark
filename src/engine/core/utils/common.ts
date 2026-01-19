import type { Properties } from "../types";

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
      const id = `${hex.slice(0, 4).join('')}-${hex.slice(4, 6).join('')}-${hex.slice(6, 8).join('')}-${hex.slice(8, 10).join('')}-${hex
        .slice(10)
        .join('')}`;
      return prefix ? `${prefix}-${id}` : id;
    }
  } catch (_) {
    // fall through to non-crypto fallback
  }
  const id = `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
  return prefix ? `${prefix}-${id}` : id;
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
