# Entities & Components

## Entities

Entities are unique identifiers (Strings) for game objects. They have no data or logic themselves, serving only as containers for Components.

### Creating an Entity

```typescript
const entity = scene.createEntity();
```

TSpark automatically generates a unique ID for each Entity.

### Removing an Entity

```typescript
scene.destroyEntity(entity);
```

This removes the Entity and all associated Components from all ComponentStores automatically.

## Components

Components are pure data containers without logic. They are assigned to Entities and define their properties.

### Built-in 3D Components

#### Position3

Defines the position of an Entity in 3D space:

```typescript
import { component3D } from './engine';

const position = new component3D.Position3({
  x: 0,
  y: 5,
  z: 10
});

scene.getComponentStore<component3D.Position3>(component3D.Position3.name)
  .add(entity, position);
```

#### Rotation3

Defines the rotation of an Entity (in Radians):

```typescript
import { degreeToRadians } from './engine';

const rotation = new component3D.Rotation3({
  x: degreeToRadians(45),
  y: 0,
  z: 0
});

scene.getComponentStore<component3D.Rotation3>(component3D.Rotation3.name)
  .add(entity, rotation);
```

#### Scale3

Defines the scaling of an Entity:

```typescript
const scale = new component3D.Scale3({
  x: 2,
  y: 2,
  z: 2
});

scene.getComponentStore<component3D.Scale3>(component3D.Scale3.name)
  .add(entity, scale);
```

#### Camera3

Defines a 3D camera:

```typescript
const camera = new component3D.Camera3({
  fov: 60,
  near: 0.1,
  far: 1000
});

camera.position = new component3D.Position3({ z: 15 });
camera.rotation = new component3D.Rotation3();

scene.getComponentStore<component3D.Camera3>(component3D.Camera3.name)
  .add(cameraEntity, camera);

scene.setActiveCameraEntity(cameraEntity);
```

#### Box3

Defines a 3D box:

```typescript
const box = new component3D.Box3({
  width: 1,
  height: 1,
  depth: 1,
  color: [1, 0, 0, 1] // RGBA
});

box.position = new component3D.Position3();
box.rotation = new component3D.Rotation3();
box.scale = new component3D.Scale3({ x: 1, y: 1, z: 1 });

scene.getComponentStore<component3D.Box3>(component3D.Box3.name)
  .add(entity, box);
```

#### Model3

Loads a 3D model from a file:

```typescript
const model = new component3D.Model3({
  path: '/models/mymodel.obj'
});

model.position = new component3D.Position3();
model.rotation = new component3D.Rotation3();
model.scale = new component3D.Scale3({ x: 1, y: 1, z: 1 });

scene.getComponentStore<component3D.Model3>(component3D.Model3.name)
  .add(entity, model);
```

### Creating Custom Components

Components are simple TypeScript classes:

```typescript
// Definition
export class VelocityComponent {
  x: number = 0;
  y: number = 0;
  z: number = 0;

  constructor(data?: Partial<VelocityComponent>) {
    Object.assign(this, data);
  }
}

// Usage
const velocity = new VelocityComponent({ x: 1, y: 0, z: 0 });
scene.getComponentStore<VelocityComponent>(VelocityComponent.name)
  .add(entity, velocity);
```

### Best Practices for Components

1. **Data Only**: Components should only contain data, no logic
2. **Small Components**: Prefer multiple small Components over one large one
3. **Properties**: Use `Partial<T>` in constructor for optional initialization
4. **Typing**: Use TypeScript types for better IDE support

### ComponentStore

ComponentStores manage all Components of a specific type.

#### Adding a Component

```typescript
const store = scene.getComponentStore<Position3>(component3D.Position3.name);
store.add(entity, new component3D.Position3({ x: 5 }));
```

#### Getting a Component

```typescript
const position = store.get(entity);
if (position) {
  console.log(position.x, position.y, position.z);
}
```

#### Updating a Component

```typescript
const position = store.get(entity);
if (position) {
  position.x += 1;
  position.y += 1;
}
```

#### Removing a Component

```typescript
store.remove(entity);
```

#### Checking if Entity has Component

```typescript
if (store.has(entity)) {
  // Entity has this Component
}
```

#### Iterating over all Components

```typescript
for (const [entity, component] of store.entries()) {
  console.log(entity, component);
}
```

## Example: Complete Game Object

```typescript
// Create Entity
const playerEntity = scene.createEntity();

// Position
const position = new component3D.Position3({ x: 0, y: 0, z: 0 });
scene.getComponentStore<component3D.Position3>(component3D.Position3.name)
  .add(playerEntity, position);

// Rotation
const rotation = new component3D.Rotation3({ x: 0, y: 0, z: 0 });
scene.getComponentStore<component3D.Rotation3>(component3D.Rotation3.name)
  .add(playerEntity, rotation);

// Velocity (custom component)
const velocity = new VelocityComponent({ x: 0, y: 0, z: 0 });
scene.getComponentStore<VelocityComponent>(VelocityComponent.name)
  .add(playerEntity, velocity);

// Visual representation
const box = new component3D.Box3({
  width: 1,
  height: 2,
  depth: 1,
  color: [0, 0, 1, 1] // Blue
});
box.position = position;
box.rotation = rotation;
scene.getComponentStore<component3D.Box3>(component3D.Box3.name)
  .add(playerEntity, box);
```

## Component Composition

The strength of ECS lies in combining Components:

```typescript
// Simple Box (visual representation only)
const visualEntity = scene.createEntity();
scene.getComponentStore<component3D.Box3>(component3D.Box3.name)
  .add(visualEntity, new component3D.Box3());

// Box with Rotation
const rotatingEntity = scene.createEntity();
scene.getComponentStore<component3D.Box3>(component3D.Box3.name)
  .add(rotatingEntity, new component3D.Box3());
scene.getComponentStore<RotationLoop>(RotationLoop.name)
  .add(rotatingEntity, new RotationLoop());

// Complete game object with all features
const fullEntity = scene.createEntity();
scene.getComponentStore<component3D.Box3>(component3D.Box3.name)
  .add(fullEntity, new component3D.Box3());
scene.getComponentStore<VelocityComponent>(VelocityComponent.name)
  .add(fullEntity, new VelocityComponent());
scene.getComponentStore<RotationLoop>(RotationLoop.name)
  .add(fullEntity, new RotationLoop());
```

Components can be flexibly combined to achieve different behaviors.
