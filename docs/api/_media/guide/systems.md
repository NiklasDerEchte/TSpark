# Systems

Systems enthalten die Spiellogik und arbeiten auf Entities mit bestimmten Components. Sie implementieren das `System` Interface.

## System Interface

```typescript
export interface System {
  init(world: World): void;
  exec(deltaTimeMs: number): void;
  destroy(): void;
}
```

### Lifecycle-Methoden

- **init**: Wird einmal beim Registrieren aufgerufen
- **exec**: Wird jeden Frame (oder in festen Intervallen) aufgerufen
- **destroy**: Wird beim Entfernen des Systems aufgerufen

## Einfaches System erstellen

```typescript
import { System, World } from './engine';

export class MovementSystem implements System {
  world!: World;
  
  init(world: World): void {
    this.world = world;
  }
  
  exec(deltaTimeMs: number): void {
    // Logik hier
    this.world.query<VelocityComponent>('VelocityComponent', 
      ({ entity, component: velocity }) => {
        this.world.queryOne<Position3>('Position3', entity, 
          ({ component: position }) => {
            position.x += velocity.x * deltaTimeMs;
            position.y += velocity.y * deltaTimeMs;
            position.z += velocity.z * deltaTimeMs;
          }
        );
      }
    );
  }
  
  destroy(): void {
    // Cleanup hier
  }
}
```

## System registrieren

### Normal Mode (jeden Frame)

```typescript
world.registerSystem({
  system: new MovementSystem(),
  key: 'Movement', // optional
  mode: 'normal' // default
});
```

### Fixed Mode (feste Zeitintervalle)

Ideal für Physik-Simulationen:

```typescript
world.registerSystem({
  system: new PhysicsSystem(),
  mode: 'fixed'
});
```

## Eingebaute Systems

### FreeCameraControlSystem

Ermöglicht freie Kamerabewegung mit WASD und Maus:

```typescript
import { FreeCameraControlSystem, FreeCameraControlComponent } from './engine';

// System registrieren
world.registerSystem({ 
  system: new FreeCameraControlSystem() 
});

// Component zur Kamera-Entity hinzufügen
const camera = new component3D.Camera3();
scene.getComponentStore<FreeCameraControlComponent>(FreeCameraControlComponent.name)
  .add(cameraEntity, {
    camera: camera,
    moveSpeed: 0.01,
    lookSpeed: 0.001
  });
```

Steuerung:
- **WASD**: Bewegung
- **Leertaste**: Hoch
- **Shift**: Runter
- **Maus**: Umsehen

### RotationSystem

Rotiert Entities kontinuierlich:

```typescript
import { RotationLoopBox3System, RotationLoop } from './engine';

// System registrieren
world.registerSystem({ 
  system: new RotationLoopBox3System() 
});

// Component zur Entity hinzufügen
scene.getComponentStore<RotationLoop>(RotationLoop.name)
  .add(entity, { 
    rotation: new component3D.Rotation3({ x: 1, y: 0.5, z: 0 })
  });
```

### XYZOverlaySystem

Zeigt Position, Rotation oder andere XYZ-Werte im UI an:

```typescript
import { XYZOverlaySystem, XYZOverlayComponent } from './engine';

// System registrieren
world.registerSystem({ 
  system: new XYZOverlaySystem() 
});

// Component hinzufügen
scene.getComponentStore<XYZOverlayComponent>(XYZOverlayComponent.name)
  .add(entity, new XYZOverlayComponent({
    label: 'Position',
    xyz: camera.position
  }));
```

## Queries verwenden

### Alle Entities mit einem Component

```typescript
exec(deltaTimeMs: number): void {
  this.world.query<Box3>('Box3', ({ scene, entity, component }) => {
    // Arbeite mit jedem Box3 Component
    component.rotation.y += 0.01 * deltaTimeMs;
  });
}
```

### Mehrere Components kombinieren

```typescript
exec(deltaTimeMs: number): void {
  this.world.query<VelocityComponent>('VelocityComponent', 
    ({ entity, component: velocity }) => {
      // Prüfe, ob Entity auch Position hat
      this.world.queryOne<Position3>('Position3', entity, 
        ({ component: position }) => {
          // Beide Components verfügbar
          position.x += velocity.x * deltaTimeMs;
          position.y += velocity.y * deltaTimeMs;
          position.z += velocity.z * deltaTimeMs;
        }
      );
    }
  );
}
```

### Alle aktiven Scenes durchlaufen

```typescript
exec(deltaTimeMs: number): void {
  const scenes = this.world.getActiveScenes();
  
  for (const scene of scenes) {
    const store = scene.getComponentStore<Position3>(component3D.Position3.name);
    
    for (const [entity, position] of store.entries()) {
      // Arbeite mit Position
    }
  }
}
```

## Beispiel: Gravity System

Ein System, das Gravitation auf alle Entities mit Velocity anwendet:

```typescript
export class GravitySystem implements System {
  world!: World;
  gravity: number = -9.81;
  
  init(world: World): void {
    this.world = world;
  }
  
  exec(deltaTimeMs: number): void {
    this.world.query<VelocityComponent>('VelocityComponent', 
      ({ component: velocity }) => {
        velocity.y += this.gravity * deltaTimeMs * 0.001;
      }
    );
  }
  
  destroy(): void {}
}
```

## Beispiel: Collision Detection System

```typescript
export class CollisionSystem implements System {
  world!: World;
  
  init(world: World): void {
    this.world = world;
  }
  
  exec(deltaTimeMs: number): void {
    const entities: Array<{ entity: Entity; position: Position3; box: Box3 }> = [];
    
    // Sammle alle Entities mit Position und Box
    this.world.query<Box3>('Box3', ({ entity, component: box }) => {
      this.world.queryOne<Position3>('Position3', entity, 
        ({ component: position }) => {
          entities.push({ entity, position, box });
        }
      );
    });
    
    // Prüfe Kollisionen zwischen allen Paaren
    for (let i = 0; i < entities.length; i++) {
      for (let j = i + 1; j < entities.length; j++) {
        if (this.checkCollision(entities[i], entities[j])) {
          this.handleCollision(entities[i], entities[j]);
        }
      }
    }
  }
  
  private checkCollision(
    a: { position: Position3; box: Box3 },
    b: { position: Position3; box: Box3 }
  ): boolean {
    // Einfache AABB Collision Detection
    return (
      Math.abs(a.position.x - b.position.x) < (a.box.width + b.box.width) / 2 &&
      Math.abs(a.position.y - b.position.y) < (a.box.height + b.box.height) / 2 &&
      Math.abs(a.position.z - b.position.z) < (a.box.depth + b.box.depth) / 2
    );
  }
  
  private handleCollision(
    a: { entity: Entity; position: Position3 },
    b: { entity: Entity; position: Position3 }
  ): void {
    console.log(`Collision between ${a.entity} and ${b.entity}`);
  }
  
  destroy(): void {}
}
```

## Best Practices

1. **Single Responsibility**: Jedes System sollte eine spezifische Aufgabe haben
2. **Performance**: Nutze Queries effizient, vermeide verschachtelte Schleifen wenn möglich
3. **Delta Time**: Nutze `deltaTimeMs` für frame-unabhängige Bewegungen
4. **Fixed Systems**: Nutze `mode: 'fixed'` für Physik und andere zeitkritische Operationen
5. **Cleanup**: Nutze `destroy()` für Ressourcen-Cleanup

## System-Kommunikation

Systems können über die World kommunizieren:

```typescript
export class InputSystem implements System {
  world!: World;
  
  init(world: World): void {
    this.world = world;
  }
  
  exec(deltaTimeMs: number): void {
    const tspark = TSpark.getInstance();
    
    if (tspark.isKeyPressed('Space')) {
      // Setze Jump-Flag in allen Player-Entities
      this.world.query<PlayerComponent>('PlayerComponent', 
        ({ entity }) => {
          this.world.queryOne<VelocityComponent>('VelocityComponent', entity,
            ({ component: velocity }) => {
              velocity.y = 5; // Jump
            }
          );
        }
      );
    }
  }
  
  destroy(): void {}
}
```

## System Execution Order

Die Reihenfolge der System-Registrierung bestimmt die Ausführungsreihenfolge:

```typescript
// Zuerst Input verarbeiten
world.registerSystem({ system: new InputSystem() });

// Dann Bewegung berechnen
world.registerSystem({ system: new MovementSystem() });

// Dann Kollisionen prüfen
world.registerSystem({ system: new CollisionSystem() });

// Zuletzt Kamera aktualisieren
world.registerSystem({ system: new FreeCameraControlSystem() });
```
