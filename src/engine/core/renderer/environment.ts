import * as twgljs from 'twgl.js';

export interface RenderEnvironment {
  // TODO Überarbeiten - Normalisieren oder schauen das es Generisch für alle Renderer funktionieren kann
  gl: WebGLRenderingContext;
  baseColorProgramInfo: twgljs.ProgramInfo;
  textureProgramInfo: twgljs.ProgramInfo;
  uiTextureProgramInfo: twgljs.ProgramInfo;
  uiBaseColorProgramInfo: twgljs.ProgramInfo;
  sdfProgramInfo: twgljs.ProgramInfo;
  editorGridProgramInfo: twgljs.ProgramInfo;
  infiniteGridProgramInfo: twgljs.ProgramInfo;
}

export async function setupEnvironment(gl: WebGLRenderingContext): Promise<RenderEnvironment> {
  // Enable OES_standard_derivatives extension für fwidth() im Editor-Grid Shader
  gl.getExtension('OES_standard_derivatives');
  
  let shader = await getShader();
  return {
    gl: gl,
    baseColorProgramInfo: twgljs.createProgramInfo(gl, [shader.baseColor.vs, shader.baseColor.fs]),
    textureProgramInfo: twgljs.createProgramInfo(gl, [shader.texture.vs, shader.texture.fs]),
    uiTextureProgramInfo: twgljs.createProgramInfo(gl, [shader.uiTexture.vs, shader.uiTexture.fs]),
    uiBaseColorProgramInfo: twgljs.createProgramInfo(gl, [shader.uiBaseColor.vs, shader.uiBaseColor.fs]),
    sdfProgramInfo: twgljs.createProgramInfo(gl, [shader.sdf.vs, shader.sdf.fs]),
    editorGridProgramInfo: twgljs.createProgramInfo(gl, [shader.editorGrid.vs, shader.editorGrid.fs]),
    infiniteGridProgramInfo: twgljs.createProgramInfo(gl, [shader.infiniteGrid.vs, shader.infiniteGrid.fs]),
  };
}

let getShader = async () => {
  let baseColorVertex = await fetch('shader/base-color-vertex.glsl');
  let baseColorFragment = await fetch('shader/base-color-fragment.glsl');

  let textureVertex = await fetch('shader/texture-vertex.glsl');
  let textureFragment = await fetch('shader/texture-fragment.glsl');

  let uiTextureVertex = await fetch('shader/ui-texture-vertex.glsl');
  let uiTextureFragment = await fetch('shader/ui-texture-fragment.glsl');

  let uiBaseColorVertex = await fetch('shader/ui-base-color-vertex.glsl');
  let uiBaseColorFragment = await fetch('shader/ui-base-color-fragment.glsl');

  let sdfVertex = await fetch('shader/sdf-vertex.glsl');
  let sdfFragment = await fetch('shader/sdf-fragment.glsl');

  let editorGridVertex = await fetch('shader/editor-grid-vertex.glsl');
  let editorGridFragment = await fetch('shader/editor-grid-fragment.glsl');

  let infiniteGridVertex = await fetch('shader/infinite-grid-vertex.glsl');
  let infiniteGridFragment = await fetch('shader/infinite-grid-fragment.glsl');
  
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
    editorGrid: {
      vs: await editorGridVertex.text(),
      fs: await editorGridFragment.text(),
    },
    infiniteGrid: {
      vs: await infiniteGridVertex.text(),
      fs: await infiniteGridFragment.text(),
    },
  };
};
