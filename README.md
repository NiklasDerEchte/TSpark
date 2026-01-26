# TSpark Engine

TSpark is a lightweight and modular 2D and 3D game engine written in TypeScript, using WebGL (via TWGL.js) for rendering. It follows an Entity-Component-System (ECS) approach to make game logic flexible and extensible.

## ✨ Features

- **ECS Architecture:** Organize your game objects cleanly with entities, components, and systems.
- **2D & 3D Rendering:** Based on `TWGL.js`, a lightweight WebGL helper, for performant rendering.
- **Modular Systems:** Add logic like movement, physics, or AI through standalone systems.
- **Simple Scene Management:** Create and manage multiple worlds and scenes.
- **Flexible Component System:** Define your own data containers for your entities.
- **Dynamic Render System:** Easily switch between different rendering layers.

## 🚀 Getting Started

1.  **Install dependencies:**
    ```bash
    npm install
    ```

2.  **Start development server:**
    ```bash
    npm run tspark:dev
    ```
    This starts a Vite server that serves the examples under `src/examples`.

## 🎬 Demo

Here is a brief demonstration of the stress test, rendering and rotating several hundred cubes simultaneously.

![TSpark Stress Test](docs/res/stress-test-17_1.gif)

Example of free camera controls in a 3D editor space.

![TSpark Stress Test](docs/res/editor-space_26_1.gif)

## 📚 Documentation

- **API Documentation:** Run `npm run docs:dev` to start the documentation server
- **Type Documentation:** Generated with TypeDoc at `docs/api/`
- **Examples:** Check out the `src/examples` directory for working examples

## 🏗️ Architecture

TSpark follows a clean Entity-Component-System architecture:

- **Entities:** Unique identifiers for game objects
- **Components:** Data containers that can be attached to entities
- **Systems:** Logic processors that operate on entities with specific components
- **Worlds:** Top-level containers that manage scenes
- **Scenes:** Collections of entities within a world

## 🎮 Core Features

### Rendering
- **WebGL Rendering:** Powered by TWGL.js for efficient 2D and 3D rendering

### Camera Systems
- **Free Camera Controls:** WASD movement with mouse look

### Built-in Systems
- **Rotation System:** Manage entity rotations

## 📖 Usage Example

```typescript
import { TSpark } from './app';
import { DefaultRenderer, World, component3D } from './engine';

// Initialize the engine
const tspark = new TSpark({
  renderer: new DefaultRenderer(),
  size: { height: 600, width: 800 },
});

// Create a world and scene
const world = tspark.createWorld('MyWorld');
const scene = world.createScene('MyScene');

// Create a camera
const cameraEntity = scene.createEntity();
scene.setActiveCameraEntity(cameraEntity);
const camera = new component3D.Camera3();
camera.position = new component3D.Position3({z: 15});
scene.getComponentStore<component3D.Camera3>(component3D.Camera3.name)
  .add(cameraEntity, camera);

// Create a 3D box
const boxEntity = scene.createEntity();
const box = new component3D.Box3();
box.position = new component3D.Position3();
scene.getComponentStore<component3D.Box3>(component3D.Box3.name)
  .add(boxEntity, box);

// Start the engine
tspark.start();
```

## 🛠️ Available Scripts

- `npm run tspark:dev` - Start development server with hot reload
- `npm run tspark:build` - Build for production
- `npm run docs:api` - Generate API documentation with TypeDoc
- `npm run docs:dev` - Start documentation development server
- `npm run docs:build` - Build documentation for production

## 📁 Project Structure

```
TSpark/
├── src/
│   ├── engine/           # Core engine code
│   │   ├── core/         # Core systems (ECS, rendering, game loop)
│   │   └── features/     # Feature systems (camera, input, movement)
│   ├── examples/         # Example projects
│   │   ├── simple-player/   # Basic 3D example
│   │   ├── editor-world/    # Editor example
│   │   └── twgl/            # WebGL examples
│   └── app.ts            # Main TSpark class
├── public/               # Static assets (shaders, fonts, models)
├── docs/                 # Documentation files
└── index.html            # Entry point
```

## 🔧 Technologies

- **TypeScript** - Type-safe development
- **TWGL.js** - WebGL helper library
- **Vite** - Fast build tool and dev server
- **TypeDoc** - API documentation generation
- **VitePress** - Documentation site

## 🤝 Contributing

Contributions are welcome! Feel free to open issues or submit pull requests.

## 📄 License

MIT