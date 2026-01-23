#extension GL_OES_standard_derivatives : enable

precision highp float;

varying vec3 vRelativePos;

uniform float uGridSize;
uniform float uLineWidth;

void main() {
  vec2 coord = vRelativePos.xz / uGridSize;

  vec2 grid = abs(fract(coord - 0.5) - 0.5) / fwidth(coord);
  float line = min(grid.x, grid.y);

  float alpha = 1.0 - clamp(line - uLineWidth, 0.0, 1.0);
  vec3 color = vec3(0.6);

  gl_FragColor = vec4(color, alpha);
}