# Core Concepts

TSpark is based on an **Entity-Component-System (ECS)** architecture that enables clean separation of data and logic.

## What is ECS?

ECS is an architectural pattern widely used in game development:

- **Entities** are unique identifiers for game objects
- **Components** are data containers attached to entities
- **Systems** are logic processors that operate on entities with specific components

## Architecture Overview

```
TSpark
  └── World(s)
       ├── Scene(s)
       │    ├── Entity
       │    │    └── Component(s)
       │    └── ComponentStore
       └── System(s)
```

### TSpark

The main class that initializes and manages the entire framework:

- Manages the Game Loop
- Coordinates rendering
- Manages Worlds

### World

A top-level container for game logic:

- Can contain multiple **Scenes**
- Manages **Systems**
- Executes queries across all active scenes

```typescript
const world = tspark.createWorld('MyWorld');
```

### Scene

A collection of entities within a World:

- Contains **Entities** and their **Components**
- Manages **ComponentStores**
- Can be activated/deactivated

```typescript
const scene = world.createScene('MyScene');
```

### Entity

A unique identifier (String) for a game object:

- Has no data or logic itself
- Used to group components together

```typescript
const entity = scene.createEntity();
```

### Component

A data container assigned to an entity:

- Contains only data, no logic
- Stored in ComponentStores
- Examples: `Position3`, `Rotation3`, `Camera3`, `Box3`

```typescript
const position = new component3D.Position3({ x: 0, y: 0, z: 5 });
scene.getComponentStore<component3D.Position3>(component3D.Position3.name)
  .add(entity, position);
```

### System

A logic unit that operates on entities with specific components:

- Implements the `System` interface
- Has access to the entire World
- Called every frame or at fixed time intervals

```typescript
export interface System {
  init(world: World): void;
  exec(deltaTimeMs: number): void;
  destroy(): void;
}
```

Beispiel:

```typescript
class RotationSystem implements System {
  world!: World;
  
  init(world: World): void {
    this.world = world;
  }
  
  exec(deltaTimeMs: number): void {
    this.world.query<RotationComponent>('Rotation', ({ entity, component }) => {
      component.angle += component.speed * deltaTimeMs;
    });
  }
  
  destroy(): void {}
}
```

## Data Flow

1. **Initialization**: TSpark → World → Scene → Entities + Components
2. **Game Loop**: 
   - Fixed Update: Systems are called at fixed time intervals
   - Update: Systems are called every frame
   - Draw: Renderer draws all Worlds
3. **Queries**: Systems query components through the World

## Advantages of ECS

- **Modularity**: Components and Systems are reusable
- **Flexibility**: Entities can be modified at runtime
- **Performance**: Cache-friendly data structure
- **Testability**: Logic is separated from data
- **Scalability**: New features can easily be added as Systems

## Next Steps

- [World & Scenes](/guide/world-and-scenes) - Detailed information
- [Entities & Components](/guide/entities-and-components) - Component development
- [Systems](/guide/systems) - System development
