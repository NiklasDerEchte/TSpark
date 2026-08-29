precision mediump float;

uniform vec2 u_origin;
uniform vec2 u_viewSize;
uniform vec2 u_center;
uniform float u_radius;
uniform vec4 u_color;

varying vec2 v_uv;

void main() {
  vec2 world = u_origin + v_uv * u_viewSize;
  float d = distance(world, u_center);
  if (abs(d - u_radius) > 0.7) discard;
  gl_FragColor = u_color;
}
