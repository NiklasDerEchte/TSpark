import * as twgljs from 'twgl.js';

export interface TwglRenderEnvironment {
  shader: {
    baseColor: { vs: string; fs: string };
    texture: { vs: string; fs: string };
    uiTexture: { vs: string; fs: string };
    uiBaseColor: { vs: string; fs: string };
  };
  baseColorProgramInfo: twgljs.ProgramInfo;
  textureProgramInfo: twgljs.ProgramInfo;
  uiTextureProgramInfo: twgljs.ProgramInfo;
  uiBaseColorProgramInfo: twgljs.ProgramInfo;
  sdfProgramInfo: twgljs.ProgramInfo;
}

export async function setupEnvironment(gl: WebGLRenderingContext): Promise<TwglRenderEnvironment> {
  let shader = await getShader();
  return {
    shader: shader,
    baseColorProgramInfo: twgljs.createProgramInfo(gl, [shader.baseColor.vs, shader.baseColor.fs]),
    textureProgramInfo: twgljs.createProgramInfo(gl, [shader.texture.vs, shader.texture.fs]),
    uiTextureProgramInfo: twgljs.createProgramInfo(gl, [shader.uiTexture.vs, shader.uiTexture.fs]),
    uiBaseColorProgramInfo: twgljs.createProgramInfo(gl, [shader.uiBaseColor.vs, shader.uiBaseColor.fs]),
    sdfProgramInfo: twgljs.createProgramInfo(gl, [shader.sdf.vs, shader.sdf.fs]),
  };
}

let getShader = async () => {
  let baseColorVertex = await fetch('shader/base-color-vertex.shader');
  let baseColorFragment = await fetch('shader/base-color-fragment.shader');

  let textureVertex = await fetch('shader/texture-vertex.shader');
  let textureFragment = await fetch('shader/texture-fragment.shader');

  let uiTextureVertex = await fetch('shader/ui-texture-vertex.shader');
  let uiTextureFragment = await fetch('shader/ui-texture-fragment.shader');

  let uiBaseColorVertex = await fetch('shader/ui-base-color-vertex.shader');
  let uiBaseColorFragment = await fetch('shader/ui-base-color-fragment.shader');

  let sdfVertex = await fetch('shader/sdf-vertex.shader');
  let sdfFragment = await fetch('shader/sdf-fragment.shader');
  
  return await {
    baseColor: {
      vs: await baseColorVertex.text(),
      fs: await baseColorFragment.text(),
    },
    texture: {
      vs: await textureVertex.text(),
      fs: await textureFragment.text(),
    },
    uiTexture: {
      vs: await uiTextureVertex.text(),
      fs: await uiTextureFragment.text(),
    },
    uiBaseColor: {
      vs: await uiBaseColorVertex.text(),
      fs: await uiBaseColorFragment.text(),
    },
    sdf: {
      vs: await sdfVertex.text(),
      fs: await sdfFragment.text(),
    },
  };
};
