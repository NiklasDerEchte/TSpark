# Getting Started

TSpark ist ein leichtgewichtiges, modulares 2D- und 3D-Game-Engine-Framework, das auf TypeScript und WebGL basiert. Es verwendet eine Entity-Component-System (ECS) Architektur für flexible und erweiterbare Spiellogik.

## Installation

Installiere zunächst alle Abhängigkeiten:

```bash
npm install
```

## Schnellstart

### 1. TSpark initialisieren

```typescript
import { TSpark } from './app';
import { DefaultRenderer } from './engine';

const tspark = new TSpark({
  renderer: new DefaultRenderer(),
  size: { height: 600, width: 800 },
});
```

### 2. World und Scene erstellen

```typescript
const world = tspark.createWorld('MyWorld');
const scene = world.createScene('MyScene');
```

### 3. Kamera hinzufügen

```typescript
import { component3D } from './engine';

const cameraEntity = scene.createEntity();
scene.setActiveCameraEntity(cameraEntity);

const camera = new component3D.Camera3();
camera.position = new component3D.Position3({ z: 15 });
scene.getComponentStore<component3D.Camera3>(component3D.Camera3.name)
  .add(cameraEntity, camera);
```

### 4. 3D Box erstellen

```typescript
const boxEntity = scene.createEntity();
const box = new component3D.Box3();
box.position = new component3D.Position3();
scene.getComponentStore<component3D.Box3>(component3D.Box3.name)
  .add(boxEntity, box);
```

### 5. Engine starten

```typescript
tspark.start();
```

## Entwicklungsserver starten

```bash
npm run tspark:dev
```

Der Entwicklungsserver startet einen Vite-Server, der die Beispiele unter `src/examples` bereitstellt.

## Nächste Schritte

- [Core Concepts](/core-concepts) - Verstehe die ECS-Architektur
- [World & Scenes](/guide/world-and-scenes) - Lerne mehr über Worlds und Scenes
- [Entities & Components](/guide/entities-and-components) - Arbeite mit Entities und Components
- [Systems](/guide/systems) - Erstelle eigene Systems
- [Beispiele](/examples/simple-scene) - Schaue dir praktische Beispiele an
