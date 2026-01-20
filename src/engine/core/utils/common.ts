import type { Properties } from "../types";

/**
 * Generates a unique identifier.
 * @param prefix 
 * @returns 
 */
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

/**
 * Converts degrees to radians.
 * @param degree 
 * @returns 
 */
export function degreeToRadians(degree: number): number {
  return degree * (Math.PI / 180);
}

/**
 * Assigns the properties of a partial object to a class instance.
 * Useful for initialization in constructors.
 * @param instance The class instance (this)
 * @param props The object with the properties to set
 */
export function assignProps<T>(instance: T, props?: Properties<T>): void {
  if (props) {
    Object.assign<any, any>(instance, props);
  }
}
