precision highp float;

varying vec3 vWorldPos;

uniform float uGridSize;    // z.B. 1.0
uniform float uLineWidth;   // z.B. 0.05

void main() {
  vec2 coord = vWorldPos.xz / uGridSize;

  vec2 grid = abs(fract(coord - 0.5) - 0.5) / fwidth(coord);
  float line = min(grid.x, grid.y);

  float alpha = 1.0 - clamp(line - uLineWidth, 0.0, 1.0);
  vec3 color = vec3(0.6);

  gl_FragColor = vec4(color, alpha);
}