import { VertexFormat } from "mugl";
import type { RenderItem } from "./renderer";

let vertextShader2d: string = `#version 300 es
        layout (location=0) in vec2 position;
        layout (location=1) in vec4 color;
        out vec4 vColor;
        void main () {
          gl_Position = vec4(position, 0., 1.);
          vColor = color;
        }`;
let fragmentShader2d: string = `#version 300 es
        precision mediump float;
        in vec4 vColor;
        out vec4 outColor;
        void main () {
          outColor = vColor;
        }`;

let vertexBufferFormat2d = [{ attributes: [VertexFormat.F32x2, VertexFormat.F32x4] }];

export let triangleRenderItem2d: RenderItem = {
  vertexShader: vertextShader2d,
  fragmentShader: fragmentShader2d,
  verticies: new Float32Array([
    // position  color
    +0.0,
    +0.5,
    1.0,
    0.0,
    0.0,
    1.0, // vertex 0
    +0.5,
    -0.5,
    0.0,
    1.0,
    0.0,
    1.0, // vertex 1
    -0.5,
    -0.5,
    0.0,
    0.0,
    1.0,
    1.0, // vertex 2
  ]),
  bufferFormats: vertexBufferFormat2d,
};