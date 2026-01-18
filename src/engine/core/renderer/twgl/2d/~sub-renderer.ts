import { component2D, type SubRendererBackend } from "../../../types";
import type { Scene } from "../../../world";
import type { TwglRenderEnvironment } from "../environment";
import * as twgljs from 'twgl.js';
import * as opentype from 'opentype.js';

/**
 * @deprecated Diese Klasse ist veraltet, sie ist zwar in der Lage Text zu Zeichnen aber nur sehr hässlich. glyph-sub-renderer oder ein sdf renderer sollen diesen hier ersetzen
 */
export class Sub2DRenderer implements SubRendererBackend {

  private fontAtlas: { font: opentype.Font } | undefined;
  private environment!: TwglRenderEnvironment;
  private gl: WebGLRenderingContext;

  constructor(gl: WebGLRenderingContext, environment: TwglRenderEnvironment) {
    this.gl = gl;
    this.environment = environment;
  }

  async loadFont(url: string) {
    try {
      const font = await opentype.load(url);
      this.fontAtlas = { font: font };
      console.log(`[twgl] Font "${font.names.fullName.en}" loaded.`);
    } catch (error) {
      console.error(`[twgl] Failed to load font: ${error}`);
    }
  }

  draw(scenes: Scene[]) {
    this.gl.disable(this.gl.DEPTH_TEST);

    scenes.forEach((scene: Scene) => {
      const orthoProjection = twgljs.m4.ortho(0, this.gl.canvas.width, this.gl.canvas.height, 0, -1, 1);

      for (const [entity, rect] of scene.getComponentStore<component2D.Rect2D>(component2D.Rect2D.name).entries()) {
        // Hier würde die Logik zum Zeichnen eines farbigen Rechtecks hinkommen
      }

      for (const [entity, uiText] of scene.getComponentStore<component2D.UIText2>(component2D.UIText2.name).entries()) {
        this.drawText(uiText, orthoProjection);
      }
    });
  }

  drawText(uiText: component2D.UIText2, projectionMatrix: twgljs.m4.Mat4) {
    if (!this.fontAtlas) {
      console.error('No font loaded!');
      return;
    }

    const font = this.fontAtlas.font;
    const fontSize = uiText.size || 24;
    const color = uiText.color.toRgb();
    const x = uiText.rect.position.x;
    const y = uiText.rect.position.y;

    const scale = (1 / font.unitsPerEm) * fontSize;
    const ascender = font.ascender * scale;

    const path = font.getPath(uiText.text, x, y + ascender, fontSize);
    const triangles = this.tessellate(path);

    if (triangles.length === 0) {
      return;
    }

    const arrays = {
      a_position: {
        numComponents: 2,
        data: triangles,
      },
    };

    const bufferInfo = twgljs.createBufferInfoFromArrays(this.gl, arrays);

    this.gl.useProgram(this.environment.uiBaseColorProgramInfo.program);
    twgljs.setBuffersAndAttributes(this.gl, this.environment.uiBaseColorProgramInfo, bufferInfo);
    twgljs.setUniforms(this.environment.uiBaseColorProgramInfo, {
      u_color: [color.r / 255, color.g / 255, color.b / 255, color.a],
      u_projection: projectionMatrix,
    });
    twgljs.drawBufferInfo(this.gl, bufferInfo, this.gl.TRIANGLES);
  }

  private tessellate(path: opentype.Path): number[] {
    const triangles: number[] = [];
    let currentContour: { x: number; y: number }[] = [];

    for (const cmd of path.commands) {
      if (cmd.type === 'M') {
        if (currentContour.length > 2) {
          this.processContour(currentContour, triangles);
        }
        currentContour = [{ x: cmd.x, y: cmd.y }];
      } else if (cmd.type === 'L') {
        currentContour.push({ x: cmd.x, y: cmd.y });
      } else if (cmd.type === 'C') {
        // Approximate Bezier curve with line segments
        const p0 = currentContour[currentContour.length - 1];
        const p1 = { x: cmd.x1, y: cmd.y1 };
        const p2 = { x: cmd.x2, y: cmd.y2 };
        const p3 = { x: cmd.x, y: cmd.y };
        const steps = 10; // quality
        for (let i = 1; i <= steps; i++) {
          const t = i / steps;
          const x = (1 - t) ** 3 * p0.x + 3 * (1 - t) ** 2 * t * p1.x + 3 * (1 - t) * t ** 2 * p2.x + t ** 3 * p3.x;
          const y = (1 - t) ** 3 * p0.y + 3 * (1 - t) ** 2 * t * p1.y + 3 * (1 - t) * t ** 2 * p2.y + t ** 3 * p3.y;
          currentContour.push({ x, y });
        }
      } else if (cmd.type === 'Q') {
        // Approximate quadratic Bezier curve with line segments
        const p0 = currentContour[currentContour.length - 1];
        const p1 = { x: cmd.x1, y: cmd.y1 };
        const p2 = { x: cmd.x, y: cmd.y };
        const steps = 10; // quality
        for (let i = 1; i <= steps; i++) {
          const t = i / steps;
          const x = (1 - t) ** 2 * p0.x + 2 * (1 - t) * t * p1.x + t ** 2 * p2.x;
          const y = (1 - t) ** 2 * p0.y + 2 * (1 - t) * t * p1.y + t ** 2 * p2.y;
          currentContour.push({ x, y });
        }
      } else if (cmd.type === 'Z') {
        if (currentContour.length > 0) {
          currentContour.push(currentContour[0]); // Close the path
        }
      }
    }
    if (currentContour.length > 2) {
      this.processContour(currentContour, triangles);
    }

    return triangles;
  }

  private processContour(contour: { x: number; y: number }[], triangles: number[]) {
    // Simple fan triangulation (works for convex polygons)
    const root = contour[0];
    for (let i = 1; i < contour.length - 1; i++) {
      const p1 = contour[i];
      const p2 = contour[i + 1];
      triangles.push(root.x, root.y, p1.x, p1.y, p2.x, p2.y);
    }
  }
}