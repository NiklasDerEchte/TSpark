# World & Scenes

## World

Eine **World** ist ein Top-Level-Container, der Scenes und Systems verwaltet.

### World erstellen

```typescript
const world = tspark.createWorld('MyWorld');
```

### Scenes verwalten

#### Scene erstellen

```typescript
const scene = world.createScene('MainScene');
```

Die erste erstellte Scene wird automatisch aktiviert.

#### Scene aktivieren/deaktivieren

```typescript
// Scene aktivieren
world.activateScene('MainScene');

// Scene deaktivieren
world.deactivateScene('MainScene');
```

Nur aktive Scenes werden gerendert und in Queries berücksichtigt.

#### Scene abrufen

```typescript
const scene = world.getScene('MainScene');
if (scene) {
  // Arbeite mit der Scene
}
```

#### Alle aktiven Scenes abrufen

```typescript
const activeScenes = world.getActiveScenes();
```

#### Scene entfernen

```typescript
const removed = world.removeScene('MainScene');
```

### Systems registrieren

Systems führen die Spiellogik aus. Es gibt zwei Arten:

#### Normal Systems

Werden jeden Frame aufgerufen:

```typescript
world.registerSystem({
  system: new FreeCameraControlSystem(),
  key: 'FreeCameraControl', // optional
  mode: 'normal' // default
});
```

#### Fixed Systems

Werden in festen Zeitintervallen aufgerufen (gut für Physik):

```typescript
world.registerSystem({
  system: new PhysicsSystem(),
  mode: 'fixed'
});
```

### System abrufen

```typescript
const system = world.getSystem<FreeCameraControlSystem>('FreeCameraControl');
if (system) {
  // Arbeite mit dem System
}
```

### System entfernen

```typescript
const removed = world.removeSystem('FreeCameraControl');
```

### Queries

Queries ermöglichen es, über alle aktiven Scenes nach Components zu suchen.

#### Alle Entities mit einem Component abfragen

```typescript
world.query<Position3>('Position3', ({ scene, entity, component }) => {
  console.log(`Entity ${entity} in Scene ${scene.getName()}`);
  console.log(`Position: ${component.x}, ${component.y}, ${component.z}`);
});
```

#### Spezifische Entity abfragen

```typescript
world.queryOne<Position3>('Position3', entityId, ({ scene, entity, component }) => {
  component.x += 1;
});
```

## Scene

Eine **Scene** ist eine Sammlung von Entities und ihren Components.

### Entity erstellen

```typescript
const entity = scene.createEntity();
```

Jede Entity erhält eine eindeutige ID.

### Entity entfernen

```typescript
scene.destroyEntity(entity);
```

Dies entfernt die Entity und alle zugehörigen Components.

### Aktive Kamera setzen

Jede Scene benötigt eine aktive Kamera zum Rendern:

```typescript
const cameraEntity = scene.createEntity();
scene.setActiveCameraEntity(cameraEntity);

const camera = new component3D.Camera3();
scene.getComponentStore<component3D.Camera3>(component3D.Camera3.name)
  .add(cameraEntity, camera);
```

### Aktive Kamera abrufen

```typescript
const cameraEntity = scene.getActiveCameraEntity();
```

### Component Store verwenden

Components werden in ComponentStores gespeichert:

```typescript
// Component Store abrufen (wird automatisch erstellt, wenn nicht vorhanden)
const positionStore = scene.getComponentStore<Position3>(component3D.Position3.name);

// Component hinzufügen
positionStore.add(entity, new component3D.Position3({ x: 0, y: 0, z: 5 }));

// Component abrufen
const position = positionStore.get(entity);

// Component entfernen
positionStore.remove(entity);

// Prüfen, ob Entity ein Component hat
const hasPosition = positionStore.has(entity);

// Über alle Components iterieren
for (const [entity, component] of positionStore.entries()) {
  console.log(entity, component);
}
```

### Scene Name abrufen

```typescript
const name = scene.getName();
```

## Beispiel: Komplette World Setup

```typescript
import { TSpark } from './app';
import { DefaultRenderer, component3D } from './engine';

// TSpark initialisieren
const tspark = new TSpark({
  renderer: new DefaultRenderer(),
  size: { height: 600, width: 800 },
});

// World erstellen
const world = tspark.createWorld('GameWorld');

// Systems registrieren
world.registerSystem({ system: new FreeCameraControlSystem() });
world.registerSystem({ system: new RotationSystem() });

// Hauptszene erstellen
const mainScene = world.createScene('MainScene');

// Kamera erstellen
const cameraEntity = mainScene.createEntity();
mainScene.setActiveCameraEntity(cameraEntity);
const camera = new component3D.Camera3();
camera.position = new component3D.Position3({ z: 15 });
mainScene.getComponentStore<component3D.Camera3>(component3D.Camera3.name)
  .add(cameraEntity, camera);

// Spielobjekte erstellen
const boxEntity = mainScene.createEntity();
const box = new component3D.Box3();
box.position = new component3D.Position3();
mainScene.getComponentStore<component3D.Box3>(component3D.Box3.name)
  .add(boxEntity, box);

// Optional: Weitere Scene erstellen
const menuScene = world.createScene('MenuScene');
world.deactivateScene('MenuScene'); // Deaktivieren bis benötigt

// Engine starten
tspark.start();
```

## Best Practices

1. **Scene-Organisation**: Nutze verschiedene Scenes für unterschiedliche Spielzustände (Menu, Game, Pause)
2. **System-Scope**: Registriere Systems auf World-Ebene, nicht in Scenes
3. **Query-Effizienz**: Nutze spezifische Component-Keys für effiziente Queries
4. **Entity Cleanup**: Vergiss nicht, Entities zu zerstören, wenn sie nicht mehr benötigt werden
5. **Kamera-Management**: Jede Scene benötigt eine aktive Kamera zum Rendern
