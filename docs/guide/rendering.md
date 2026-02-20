# Rendering

TSpark uses a flexible rendering system that supports different backend renderers.

## Renderer Architecture

Rendering in TSpark consists of multiple layers:

```
RendererBackend
  └── RenderLayer(s)
       └── Sub-Renderer(s)
```

## Default Renderer

The `DefaultRenderer` is a WebGL-based renderer with TWGL.js:

```typescript
import { TSpark } from './app';
import { DefaultRenderer } from './engine';

const tspark = new TSpark({
  renderer: new DefaultRenderer({
    enableCullFace: false,
    backgroundColor: [0.1, 0.1, 0.1, 1] // RGBA
  }),
  size: { height: 600, width: 800 }
});
```

### Options

```typescript
interface DefaultRendererOptions {
  enableCullFace?: boolean;      // Enable face culling (default: true)
  backgroundColor?: number[];     // Background color RGBA (default: [0, 0, 0, 1])
}
```

## Render Layers

Render Layers process different types of rendering:

### 3D Forward Renderer

Renders 3D objects:

```typescript
// Automatically used by DefaultRenderer
// Renders: Box3, Model3, etc.
```

### 2D Renderer

Renders 2D sprites and text:

```typescript
// SDF Text Rendering
// Glyph Rendering
// Sprite Rendering
```

### Editor Grid

Visual aid for development:

```typescript
const tspark = new TSpark({
  renderer: new DefaultRenderer({
    enableEditorGrid: true  // Shows grid in 3D space
  })
});
```

## Camera Setup

Each Scene needs an active camera for rendering:

### Perspective Camera

```typescript
const camera = new component3D.Camera3({
  fov: 60,          // Field of View in Grad
  near: 0.1,        // Near Clipping Plane
  far: 1000,        // Far Clipping Plane
  aspect: 16 / 9    // Aspect Ratio (optional, wird automatisch berechnet)
});

camera.position = new component3D.Position3({ x: 0, y: 0, z: 15 });
camera.rotation = new component3D.Rotation3({ x: 0, y: 0, z: 0 });

const cameraEntity = scene.createEntity();
scene.getComponentStore<component3D.Camera3>(component3D.Camera3.name)
  .add(cameraEntity, camera);
scene.setActiveCameraEntity(cameraEntity);
```

## Rendering 3D Objects

### Box3

Simple 3D box:

```typescript
const box = new component3D.Box3({
  width: 1,
  height: 1,
  depth: 1,
  color: [1, 0, 0, 1] // Red (RGBA)
});

box.position = new component3D.Position3({ x: 0, y: 0, z: 0 });
box.rotation = new component3D.Rotation3({ x: 0, y: 0, z: 0 });
box.scale = new component3D.Scale3({ x: 1, y: 1, z: 1 });

scene.getComponentStore<component3D.Box3>(component3D.Box3.name)
  .add(entity, box);
```

### Model3

3D model loaded from file:

```typescript
const model = new component3D.Model3({
  path: '/models/spaceship.obj',
  color: [1, 1, 1, 1]
});

model.position = new component3D.Position3({ x: 0, y: 0, z: 0 });
model.rotation = new component3D.Rotation3({ x: 0, y: 0, z: 0 });
model.scale = new component3D.Scale3({ x: 1, y: 1, z: 1 });

scene.getComponentStore<component3D.Model3>(component3D.Model3.name)
  .add(entity, model);
```

Supported formats:
- `.obj` (Wavefront OBJ)

## 2D Rendering

### SDF Text

Signed Distance Field Text for sharp text at any size:

```typescript
import { component2D } from './engine';

const text = new component2D.SDFText({
  text: 'Hello TSpark!',
  font: '/fonts/roboto/roboto-sdf.fnt',
  size: 24,
  color: [1, 1, 1, 1]
});

text.position = new component2D.Position2({ x: 100, y: 100 });

scene.getComponentStore<component2D.SDFText>(component2D.SDFText.name)
  .add(entity, text);
```

### Glyph Rendering

Bitmap Font Rendering:

```typescript
const text = new component2D.GlyphText({
  text: 'Score: 100',
  font: '/fonts/arial/arial.fnt',
  color: [1, 1, 1, 1]
});

text.position = new component2D.Position2({ x: 50, y: 50 });

scene.getComponentStore<component2D.GlyphText>(component2D.GlyphText.name)
  .add(entity, text);
```

## Shader

TSpark verwendet benutzerdefinierte Shader für das Rendering:

### Shader-Dateien

Shader befinden sich in `public/shader/`:

#### 3D Shaders
- `base-color-vertex.glsl` / `base-color-fragment.glsl` - Einfaches Color Rendering
- `texture-vertex.glsl` / `texture-fragment.glsl` - Texture Rendering

#### 2D UI Shaders
- `ui-base-color-vertex.glsl` / `ui-base-color-fragment.glsl` - 2D Color Rendering
- `ui-texture-vertex.glsl` / `ui-texture-fragment.glsl` - 2D Texture Rendering
- `sdf-vertex.glsl` / `sdf-fragment.glsl` - SDF Text Rendering

#### Utility Shaders
- `editor-grid-vertex.glsl` / `editor-grid-fragment.glsl` - Editor Grid
- `infinite-grid-vertex.glsl` / `infinite-grid-fragment.glsl` - Infinite Grid

### Custom Shader Creation

```glsl
// custom-vertex.glsl
attribute vec4 position;
uniform mat4 u_matrix;

void main() {
  gl_Position = u_matrix * position;
}
```

```glsl
// custom-fragment.glsl
precision mediump float;
uniform vec4 u_color;

void main() {
  gl_FragColor = u_color;
}
```

## Performance Tips

### Culling

Enable face culling for better performance:

```typescript
const tspark = new TSpark({
  renderer: new DefaultRenderer({
    enableCullFace: true
  })
});
```

### Batching

Similar objects are automatically batched for better performance.

### LOD (Level of Detail)

For large scenes, different detail levels can be used (currently not implemented).

## HTML Overlay

TSpark unterstützt HTML-Overlays für UI:

```typescript
await tspark.inject({
  html: ['/ui/fps-overlay/overlay.html'],
  css: ['/ui/fps-overlay/overlay.css']
});
```

### Custom HTML Overlays

```html
<!-- overlay.html -->
<div id="my-overlay">
  <h1>Game Title</h1>
  <button id="start-button">Start</button>
</div>
```

```css
/* overlay.css */
#my-overlay {
  position: absolute;
  top: 10px;
  left: 10px;
  color: white;
  font-family: Arial, sans-serif;
}
```

```typescript
// System for overlay interaction
export class MyOverlaySystem implements System {
  world!: World;
  
  init(world: World): void {
    this.world = world;
    
    const button = document.getElementById('start-button');
    button?.addEventListener('click', () => {
      console.log('Start button clicked!');
    });
  }
  
  exec(deltaTimeMs: number): void {
    // Update overlay based on game state
  }
  
  destroy(): void {
    const button = document.getElementById('start-button');
    button?.removeEventListener('click', this.handleClick);
  }
}
```

## Canvas Configuration

### Custom Canvas

```typescript
const canvas = document.getElementById('my-canvas') as HTMLCanvasElement;

const tspark = new TSpark({
  renderer: new DefaultRenderer(),
  canvas: canvas,
  size: { height: 600, width: 800 }
});
```

### Auto-Resize

```typescript
function resizeCanvas() {
  const canvas = document.getElementById('tspark-canvas') as HTMLCanvasElement;
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}

window.addEventListener('resize', resizeCanvas);
resizeCanvas();
```

## Example: Complete Render Setup

```typescript
import { TSpark } from './app';
import { DefaultRenderer, component3D } from './engine';

// Configure renderer
const tspark = new TSpark({
  renderer: new DefaultRenderer({
    enableCullFace: true,
    backgroundColor: [0.2, 0.2, 0.3, 1]
  }),
  size: { height: 720, width: 1280 }
});

// World and Scene
const world = tspark.createWorld('RenderWorld');
const scene = world.createScene('MainScene');

// Kamera
const cameraEntity = scene.createEntity();
const camera = new component3D.Camera3({
  fov: 75,
  near: 0.1,
  far: 500
});
camera.position = new component3D.Position3({ z: 10 });
scene.getComponentStore<component3D.Camera3>(component3D.Camera3.name)
  .add(cameraEntity, camera);
scene.setActiveCameraEntity(cameraEntity);

// 3D Objects
for (let i = 0; i < 10; i++) {
  const entity = scene.createEntity();
  const box = new component3D.Box3({
    color: [Math.random(), Math.random(), Math.random(), 1]
  });
  box.position = new component3D.Position3({
    x: (Math.random() - 0.5) * 10,
    y: (Math.random() - 0.5) * 10,
    z: (Math.random() - 0.5) * 10
  });
  scene.getComponentStore<component3D.Box3>(component3D.Box3.name)
    .add(entity, box);
}

// Start engine
tspark.start();
```
