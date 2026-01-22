#extension GL_OES_standard_derivatives : enable

precision highp float;

varying vec3 vWorldPos;      // Absolute Position
varying vec3 vRelativePos;   // Relative Position

uniform float uGridSize;
uniform float uLineWidth;

void main() {
  // WICHTIG: Nutze vRelativePos für die Grid-Berechnung!
  // Das Grid-Pattern basiert auf der relativen Position (bleibt lokal klein)
  vec2 coord = vRelativePos.xz / uGridSize;

  vec2 grid = abs(fract(coord - 0.5) - 0.5) / fwidth(coord);
  float line = min(grid.x, grid.y);

  float alpha = 1.0 - clamp(line - uLineWidth, 0.0, 1.0);
  vec3 color = vec3(0.6);

  gl_FragColor = vec4(color, alpha);
}