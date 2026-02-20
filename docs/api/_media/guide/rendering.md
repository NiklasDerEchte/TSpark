# Rendering

TSpark verwendet ein flexibles Rendering-System, das verschiedene Backend-Renderer unterstützt.

## Renderer-Architektur

Das Rendering in TSpark besteht aus mehreren Ebenen:

```
RendererBackend
  └── RenderLayer(s)
       └── Sub-Renderer(s)
```

## Default Renderer

Der `DefaultRenderer` ist ein WebGL-basierter Renderer mit TWGL.js:

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

### Optionen

```typescript
interface DefaultRendererOptions {
  enableCullFace?: boolean;      // Face Culling aktivieren (default: true)
  backgroundColor?: number[];     // Hintergrundfarbe RGBA (default: [0, 0, 0, 1])
}
```

## Render Layers

Render Layers verarbeiten verschiedene Arten von Rendering:

### 3D Forward Renderer

Rendert 3D-Objekte:

```typescript
// Automatisch vom DefaultRenderer verwendet
// Rendert: Box3, Model3, etc.
```

### 2D Renderer

Rendert 2D-Sprites und Text:

```typescript
// SDF Text Rendering
// Glyph Rendering
// Sprite Rendering
```

### Editor Grid

Visuelles Hilfsmittel für die Entwicklung:

```typescript
const tspark = new TSpark({
  renderer: new DefaultRenderer({
    enableEditorGrid: true  // Zeigt Grid im 3D-Raum
  })
});
```

## Kamera-Setup

Jede Scene benötigt eine aktive Kamera zum Rendern:

### Perspektivische Kamera

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

## 3D Objekte rendern

### Box3

Einfache 3D-Box:

```typescript
const box = new component3D.Box3({
  width: 1,
  height: 1,
  depth: 1,
  color: [1, 0, 0, 1] // Rot (RGBA)
});

box.position = new component3D.Position3({ x: 0, y: 0, z: 0 });
box.rotation = new component3D.Rotation3({ x: 0, y: 0, z: 0 });
box.scale = new component3D.Scale3({ x: 1, y: 1, z: 1 });

scene.getComponentStore<component3D.Box3>(component3D.Box3.name)
  .add(entity, box);
```

### Model3

3D-Modell aus Datei laden:

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

Unterstützte Formate:
- `.obj` (Wavefront OBJ)

## 2D Rendering

### SDF Text

Signed Distance Field Text für scharfe Schrift bei jeder Größe:

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

### Custom Shader erstellen

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

## Performance-Tipps

### Culling

Face Culling aktivieren für bessere Performance:

```typescript
const tspark = new TSpark({
  renderer: new DefaultRenderer({
    enableCullFace: true
  })
});
```

### Batching

Ähnliche Objekte werden automatisch gebatcht für bessere Performance.

### LOD (Level of Detail)

Für große Szenen können verschiedene Detail-Stufen verwendet werden (aktuell nicht implementiert).

## HTML Overlay

TSpark unterstützt HTML-Overlays für UI:

```typescript
await tspark.inject({
  html: ['/ui/fps-overlay/overlay.html'],
  css: ['/ui/fps-overlay/overlay.css']
});
```

### Eigene HTML-Overlays

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
// System für Overlay-Interaktion
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
    // Update overlay basierend auf Game State
  }
  
  destroy(): void {
    const button = document.getElementById('start-button');
    button?.removeEventListener('click', this.handleClick);
  }
}
```

## Canvas-Konfiguration

### Custom Canvas

```typescript
const canvas = document.getElementById('my-canvas') as HTMLCanvasElement;

const tspark = new TSpark({
  renderer: new DefaultRenderer(),
  canvas: canvas,
  size: { height: 600, width: 800 }
});
```

### Auto-Größenanpassung

```typescript
function resizeCanvas() {
  const canvas = document.getElementById('tspark-canvas') as HTMLCanvasElement;
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}

window.addEventListener('resize', resizeCanvas);
resizeCanvas();
```

## Beispiel: Vollständiges Render-Setup

```typescript
import { TSpark } from './app';
import { DefaultRenderer, component3D } from './engine';

// Renderer konfigurieren
const tspark = new TSpark({
  renderer: new DefaultRenderer({
    enableCullFace: true,
    backgroundColor: [0.2, 0.2, 0.3, 1]
  }),
  size: { height: 720, width: 1280 }
});

// World und Scene
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

// 3D Objekte
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

// Engine starten
tspark.start();
```
