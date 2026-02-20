# Systems

Systems contain game logic and operate on entities with specific components. They implement the `System` interface.

## System Interface

```typescript
export interface System {
  init(world: World): void;
  exec(deltaTimeMs: number): void;
  destroy(): void;
}
```

### Lifecycle Methods

- **init**: Called once when registering
- **exec**: Called every frame (or at fixed intervals)
- **destroy**: Called when removing the system

## Creating a Simple System

```typescript
import { System, World } from './engine';

export class MovementSystem implements System {
  world!: World;
  
  init(world: World): void {
    this.world = world;
  }
  
  exec(deltaTimeMs: number): void {
    // Logic here
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
    // Cleanup here
  }
}
```

## Registering a System

### Normal Mode (every frame)

```typescript
world.registerSystem({
  system: new MovementSystem(),
  key: 'Movement', // optional
  mode: 'normal' // default
});
```

### Fixed Mode (fixed time intervals)

Ideal for physics simulations:

```typescript
world.registerSystem({
  system: new PhysicsSystem(),
  mode: 'fixed'
});
```

## Built-in Systems

### FreeCameraControlSystem

Allows free camera movement with WASD and mouse:

```typescript
import { FreeCameraControlSystem, FreeCameraControlComponent } from './engine';

// Register system
world.registerSystem({ 
  system: new FreeCameraControlSystem() 
});

// Add component to camera entity
const camera = new component3D.Camera3();
scene.getComponentStore<FreeCameraControlComponent>(FreeCameraControlComponent.name)
  .add(cameraEntity, {
    camera: camera,
    moveSpeed: 0.01,
    lookSpeed: 0.001
  });
```

Controls:
- **WASD**: Movement
- **Space**: Up
- **Shift**: Down
- **Mouse**: Look around

### RotationSystem

Rotates entities continuously:

```typescript
import { RotationLoopBox3System, RotationLoop } from './engine';

// Register system
world.registerSystem({ 
  system: new RotationLoopBox3System() 
});

// Add component to entity
scene.getComponentStore<RotationLoop>(RotationLoop.name)
  .add(entity, { 
    rotation: new component3D.Rotation3({ x: 1, y: 0.5, z: 0 })
  });
```

### XYZOverlaySystem

Displays position, rotation or other XYZ values in the UI:

```typescript
import { XYZOverlaySystem, XYZOverlayComponent } from './engine';

// Register system
world.registerSystem({ 
  system: new XYZOverlaySystem() 
});

// Add component
scene.getComponentStore<XYZOverlayComponent>(XYZOverlayComponent.name)
  .add(entity, new XYZOverlayComponent({
    label: 'Position',
    xyz: camera.position
  }));
```

## Using Queries

### All Entities with a Component

```typescript
exec(deltaTimeMs: number): void {
  this.world.query<Box3>('Box3', ({ scene, entity, component }) => {
    // Work with each Box3 Component
    component.rotation.y += 0.01 * deltaTimeMs;
  });
}
```

### Combining Multiple Components

```typescript
exec(deltaTimeMs: number): void {
  this.world.query<VelocityComponent>('VelocityComponent', 
    ({ entity, component: velocity }) => {
      // Check if entity also has Position
      this.world.queryOne<Position3>('Position3', entity, 
        ({ component: position }) => {
          // Both components available
          position.x += velocity.x * deltaTimeMs;
          position.y += velocity.y * deltaTimeMs;
          position.z += velocity.z * deltaTimeMs;
        }
      );
    }
  );
}
```

### Iterating Through All Active Scenes

```typescript
exec(deltaTimeMs: number): void {
  const scenes = this.world.getActiveScenes();
  
  for (const scene of scenes) {
    const store = scene.getComponentStore<Position3>(component3D.Position3.name);
    
    for (const [entity, position] of store.entries()) {
      // Work with Position
    }
  }
}
```

## Example: Gravity System

A system that applies gravity to all entities with Velocity:

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

## Example: Collision Detection System

```typescript
export class CollisionSystem implements System {
  world!: World;
  
  init(world: World): void {
    this.world = world;
  }
  
  exec(deltaTimeMs: number): void {
    const entities: Array<{ entity: Entity; position: Position3; box: Box3 }> = [];
    
    // Collect all entities with Position and Box
    this.world.query<Box3>('Box3', ({ entity, component: box }) => {
      this.world.queryOne<Position3>('Position3', entity, 
        ({ component: position }) => {
          entities.push({ entity, position, box });
        }
      );
    });
    
    // Check collisions between all pairs
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
    // Simple AABB Collision Detection
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

1. **Single Responsibility**: Each system should have a specific task
2. **Performance**: Use queries efficiently, avoid nested loops when possible
3. **Delta Time**: Use `deltaTimeMs` for frame-independent movements
4. **Fixed Systems**: Use `mode: 'fixed'` for physics and other time-critical operations
5. **Cleanup**: Use `destroy()` for resource cleanup

## System Communication

Systems can communicate through the World:

```typescript
export class InputSystem implements System {
  world!: World;
  
  init(world: World): void {
    this.world = world;
  }
  
  exec(deltaTimeMs: number): void {
    const tspark = TSpark.getInstance();
    
    if (tspark.isKeyPressed('Space')) {
      // Set jump flag in all Player entities
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

The order of system registration determines execution order:

```typescript
// First process input
world.registerSystem({ system: new InputSystem() });

// Then calculate movement
world.registerSystem({ system: new MovementSystem() });

// Then check collisions
world.registerSystem({ system: new CollisionSystem() });

// Finally update camera
world.registerSystem({ system: new FreeCameraControlSystem() });
```
