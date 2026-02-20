# World & Scenes

## World

A **World** is a top-level container that manages Scenes and Systems.

### Creating a World

```typescript
const world = tspark.createWorld('MyWorld');
```

### Managing Scenes

#### Creating a Scene

```typescript
const scene = world.createScene('MainScene');
```

The first created Scene is automatically activated.

#### Activating/Deactivating Scenes

```typescript
// Activate scene
world.activateScene('MainScene');

// Deactivate scene
world.deactivateScene('MainScene');
```

Only active Scenes are rendered and included in queries.

#### Getting a Scene

```typescript
const scene = world.getScene('MainScene');
if (scene) {
  // Work with the scene
}
```

#### Getting All Active Scenes

```typescript
const activeScenes = world.getActiveScenes();
```

#### Removing a Scene

```typescript
const removed = world.removeScene('MainScene');
```

### Registering Systems

Systems execute game logic. There are two types:

#### Normal Systems

Called every frame:

```typescript
world.registerSystem({
  system: new FreeCameraControlSystem(),
  key: 'FreeCameraControl', // optional
  mode: 'normal' // default
});
```

#### Fixed Systems

Called at fixed time intervals (good for physics):

```typescript
world.registerSystem({
  system: new PhysicsSystem(),
  mode: 'fixed'
});
```

### Getting a System

```typescript
const system = world.getSystem<FreeCameraControlSystem>('FreeCameraControl');
if (system) {
  // Work with the system
}
```

### Removing a System

```typescript
const removed = world.removeSystem('FreeCameraControl');
```

### Queries

Queries allow you to search for Components across all active Scenes.

#### Querying All Entities with a Component

```typescript
world.query<Position3>('Position3', ({ scene, entity, component }) => {
  console.log(`Entity ${entity} in Scene ${scene.getName()}`);
  console.log(`Position: ${component.x}, ${component.y}, ${component.z}`);
});
```

#### Querying a Specific Entity

```typescript
world.queryOne<Position3>('Position3', entityId, ({ scene, entity, component }) => {
  component.x += 1;
});
```

## Scene

A **Scene** is a collection of Entities and their Components.

### Creating an Entity

```typescript
const entity = scene.createEntity();
```

Each Entity receives a unique ID.

### Removing an Entity

```typescript
scene.destroyEntity(entity);
```

This removes the Entity and all associated Components.

### Setting the Active Camera

Each Scene needs an active camera for rendering:

```typescript
const cameraEntity = scene.createEntity();
scene.setActiveCameraEntity(cameraEntity);

const camera = new component3D.Camera3();
scene.getComponentStore<component3D.Camera3>(component3D.Camera3.name)
  .add(cameraEntity, camera);
```

### Getting the Active Camera

```typescript
const cameraEntity = scene.getActiveCameraEntity();
```

### Using Component Stores

Components are stored in ComponentStores:

```typescript
// Get Component Store (automatically created if it doesn't exist)
const positionStore = scene.getComponentStore<Position3>(component3D.Position3.name);

// Add Component
positionStore.add(entity, new component3D.Position3({ x: 0, y: 0, z: 5 }));

// Get Component
const position = positionStore.get(entity);

// Remove Component
positionStore.remove(entity);

// Check if Entity has Component
const hasPosition = positionStore.has(entity);

// Iterate over all Components
for (const [entity, component] of positionStore.entries()) {
  console.log(entity, component);
}
```

### Getting Scene Name

```typescript
const name = scene.getName();
```

## Example: Complete World Setup

```typescript
import { TSpark } from './app';
import { DefaultRenderer, component3D } from './engine';

// Initialize TSpark
const tspark = new TSpark({
  renderer: new DefaultRenderer(),
  size: { height: 600, width: 800 },
});

// Create World
const world = tspark.createWorld('GameWorld');

// Register Systems
world.registerSystem({ system: new FreeCameraControlSystem() });
world.registerSystem({ system: new RotationSystem() });

// Create main scene
const mainScene = world.createScene('MainScene');

// Create camera
const cameraEntity = mainScene.createEntity();
mainScene.setActiveCameraEntity(cameraEntity);
const camera = new component3D.Camera3();
camera.position = new component3D.Position3({ z: 15 });
mainScene.getComponentStore<component3D.Camera3>(component3D.Camera3.name)
  .add(cameraEntity, camera);

// Create game objects
const boxEntity = mainScene.createEntity();
const box = new component3D.Box3();
box.position = new component3D.Position3();
mainScene.getComponentStore<component3D.Box3>(component3D.Box3.name)
  .add(boxEntity, box);

// Optional: Create additional scene
const menuScene = world.createScene('MenuScene');
world.deactivateScene('MenuScene'); // Deactivate until needed

// Start engine
tspark.start();
```

## Best Practices

1. **Scene Organization**: Use different Scenes for different game states (Menu, Game, Pause)
2. **System Scope**: Register Systems at World level, not in Scenes
3. **Query Efficiency**: Use specific Component keys for efficient queries
4. **Entity Cleanup**: Don't forget to destroy Entities when they're no longer needed
5. **Camera Management**: Each Scene needs an active camera for rendering
