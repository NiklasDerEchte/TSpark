# Camera Controls

TSpark offers various camera control systems for different use cases.

## Free Camera Control

The Free Camera Control enables free movement in 3D space - ideal for editor views and exploration.

### Setup

```typescript
import { 
  FreeCameraControlSystem, 
  FreeCameraControlComponent,
  component3D 
} from './engine';

// Register system
world.registerSystem({
  system: new FreeCameraControlSystem()
});

// Create camera
const cameraEntity = scene.createEntity();
scene.setActiveCameraEntity(cameraEntity);

const camera = new component3D.Camera3({
  fov: 60,
  near: 0.1,
  far: 1000
});
camera.position = new component3D.Position3({ x: 0, y: 5, z: 15 });
camera.rotation = new component3D.Rotation3({ x: 0, y: 0, z: 0 });

// Camera Component
scene.getComponentStore<component3D.Camera3>(component3D.Camera3.name)
  .add(cameraEntity, camera);

// Free Camera Control Component
scene.getComponentStore<FreeCameraControlComponent>(FreeCameraControlComponent.name)
  .add(cameraEntity, {
    camera: camera,
    moveSpeed: 0.01,    // Bewegungsgeschwindigkeit
    lookSpeed: 0.001,   // Maus-Empfindlichkeit
  });
```

### Controls

- **W**: Forward
- **S**: Backward
- **A**: Left
- **D**: Right
- **Space**: Up
- **Shift**: Down
- **Mouse move**: Look around
- **Right-click hold**: Activate camera rotation

### Adjust Speed

```typescript
scene.getComponentStore<FreeCameraControlComponent>(
  FreeCameraControlComponent.name
).add(cameraEntity, {
  camera: camera,
  moveSpeed: 0.02,   // Faster movement
  lookSpeed: 0.002,  // More sensitive mouse
});
```

### Add UI Overlay

Display camera position in real-time:

```typescript
import { XYZOverlaySystem, XYZOverlayComponent } from './engine';

// Register system
world.registerSystem({
  system: new XYZOverlaySystem()
});

// Create overlay
const overlayEntity = scene.createEntity();
scene.getComponentStore<XYZOverlayComponent>(XYZOverlayComponent.name)
  .add(overlayEntity, new XYZOverlayComponent({
    label: 'Camera Position',
    xyz: camera.position
  }));
```

## Orbital Camera Control

An Orbital Camera rotates around a center point - ideal for object viewers.

### Setup

```typescript
import { OrbitalCameraControlSystem } from './engine';

// Register system
world.registerSystem({
  system: new OrbitalCameraControlSystem()
});

// TODO: Define and use component
```

## Fixed Camera

A static camera for specific views:

```typescript
const cameraEntity = scene.createEntity();
scene.setActiveCameraEntity(cameraEntity);

const camera = new component3D.Camera3({
  fov: 45,
  near: 0.1,
  far: 100
});

// Isometric view
camera.position = new component3D.Position3({ x: 10, y: 10, z: 10 });
camera.rotation = new component3D.Rotation3({
  x: degreeToRadians(-45),
  y: degreeToRadians(45),
  z: 0
});

scene.getComponentStore<component3D.Camera3>(component3D.Camera3.name)
  .add(cameraEntity, camera);
```

## Follow Camera

A camera that follows an object:

### Create Custom System

```typescript
import { System, World, component3D } from './engine';

export interface FollowCameraComponent {
  camera: component3D.Camera3;
  targetEntity: Entity;
  offset: component3D.Position3;
  smoothing: number;
}

export class FollowCameraSystem implements System {
  world!: World;
  
  init(world: World): void {
    this.world = world;
  }
  
  exec(deltaTimeMs: number): void {
    this.world.query<FollowCameraComponent>(
      'FollowCameraComponent',
      ({ component: follow }) => {
        // Get target position
        this.world.queryOne<component3D.Position3>(
          'Position3',
          follow.targetEntity,
          ({ component: targetPos }) => {
            // Interpolate camera position
            const camPos = follow.camera.position;
            const targetX = targetPos.x + follow.offset.x;
            const targetY = targetPos.y + follow.offset.y;
            const targetZ = targetPos.z + follow.offset.z;
            
            const smoothing = follow.smoothing * deltaTimeMs * 0.001;
            
            camPos.x += (targetX - camPos.x) * smoothing;
            camPos.y += (targetY - camPos.y) * smoothing;
            camPos.z += (targetZ - camPos.z) * smoothing;
          }
        );
      }
    );
  }
  
  destroy(): void {}
}
```

### Usage

```typescript
// Register system
world.registerSystem({
  system: new FollowCameraSystem()
});

// Create player entity
const playerEntity = scene.createEntity();
const playerBox = new component3D.Box3({ color: [0, 1, 0, 1] });
playerBox.position = new component3D.Position3({ x: 0, y: 0, z: 0 });
scene.getComponentStore<component3D.Box3>(component3D.Box3.name)
  .add(playerEntity, playerBox);
scene.getComponentStore<component3D.Position3>(component3D.Position3.name)
  .add(playerEntity, playerBox.position);

// Create camera
const cameraEntity = scene.createEntity();
scene.setActiveCameraEntity(cameraEntity);

const camera = new component3D.Camera3();
camera.position = new component3D.Position3({ x: 0, y: 5, z: 10 });

scene.getComponentStore<component3D.Camera3>(component3D.Camera3.name)
  .add(cameraEntity, camera);

// Follow Camera Component
scene.getComponentStore<FollowCameraComponent>('FollowCameraComponent')
  .add(cameraEntity, {
    camera: camera,
    targetEntity: playerEntity,
    offset: new component3D.Position3({ x: 0, y: 5, z: 10 }),
    smoothing: 5
  });
```

## Third-Person Camera

A camera behind the player with rotation:

```typescript
export interface ThirdPersonCameraComponent {
  camera: component3D.Camera3;
  targetEntity: Entity;
  distance: number;
  height: number;
  rotationSpeed: number;
}

export class ThirdPersonCameraSystem implements System {
  world!: World;
  currentAngle: number = 0;
  
  init(world: World): void {
    this.world = world;
  }
  
  exec(deltaTimeMs: number): void {
    const tspark = TSpark.getInstance();
    
    this.world.query<ThirdPersonCameraComponent>(
      'ThirdPersonCameraComponent',
      ({ component: tpc }) => {
        // Rotation with A/D
        if (tspark.isKeyPressed('KeyA')) {
          this.currentAngle += tpc.rotationSpeed * deltaTimeMs;
        }
        if (tspark.isKeyPressed('KeyD')) {
          this.currentAngle -= tpc.rotationSpeed * deltaTimeMs;
        }
        
        // Zielposition
        this.world.queryOne<component3D.Position3>(
          'Position3',
          tpc.targetEntity,
          ({ component: targetPos }) => {
            const camPos = tpc.camera.position;
            
            // Calculate camera position
            camPos.x = targetPos.x + Math.sin(this.currentAngle) * tpc.distance;
            camPos.y = targetPos.y + tpc.height;
            camPos.z = targetPos.z + Math.cos(this.currentAngle) * tpc.distance;
            
            // Align camera to target
            const dx = targetPos.x - camPos.x;
            const dz = targetPos.z - camPos.z;
            const dy = targetPos.y - camPos.y;
            
            tpc.camera.rotation.y = Math.atan2(dx, dz);
            tpc.camera.rotation.x = Math.atan2(dy, Math.sqrt(dx * dx + dz * dz));
          }
        );
      }
    );
  }
  
  destroy(): void {}
}
```

## Switching Camera Between Scenes

```typescript
// Scene 1: Gameplay with Free Camera
const gameScene = world.createScene('GameScene');
const gameCameraEntity = gameScene.createEntity();
gameScene.setActiveCameraEntity(gameCameraEntity);
// ... Camera setup

// Scene 2: Menu with Fixed Camera
const menuScene = world.createScene('MenuScene');
const menuCameraEntity = menuScene.createEntity();
menuScene.setActiveCameraEntity(menuCameraEntity);
// ... Camera setup

// Switch between scenes
function showMenu() {
  world.deactivateScene('GameScene');
  world.activateScene('MenuScene');
}

function showGame() {
  world.deactivateScene('MenuScene');
  world.activateScene('GameScene');
}
```

## Multiple Cameras in One Scene

Only one camera can be active, but you can switch between them:

```typescript
const firstPersonCamera = scene.createEntity();
const thirdPersonCamera = scene.createEntity();

// Setup both cameras...

// Switch between cameras
function switchToFirstPerson() {
  scene.setActiveCameraEntity(firstPersonCamera);
}

function switchToThirdPerson() {
  scene.setActiveCameraEntity(thirdPersonCamera);
}
```

## Complete Example

```typescript
import { TSpark } from './app';
import { 
  DefaultRenderer, 
  component3D,
  FreeCameraControlSystem,
  FreeCameraControlComponent,
  XYZOverlaySystem,
  XYZOverlayComponent,
  degreeToRadians
} from './engine';

const tspark = new TSpark({
  renderer: new DefaultRenderer(),
  size: { height: 600, width: 900 }
});

const world = tspark.createWorld('CameraWorld');
const scene = world.createScene('MainScene');

// Systems
world.registerSystem({ system: new FreeCameraControlSystem() });
world.registerSystem({ system: new XYZOverlaySystem() });

// Kamera
const cameraEntity = scene.createEntity();
scene.setActiveCameraEntity(cameraEntity);

const camera = new component3D.Camera3({ fov: 75 });
camera.position = new component3D.Position3({ x: 0, y: 10, z: 20 });
camera.rotation = new component3D.Rotation3({ x: degreeToRadians(-20) });

scene.getComponentStore<component3D.Camera3>(component3D.Camera3.name)
  .add(cameraEntity, camera);
scene.getComponentStore<FreeCameraControlComponent>(
  FreeCameraControlComponent.name
).add(cameraEntity, {
  camera: camera,
  moveSpeed: 0.015,
  lookSpeed: 0.001
});

// Position Overlay
const overlayEntity = scene.createEntity();
scene.getComponentStore<XYZOverlayComponent>(XYZOverlayComponent.name)
  .add(overlayEntity, new XYZOverlayComponent({
    label: 'Camera',
    xyz: camera.position
  }));

// Test objects
for (let x = -10; x <= 10; x += 5) {
  for (let z = -10; z <= 10; z += 5) {
    const entity = scene.createEntity();
    const box = new component3D.Box3({
      color: [Math.random(), Math.random(), Math.random(), 1]
    });
    box.position = new component3D.Position3({ x, y: 0, z });
    scene.getComponentStore<component3D.Box3>(component3D.Box3.name)
      .add(entity, box);
  }
}

tspark.start();
```
