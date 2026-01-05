import { VertexFormat } from "mugl";
import type { RenderItem } from "./renderer";
import type { component3D } from "../../types/index";

let vertexShader3d: string = `#version 300 es
        layout (location=0) in vec3 position;
        layout (location=1) in vec4 color;
        
        out vec4 vColor;
        void main () {
          gl_Position = vec4(position, 1.);
          vColor = color;
        }`;
let fragmentShader3d: string = `#version 300 es
        precision mediump float;
        in vec4 vColor;
        out vec4 outColor;
        void main () {
          outColor = vColor;
        }`;

let vertexBufferFormat3d = [{ attributes: [VertexFormat.F32x3, VertexFormat.F32x4] }];

export function createRenderItemFromGeometry(geometry: component3D.Geometry): RenderItem {
  console.log("CreateGeomentry");
  const positions = Array.isArray(geometry.vertices) ? new Float32Array(geometry.vertices) : geometry.vertices;
  const vertexCount = geometry.vertexCount || (positions.length / 3);
  const indices = geometry.indices ? (Array.isArray(geometry.indices) ? new Uint16Array(geometry.indices) : geometry.indices) : undefined;
  const uvs = geometry.uvs ? (Array.isArray(geometry.uvs) ? new Float32Array(geometry.uvs) : geometry.uvs) : undefined;
  if(uvs) {
    if(uvs.length/4 != vertexCount) {
      console.warn("UVs length does not match vertex count in geometry");
    }
  }
  const interleaved = new Float32Array(vertexCount * 7); // 3 pos + 4 color
  for (let i = 0; i < vertexCount; i++) {
    const posIndex = i * 3;
    const interIndex = i * 7;
    interleaved[interIndex] = positions[posIndex];     // x
    interleaved[interIndex + 1] = positions[posIndex + 1]; // y
    interleaved[interIndex + 2] = positions[posIndex + 2]; // z
    if(uvs) {
      const uvIndex = i * 4;
      interleaved[interIndex + 3] = uvs[uvIndex]; // r
      interleaved[interIndex + 4] = uvs[uvIndex + 1]; // g
      interleaved[interIndex + 5] = uvs[uvIndex + 2]; // b
      interleaved[interIndex + 6] = uvs[uvIndex + 3]; // a
    } else {
      interleaved[interIndex + 3] = 1.0; // r
      interleaved[interIndex + 4] = 0.5; // g
      interleaved[interIndex + 5] = 1.0; // b
      interleaved[interIndex + 6] = 1.0; // a
    }
  }

  return {
    vertexShader: vertexShader3d,
    fragmentShader: fragmentShader3d,
    bufferFormats: vertexBufferFormat3d,
    verticies: interleaved,
    indices: indices,
  };
}