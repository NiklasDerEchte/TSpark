precision mediump float;

varying vec2 v_texcoord;
uniform sampler2D u_texture;
uniform vec4 u_color;

void main() {
  vec4 texColor = texture2D(u_texture, v_texcoord);
  gl_FragColor = vec4(u_color.rgb, u_color.a * texColor.a);
}