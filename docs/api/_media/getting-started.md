# Getting Started

TSpark is a lightweight, modular 2D and 3D game engine framework built on TypeScript and WebGL. It uses an Entity-Component-System (ECS) architecture for flexible and extensible game logic.

## Installation

First, install all dependencies:

```bash
npm install
```

## Quick Start

### 1. TSpark initialisieren

```typescript
import { TSpark } from './app';
import { DefaultRenderer } from './engine';

const tspark = new TSpark({
  renderer: new DefaultRenderer(),
  size: { height: 600, width: 800 },
});
```

### 2. Create World and Scene

```typescript
const world = tspark.createWorld('MyWorld');
const scene = world.createScene('MyScene');
```

### 3. Add Camera

```typescript
import { component3D } from './engine';

const cameraEntity = scene.createEntity();
scene.setActiveCameraEntity(cameraEntity);

const camera = new component3D.Camera3();
camera.position = new component3D.Position3({ z: 15 });
scene.getComponentStore<component3D.Camera3>(component3D.Camera3.name)
  .add(cameraEntity, camera);
```

### 4. Create 3D Box

```typescript
const boxEntity = scene.createEntity();
const box = new component3D.Box3();
box.position = new component3D.Position3();
scene.getComponentStore<component3D.Box3>(component3D.Box3.name)
  .add(boxEntity, box);
```

### 5. Start the Engine

```typescript
tspark.start();
```

## Start Development Server

```bash
npm run tspark:dev
```

The development server starts a Vite server that serves the examples from `src/examples`.

## Next Steps

- [Core Concepts](/core-concepts) - Understand the ECS architecture
- [World & Scenes](/guide/world-and-scenes) - Learn more about Worlds and Scenes
- [Entities & Components](/guide/entities-and-components) - Work with Entities and Components
- [Systems](/guide/systems) - Create your own Systems
- [Examples](/examples/simple-scene) - Check out practical examples
