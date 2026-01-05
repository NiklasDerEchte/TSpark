import { VertexFormat } from "mugl";
import type { RenderItem } from "./renderer";

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

export let cubeRenderItem: RenderItem = {
  vertexShader: vertexShader3d,
  fragmentShader: fragmentShader3d,
  verticies: new Float32Array([
    // Front face (red)
    -0.5, -0.5,  0.5,  1.0, 0.0, 0.0, 1.0, // bottom-left
     0.5, -0.5,  0.5,  1.0, 0.0, 0.0, 1.0, // bottom-right
     0.5,  0.5,  0.5,  1.0, 0.0, 0.0, 1.0, // top-right
    -0.5, -0.5,  0.5,  1.0, 0.0, 0.0, 1.0, // bottom-left
     0.5,  0.5,  0.5,  1.0, 0.0, 0.0, 1.0, // top-right
    -0.5,  0.5,  0.5,  1.0, 0.0, 0.0, 1.0, // top-left

    // Back face (blue)
    -0.5, -0.5, -0.5,  0.0, 0.0, 1.0, 1.0, // bottom-left
    -0.5,  0.5, -0.5,  0.0, 0.0, 1.0, 1.0, // top-left
     0.5,  0.5, -0.5,  0.0, 0.0, 1.0, 1.0, // top-right
    -0.5, -0.5, -0.5,  0.0, 0.0, 1.0, 1.0, // bottom-left
     0.5,  0.5, -0.5,  0.0, 0.0, 1.0, 1.0, // top-right
     0.5, -0.5, -0.5,  0.0, 0.0, 1.0, 1.0, // bottom-right

    // Top face (green)
    -0.5,  0.5, -0.5,  0.0, 1.0, 0.0, 1.0, // back-left
    -0.5,  0.5,  0.5,  0.0, 1.0, 0.0, 1.0, // front-left
     0.5,  0.5,  0.5,  0.0, 1.0, 0.0, 1.0, // front-right
    -0.5,  0.5, -0.5,  0.0, 1.0, 0.0, 1.0, // back-left
     0.5,  0.5,  0.5,  0.0, 1.0, 0.0, 1.0, // front-right
     0.5,  0.5, -0.5,  0.0, 1.0, 0.0, 1.0, // back-right

    // Bottom face (yellow)
    -0.5, -0.5, -0.5,  1.0, 1.0, 0.0, 1.0, // back-left
     0.5, -0.5, -0.5,  1.0, 1.0, 0.0, 1.0, // back-right
     0.5, -0.5,  0.5,  1.0, 1.0, 0.0, 1.0, // front-right
    -0.5, -0.5, -0.5,  1.0, 1.0, 0.0, 1.0, // back-left
     0.5, -0.5,  0.5,  1.0, 1.0, 0.0, 1.0, // front-right
    -0.5, -0.5,  0.5,  1.0, 1.0, 0.0, 1.0, // front-left

    // Right face (magenta)
     0.5, -0.5, -0.5,  1.0, 0.0, 1.0, 1.0, // back-bottom
     0.5,  0.5, -0.5,  1.0, 0.0, 1.0, 1.0, // back-top
     0.5,  0.5,  0.5,  1.0, 0.0, 1.0, 1.0, // front-top
     0.5, -0.5, -0.5,  1.0, 0.0, 1.0, 1.0, // back-bottom
     0.5,  0.5,  0.5,  1.0, 0.0, 1.0, 1.0, // front-top
     0.5, -0.5,  0.5,  1.0, 0.0, 1.0, 1.0, // front-bottom

    // Left face (cyan)
    -0.5, -0.5, -0.5,  0.0, 1.0, 1.0, 1.0, // back-bottom
    -0.5, -0.5,  0.5,  0.0, 1.0, 1.0, 1.0, // front-bottom
    -0.5,  0.5,  0.5,  0.0, 1.0, 1.0, 1.0, // front-top
    -0.5, -0.5, -0.5,  0.0, 1.0, 1.0, 1.0, // back-bottom
    -0.5,  0.5,  0.5,  0.0, 1.0, 1.0, 1.0, // front-top
    -0.5,  0.5, -0.5,  0.0, 1.0, 1.0, 1.0, // back-top
  ]),
  bufferFormats: vertexBufferFormat3d,
};