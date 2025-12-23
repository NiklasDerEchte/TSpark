export interface System {
  exec(deltaTimeMs: number): void;
}

export type ComponentData = {
  [k: string]: any;
};

export type Component<T extends ComponentData> = T;

export type Vector = Component<{ x: number; y: number; z?: number }>;
export type Position = Component<Vector>;
export type Rotation = Component<Vector>;
export type Scale = Component<Vector>;
export type Transform = Component<{ position: Position; rotation?: Rotation; scale?: Scale }>;
export type Velocity = Component<Vector>;
