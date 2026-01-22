// Fragment-Shader für 2D-UI-Text (Farbfüllung)
precision mediump float;

uniform vec4 u_color; // Textfarbe

void main() {
  gl_FragColor = u_color;
}
