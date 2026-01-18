import { component2D, type SubRendererBackend } from '../../../types';
import type { Scene } from '../../../world';
import type { TwglRenderEnvironment } from '../environment';
import * as twgljs from 'twgl.js';
import parseBMFont from 'parse-bmfont-ascii';

// TODO Der scheiß klappt iwie nicht, eventuell auf dem falschen canvas? muss vlt ins 2d context
export class SdfSub2DRenderer implements SubRendererBackend {
  private fontTexture: WebGLTexture | null = null;
  private fontData: any = null;
  private environment!: TwglRenderEnvironment;
  private gl: WebGLRenderingContext;

  constructor(gl: WebGLRenderingContext, environment: TwglRenderEnvironment) {
    this.gl = gl;
    this.environment = environment;
  }

  async loadFont(fntPath: string, imagePath: string) {
    const [fntText, image] = await Promise.all([fetch(fntPath).then((r) => r.text()), this.loadImage(imagePath)]);

    this.fontData = parseBMFont(fntText);
    this.fontTexture = twgljs.createTexture(this.gl, {
      src: image,
      min: this.gl.LINEAR,
      mag: this.gl.LINEAR,
    });
  }

  private loadImage(url: string): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
      const image = new Image();
      image.crossOrigin = 'anonymous';
      image.src = url;
      image.onload = () => resolve(image);
      image.onerror = (err) => reject(err);
    });
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
    if (!this.fontTexture || !this.fontData) return;

    console.log(uiText.text);

    const vertices: number[] = [];
    const uvs: number[] = [];
    let x = uiText.rect.position.x;
    const y = uiText.rect.position.y;
    const scale = uiText.size / this.fontData.common.lineHeight;

    for (const char of uiText.text) {
      const charData = this.fontData.chars.find((c: any) => c.char === char);
      if (!charData) continue;

      const x0 = x + charData.xoffset * scale;
      const y0 = y + charData.yoffset * scale;
      const x1 = x0 + charData.width * scale;
      const y1 = y0 + charData.height * scale;

      const u0 = charData.x / this.fontData.common.scaleW;
      const v0 = charData.y / this.fontData.common.scaleH;
      const u1 = (charData.x + charData.width) / this.fontData.common.scaleW;
      const v1 = (charData.y + charData.height) / this.fontData.common.scaleH;

      vertices.push(x0, y0, x1, y0, x0, y1, x0, y1, x1, y0, x1, y1);
      uvs.push(u0, v0, u1, v0, u0, v1, u0, v1, u1, v0, u1, v1);

      x += charData.xadvance * scale;
    }

    const bufferInfo = twgljs.createBufferInfoFromArrays(this.gl, {
      a_position: { numComponents: 2, data: vertices },
      a_texcoord: { numComponents: 2, data: uvs },
    });
    let uiColor = uiText.color.toRgb();
    
    this.gl.useProgram(this.environment.sdfProgramInfo.program);
    twgljs.setBuffersAndAttributes(this.gl, this.environment.sdfProgramInfo, bufferInfo);
    twgljs.setUniforms(this.environment.sdfProgramInfo, {
      u_texture: this.fontTexture,
      u_color: [uiColor.r / 255, uiColor.g / 255, uiColor.b / 255, uiColor.a],
      u_projection: projectionMatrix,
    });
    twgljs.drawBufferInfo(this.gl, bufferInfo);
  }
}
