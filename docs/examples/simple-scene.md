# Simple 3D Scene

This tutorial shows how to create a simple 3D scene with TSpark.

## Goal

We will create a scene with:
- A movable camera
- Several rotating 3D boxes
- FPS display

## Step 1: Initialize TSpark

```typescript
import { TSpark } from './app';
import { DefaultRenderer } from './engine';

const tspark = new TSpark({
  renderer: new DefaultRenderer({
    enableCullFace: false,
  }),
  size: { height: 600, width: 900 }
});
```

## Step 2: Create World and Scene

```typescript
const world = tspark.createWorld('GameWorld');
const scene = world.createScene('MainScene');
```

## Step 3: Register Systems

```typescript
import { FreeCameraControlSystem, RotationLoopBox3System } from './engine';

// Camera controls
world.registerSystem({
  system: new FreeCameraControlSystem()
});

// Rotation
world.registerSystem({
  system: new RotationLoopBox3System()
});
```

## Step 4: Create Camera

```typescript
import { component3D, FreeCameraControlComponent } from './engine';

const cameraEntity = scene.createEntity();
scene.setActiveCameraEntity(cameraEntity);

const camera = new component3D.Camera3({
  fov: 60,
  near: 0.1,
  far: 1000
});
camera.position = new component3D.Position3({ z: 15, y: 5 });

// Add camera component
scene.getComponentStore<component3D.Camera3>(component3D.Camera3.name)
  .add(cameraEntity, camera);

// Enable Free Camera Control
scene.getComponentStore<FreeCameraControlComponent>(FreeCameraControlComponent.name)
  .add(cameraEntity, {
    camera: camera,
    moveSpeed: 0.01,
    lookSpeed: 0.001
  });
```

## Step 5: Create 3D Boxes

### Simple Box

```typescript
const boxEntity = scene.createEntity();

const box = new component3D.Box3({
  width: 1,
  height: 1,
  depth: 1,
  color: [1, 0, 0, 1] // Red
});
box.position = new component3D.Position3({ x: 0, y: 0, z: 0 });

scene.getComponentStore<component3D.Box3>(component3D.Box3.name)
  .add(boxEntity, box);
```

### Rotating Box

```typescript
import { RotationLoop } from './engine';

const rotatingBoxEntity = scene.createEntity();

const rotatingBox = new component3D.Box3({
  color: [0, 1, 0, 1] // Green
});
rotatingBox.position = new component3D.Position3({ x: 3, y: 0, z: 0 });

scene.getComponentStore<component3D.Box3>(component3D.Box3.name)
  .add(rotatingBoxEntity, rotatingBox);

// Add rotation
scene.getComponentStore<RotationLoop>(RotationLoop.name)
  .add(rotatingBoxEntity, {
    rotation: new component3D.Rotation3({ x: 1, y: 1, z: 0 })
  });
```

### Multiple Boxes with Loop

```typescript
import { degreeToRadians } from './engine';

const numBoxes = 8;
const radius = 5;

for (let i = 0; i < numBoxes; i++) {
  const angle = (i / numBoxes) * Math.PI * 2;
  const x = Math.cos(angle) * radius;
  const z = Math.sin(angle) * radius;
  
  const entity = scene.createEntity();
  
  const box = new component3D.Box3({
    color: [
      Math.random(),
      Math.random(),
      Math.random(),
      1
    ]
  });
  box.position = new component3D.Position3({ x, y: 0, z });
  box.rotation = new component3D.Rotation3({
    y: degreeToRadians(i * 45)
  });
  
  scene.getComponentStore<component3D.Box3>(component3D.Box3.name)
    .add(entity, box);
    
  // Rotate every second box
  if (i % 2 === 0) {
    scene.getComponentStore<RotationLoop>(RotationLoop.name)
      .add(entity, {
        rotation: new component3D.Rotation3({ x: 1, y: 0.5, z: 0 })
      });
  }
}
```

## Step 6: Add FPS Display

```typescript
// Load HTML and CSS
await tspark.inject({
  html: ['/ui/fps-overlay/overlay.html'],
  css: ['/ui/fps-overlay/overlay.css']
});

// FPS Overlay System hinzufügen (aus examples)
import { FPSOverlaySystem } from './examples/twgl/ui/html/fps-overlay-system';

world.registerSystem({
  system: new FPSOverlaySystem()
});
```

## Step 7: Start the Engine

```typescript
tspark.start();
```

## Complete Code

```typescript
import { TSpark } from './app';
import { 
  DefaultRenderer, 
  component3D, 
  FreeCameraControlSystem,
  FreeCameraControlComponent,
  RotationLoopBox3System,
  RotationLoop,
  degreeToRadians
} from './engine';

// Initialize TSpark
const tspark = new TSpark({
  renderer: new DefaultRenderer({
    enableCullFace: false,
  }),
  size: { height: 600, width: 900 }
});

// World and Scene
const world = tspark.createWorld('GameWorld');
const scene = world.createScene('MainScene');

// Systems
world.registerSystem({ system: new FreeCameraControlSystem() });
world.registerSystem({ system: new RotationLoopBox3System() });

// Kamera
const cameraEntity = scene.createEntity();
scene.setActiveCameraEntity(cameraEntity);

const camera = new component3D.Camera3({ fov: 60, near: 0.1, far: 1000 });
camera.position = new component3D.Position3({ z: 15, y: 5 });

scene.getComponentStore<component3D.Camera3>(component3D.Camera3.name)
  .add(cameraEntity, camera);
scene.getComponentStore<FreeCameraControlComponent>(FreeCameraControlComponent.name)
  .add(cameraEntity, { camera: camera });

// Multiple boxes in a circle
const numBoxes = 8;
const radius = 5;

for (let i = 0; i < numBoxes; i++) {
  const angle = (i / numBoxes) * Math.PI * 2;
  const x = Math.cos(angle) * radius;
  const z = Math.sin(angle) * radius;
  
  const entity = scene.createEntity();
  const box = new component3D.Box3({
    color: [Math.random(), Math.random(), Math.random(), 1]
  });
  box.position = new component3D.Position3({ x, y: 0, z });
  box.rotation = new component3D.Rotation3({ y: degreeToRadians(i * 45) });
  
  scene.getComponentStore<component3D.Box3>(component3D.Box3.name)
    .add(entity, box);
    
  if (i % 2 === 0) {
    scene.getComponentStore<RotationLoop>(RotationLoop.name)
      .add(entity, { rotation: new component3D.Rotation3({ x: 1, y: 0.5, z: 0 }) });
  }
}

// Central rotating box
const centerEntity = scene.createEntity();
const centerBox = new component3D.Box3({
  width: 2,
  height: 2,
  depth: 2,
  color: [1, 1, 0, 1] // Yellow
});
centerBox.position = new component3D.Position3({ x: 0, y: 0, z: 0 });

scene.getComponentStore<component3D.Box3>(component3D.Box3.name)
  .add(centerEntity, centerBox);
scene.getComponentStore<RotationLoop>(RotationLoop.name)
  .add(centerEntity, {
    rotation: new component3D.Rotation3({ x: 0.5, y: 1, z: 0.3 })
  });

// Start engine
tspark.start();

export default tspark;
```

## Controls

- **W/A/S/D**: Camera forward/left/backward/right
- **Space**: Camera up
- **Shift**: Camera down
- **Mouse**: Look around

## Extensions

### Add Floor

```typescript
const floorEntity = scene.createEntity();
const floor = new component3D.Box3({
  width: 20,
  height: 0.1,
  depth: 20,
  color: [0.3, 0.3, 0.3, 1]
});
floor.position = new component3D.Position3({ y: -2 });

scene.getComponentStore<component3D.Box3>(component3D.Box3.name)
  .add(floorEntity, floor);
```

### Animate Different Colors

Create a system that continuously changes colors:

```typescript
import { System, World, component3D } from './engine';

export class ColorAnimationSystem implements System {
  world!: World;
  time: number = 0;
  
  init(world: World): void {
    this.world = world;
  }
  
  exec(deltaTimeMs: number): void {
    this.time += deltaTimeMs * 0.001;
    
    this.world.query<component3D.Box3>('Box3', ({ component }) => {
      component.color[0] = (Math.sin(this.time) + 1) / 2;
      component.color[1] = (Math.cos(this.time * 0.7) + 1) / 2;
      component.color[2] = (Math.sin(this.time * 0.5) + 1) / 2;
    });
  }
  
  destroy(): void {}
}

// Register system
world.registerSystem({ system: new ColorAnimationSystem() });
```
