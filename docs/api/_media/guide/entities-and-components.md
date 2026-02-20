# Entities & Components

## Entities

Entities sind eindeutige Identifikatoren (Strings) für Spielobjekte. Sie haben selbst keine Daten oder Logik, sondern dienen nur als Container für Components.

### Entity erstellen

```typescript
const entity = scene.createEntity();
```

TSpark generiert automatisch eine eindeutige ID für jede Entity.

### Entity entfernen

```typescript
scene.destroyEntity(entity);
```

Dies entfernt die Entity und alle zugehörigen Components aus allen ComponentStores automatisch.

## Components

Components sind reine Datencontainer ohne Logik. Sie werden Entities zugeordnet und definieren deren Eigenschaften.

### Eingebaute 3D Components

#### Position3

Definiert die Position einer Entity im 3D-Raum:

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

Definiert die Rotation einer Entity (in Radians):

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

Definiert die Skalierung einer Entity:

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

Definiert eine 3D-Kamera:

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

Definiert eine 3D-Box:

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

Lädt ein 3D-Modell aus einer Datei:

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

### Eigene Components erstellen

Components sind einfache TypeScript-Klassen:

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

// Verwendung
const velocity = new VelocityComponent({ x: 1, y: 0, z: 0 });
scene.getComponentStore<VelocityComponent>(VelocityComponent.name)
  .add(entity, velocity);
```

### Best Practices für Components

1. **Nur Daten**: Components sollten nur Daten enthalten, keine Logik
2. **Kleine Components**: Lieber mehrere kleine Components als ein großes
3. **Properties**: Nutze `Partial<T>` im Constructor für optionale Initialisierung
4. **Typisierung**: Nutze TypeScript-Typen für bessere IDE-Unterstützung

### ComponentStore

ComponentStores verwalten alle Components eines bestimmten Typs.

#### Component hinzufügen

```typescript
const store = scene.getComponentStore<Position3>(component3D.Position3.name);
store.add(entity, new component3D.Position3({ x: 5 }));
```

#### Component abrufen

```typescript
const position = store.get(entity);
if (position) {
  console.log(position.x, position.y, position.z);
}
```

#### Component aktualisieren

```typescript
const position = store.get(entity);
if (position) {
  position.x += 1;
  position.y += 1;
}
```

#### Component entfernen

```typescript
store.remove(entity);
```

#### Prüfen, ob Entity Component hat

```typescript
if (store.has(entity)) {
  // Entity hat diesen Component
}
```

#### Über alle Components iterieren

```typescript
for (const [entity, component] of store.entries()) {
  console.log(entity, component);
}
```

## Beispiel: Komplettes Spielobjekt

```typescript
// Entity erstellen
const playerEntity = scene.createEntity();

// Position
const position = new component3D.Position3({ x: 0, y: 0, z: 0 });
scene.getComponentStore<component3D.Position3>(component3D.Position3.name)
  .add(playerEntity, position);

// Rotation
const rotation = new component3D.Rotation3({ x: 0, y: 0, z: 0 });
scene.getComponentStore<component3D.Rotation3>(component3D.Rotation3.name)
  .add(playerEntity, rotation);

// Geschwindigkeit (custom component)
const velocity = new VelocityComponent({ x: 0, y: 0, z: 0 });
scene.getComponentStore<VelocityComponent>(VelocityComponent.name)
  .add(playerEntity, velocity);

// Visuelle Darstellung
const box = new component3D.Box3({
  width: 1,
  height: 2,
  depth: 1,
  color: [0, 0, 1, 1] // Blau
});
box.position = position;
box.rotation = rotation;
scene.getComponentStore<component3D.Box3>(component3D.Box3.name)
  .add(playerEntity, box);
```

## Component Composition

Die Stärke von ECS liegt in der Kombination von Components:

```typescript
// Einfache Box (nur visuelle Darstellung)
const visualEntity = scene.createEntity();
scene.getComponentStore<component3D.Box3>(component3D.Box3.name)
  .add(visualEntity, new component3D.Box3());

// Box mit Rotation
const rotatingEntity = scene.createEntity();
scene.getComponentStore<component3D.Box3>(component3D.Box3.name)
  .add(rotatingEntity, new component3D.Box3());
scene.getComponentStore<RotationLoop>(RotationLoop.name)
  .add(rotatingEntity, new RotationLoop());

// Vollständiges Spielobjekt mit allen Features
const fullEntity = scene.createEntity();
scene.getComponentStore<component3D.Box3>(component3D.Box3.name)
  .add(fullEntity, new component3D.Box3());
scene.getComponentStore<VelocityComponent>(VelocityComponent.name)
  .add(fullEntity, new VelocityComponent());
scene.getComponentStore<RotationLoop>(RotationLoop.name)
  .add(fullEntity, new RotationLoop());
```

Components können flexibel kombiniert werden, um unterschiedliches Verhalten zu erreichen.
