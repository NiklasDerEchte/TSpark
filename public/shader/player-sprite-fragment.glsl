precision mediump float;

uniform sampler2D u_sheet;
varying vec2 v_uv;

void main() {
  vec4 color = texture2D(u_sheet, v_uv);
  if (color.a < 0.1) discard;
  gl_FragColor = color;
}
