import * as twgljs from 'twgl.js';

export interface RenderEnvironment {
  gl: WebGLRenderingContext;
}

export async function setupEnvironment(gl: WebGLRenderingContext): Promise<RenderEnvironment> {
  // Enable OES_standard_derivatives extension for fwidth() in the editor grid shader
  gl.getExtension('OES_standard_derivatives');
  return {
    gl: gl,
  };
}

export async function createProgramInfo(environment: RenderEnvironment, vs: string, fs: string): Promise<twgljs.ProgramInfo> {
  let vertex = await fetch(vs);
  let fragment = await fetch(fs);
  return twgljs.createProgramInfo(environment.gl, [await vertex.text(), await fragment.text()]);
}