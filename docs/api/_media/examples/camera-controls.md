# Kamera-Steuerung

TSpark bietet verschiedene Kamera-Steuerungssysteme für unterschiedliche Anwendungsfälle.

## Free Camera Control

Die Free Camera Control ermöglicht freie Bewegung im 3D-Raum - ideal für Editor-Ansichten und Exploration.

### Setup

```typescript
import { 
  FreeCameraControlSystem, 
  FreeCameraControlComponent,
  component3D 
} from './engine';

// System registrieren
world.registerSystem({
  system: new FreeCameraControlSystem()
});

// Kamera erstellen
const cameraEntity = scene.createEntity();
scene.setActiveCameraEntity(cameraEntity);

const camera = new component3D.Camera3({
  fov: 60,
  near: 0.1,
  far: 1000
});
camera.position = new component3D.Position3({ x: 0, y: 5, z: 15 });
camera.rotation = new component3D.Rotation3({ x: 0, y: 0, z: 0 });

// Kamera-Component
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

### Steuerung

- **W**: Vorwärts
- **S**: Rückwärts
- **A**: Links
- **D**: Rechts
- **Leertaste**: Hoch
- **Shift**: Runter
- **Maus bewegen**: Umsehen
- **Rechtsklick gedrückt halten**: Kamera-Rotation aktivieren

### Geschwindigkeit anpassen

```typescript
scene.getComponentStore<FreeCameraControlComponent>(
  FreeCameraControlComponent.name
).add(cameraEntity, {
  camera: camera,
  moveSpeed: 0.02,   // Schnellere Bewegung
  lookSpeed: 0.002,  // Empfindlichere Maus
});
```

### UI-Overlay hinzufügen

Zeige Kamera-Position in Echtzeit an:

```typescript
import { XYZOverlaySystem, XYZOverlayComponent } from './engine';

// System registrieren
world.registerSystem({
  system: new XYZOverlaySystem()
});

// Overlay erstellen
const overlayEntity = scene.createEntity();
scene.getComponentStore<XYZOverlayComponent>(XYZOverlayComponent.name)
  .add(overlayEntity, new XYZOverlayComponent({
    label: 'Camera Position',
    xyz: camera.position
  }));
```

## Orbital Camera Control

Eine Orbital Camera rotiert um einen Mittelpunkt - ideal für Objekt-Viewer.

### Setup

```typescript
import { OrbitalCameraControlSystem } from './engine';

// System registrieren
world.registerSystem({
  system: new OrbitalCameraControlSystem()
});

// TODO: Component definieren und verwenden
```

## Fixed Camera

Eine statische Kamera für bestimmte Ansichten:

```typescript
const cameraEntity = scene.createEntity();
scene.setActiveCameraEntity(cameraEntity);

const camera = new component3D.Camera3({
  fov: 45,
  near: 0.1,
  far: 100
});

// Isometrische Ansicht
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

Eine Kamera, die einem Objekt folgt:

### Custom System erstellen

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
        // Zielposition abrufen
        this.world.queryOne<component3D.Position3>(
          'Position3',
          follow.targetEntity,
          ({ component: targetPos }) => {
            // Kamera-Position interpolieren
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

### Verwendung

```typescript
// System registrieren
world.registerSystem({
  system: new FollowCameraSystem()
});

// Player Entity erstellen
const playerEntity = scene.createEntity();
const playerBox = new component3D.Box3({ color: [0, 1, 0, 1] });
playerBox.position = new component3D.Position3({ x: 0, y: 0, z: 0 });
scene.getComponentStore<component3D.Box3>(component3D.Box3.name)
  .add(playerEntity, playerBox);
scene.getComponentStore<component3D.Position3>(component3D.Position3.name)
  .add(playerEntity, playerBox.position);

// Kamera erstellen
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

Eine Kamera hinter dem Spieler mit Rotation:

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
        // Rotation mit A/D
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
            
            // Kamera-Position berechnen
            camPos.x = targetPos.x + Math.sin(this.currentAngle) * tpc.distance;
            camPos.y = targetPos.y + tpc.height;
            camPos.z = targetPos.z + Math.cos(this.currentAngle) * tpc.distance;
            
            // Kamera zum Ziel ausrichten
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

## Kamera zwischen Scenes wechseln

```typescript
// Scene 1: Gameplay mit Free Camera
const gameScene = world.createScene('GameScene');
const gameCameraEntity = gameScene.createEntity();
gameScene.setActiveCameraEntity(gameCameraEntity);
// ... Kamera setup

// Scene 2: Menu mit Fixed Camera
const menuScene = world.createScene('MenuScene');
const menuCameraEntity = menuScene.createEntity();
menuScene.setActiveCameraEntity(menuCameraEntity);
// ... Kamera setup

// Zwischen Scenes wechseln
function showMenu() {
  world.deactivateScene('GameScene');
  world.activateScene('MenuScene');
}

function showGame() {
  world.deactivateScene('MenuScene');
  world.activateScene('GameScene');
}
```

## Mehrere Kameras in einer Scene

Nur eine Kamera kann aktiv sein, aber man kann zwischen ihnen wechseln:

```typescript
const firstPersonCamera = scene.createEntity();
const thirdPersonCamera = scene.createEntity();

// Setup beide Kameras...

// Zwischen Kameras wechseln
function switchToFirstPerson() {
  scene.setActiveCameraEntity(firstPersonCamera);
}

function switchToThirdPerson() {
  scene.setActiveCameraEntity(thirdPersonCamera);
}
```

## Vollständiges Beispiel

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

// Test-Objekte
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
