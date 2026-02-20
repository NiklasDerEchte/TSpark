# TSpark Engine

TSpark is a lightweight and modular 2D and 3D game engine written in TypeScript, using WebGL (via TWGL.js) for rendering. It follows an Entity-Component-System (ECS) approach to make game logic flexible and extensible.

## ✨ Features

- **ECS Architecture:** Organize your game objects cleanly with entities, components, and systems
- **2D & 3D Rendering:** Based on TWGL.js, a lightweight WebGL helper, for performant rendering
- **Modular Systems:** Add logic like movement, physics, or AI through standalone systems
- **Simple Scene Management:** Create and manage multiple worlds and scenes
- **Flexible Component System:** Define your own data containers for your entities
- **Dynamic Render System:** Easily switch between different rendering layers
- **TypeScript First:** Full type safety and IntelliSense support

## 📚 Documentation

**[Read the full documentation →](https://your-docs-url.com)**

- **[Getting Started](docs/getting-started.md)** - Quick start guide
- **[Core Concepts](docs/core-concepts.md)** - Understanding ECS architecture
- **[Guide](docs/guide/)** - Comprehensive guides on World, Scenes, Systems, and more
- **[Examples](docs/examples/)** - Practical examples and tutorials
- **[API Reference](docs/api/)** - Complete API documentation

## 🚀 Quick Start

### Installation

```bash
npm install
```

### Run Development Server

```bash
npm run tspark:dev
```

This starts a Vite server that serves the examples under `src/examples`.

### Your First Scene

```typescript
import { TSpark } from './app';
import { DefaultRenderer, component3D } from './engine';

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
camera.position = new component3D.Position3({ z: 15 });
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

## 🎬 Demo

Here is a brief demonstration of the stress test, rendering and rotating several hundred cubes simultaneously.

![TSpark Stress Test](docs/res/stress-test-17_1.gif)

Example of free camera controls in a 3D editor space.

![TSpark Free Camera](docs/res/editor-space_26_1.gif)

## 🏗️ Architecture

TSpark follows a clean Entity-Component-System architecture:

- **Entities:** Unique identifiers for game objects
- **Components:** Data containers that can be attached to entities
- **Systems:** Logic processors that operate on entities with specific components
- **Worlds:** Top-level containers that manage scenes and systems
- **Scenes:** Collections of entities within a world

```
TSpark
  └── World(s)
       ├── Scene(s)
       │    ├── Entity
       │    │    └── Component(s)
       │    └── ComponentStore
       └── System(s)
```

**[Learn more about ECS →](docs/core-concepts.md)**
�️ Available Scripts

| Script | Description |
|--------|-------------|
| `npm run tspark:dev` | Start development server with hot reload |
| `npm run tspark:build` | Build for production |
| `npm run docs:dev` | Start documentation development server |
| `npm run docs:build` | Build documentation for production |
| `npm run docs:api` | Generate API documentation with TypeDoc |

## 📁 Project Structure

```
TSpark/
├── src/
│   ├── engine/              # Core engine code
│   │   ├── core/            # Core systems (ECS, rendering, game loop)
│   │   │   ├── renderer/    # Rendering backend and layers
│   │   │   ├── types/       # TypeScript type definitions
│   │   │   └── utils/       # Utility functions
│   │   └── features/        # Feature systems (camera, input, movement)
│   ├── examples/            # Example projects
│   │   ├── simple-player/   # Basic 3D example
│   │   ├── editor-world/    # Editor example with camera controls
│   │   └── twgl/            # WebGL rendering examples
│   └── app.ts               # Main TSpark class
├── public/                  # Static assets
│   ├── shader/              # GLSL shader files
│   ├── fonts/               # Bitmap and SDF fonts
│   ├── models/              # 3D model files
│   └── ui/                  # HTML/CSS UI overlays
├── docs/                    # Documentation
│   ├── guide/               # User guides
│   ├── examples/            # Example tutorials
│   ├── api/                 # Auto-generated API docs
│   └── .vitepress/          # VitePress configuration
└── index.html               # Entry point
```

## 🔧 Technologies

- **[TypeScript](https://www.typescriptlang.org/)** - Type-safe development
- **[TWGL.js](https://twgljs.org/)** - WebGL helper library
- **[Vite](https://vitejs.dev/)** - Fast build tool and dev server
- **[TypeDoc](https://typedoc.org/)** - API documentation generation
- **[VitePress](https://vitepress.dev/)** - Documentation site generator
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

MI# Development Workflow

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Test your changes thoroughly
5. Commit your changes (`git commit -m 'Add amazing feature'`)
6. Push to the branch (`git push origin feature/amazing-feature`)
7. Open a Pull Request

## 📄 License

MIT - See [LICENSE](LICENSE) file for details

## 🔗 Links

- **[Documentation](https://your-docs-url.com)** - Full documentation
- **[Examples](src/examples/)** - Example projects
- **[API Reference](docs/api/)** - Auto-generated API docs
- **[Issues](https://github.com/yourusername/tspark/issues)** - Bug reports and feature requests

---

Made with ❤️ by the TSpark team