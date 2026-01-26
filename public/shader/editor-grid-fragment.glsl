#extension GL_OES_standard_derivatives : enable

precision highp float;

// varying vec3 vRelativePos;

// uniform float uGridSize;
// uniform float uLineWidth;

// void main() {
//   vec2 coord = vRelativePos.xz / uGridSize;

//   vec2 grid = abs(fract(coord - 0.5) - 0.5) / fwidth(coord);
//   float line = min(grid.x, grid.y);

//   float alpha = 1.0 - clamp(line - uLineWidth, 0.0, 1.0);
//   vec3 color = vec3(0.6);

//   gl_FragColor = vec4(color, alpha);
// }


varying vec3 vRelativePos;

uniform vec3 uCameraOffset;
uniform float uGridSize;
uniform float uGridMinPixelsBetweenCells;
uniform float uGridCellSize;
uniform vec4 uGridColorThin;
uniform vec4 uGridColorThick;

float log10(float x) {
  return log(x) / log(10.0);
}

float satf(float x) {
  return clamp(x, 0.0, 1.0);
}

vec2 satv(vec2 x) {
  return clamp(x, vec2(0.0), vec2(1.0));
}

float max2(vec2 v) {
  return max(v.x, v.y);
}

void main() {
  // Berechne Ableitungen für LOD
  vec2 dvx = vec2(dFdx(vRelativePos.x), dFdy(vRelativePos.x));
  vec2 dvy = vec2(dFdx(vRelativePos.z), dFdy(vRelativePos.z));

  float lx = length(dvx);
  float ly = length(dvy);

  vec2 dudv = vec2(lx, ly);
  float l = length(dudv);

  // LOD-Berechnung
  float LOD = max(0.0, log10(l * uGridMinPixelsBetweenCells / uGridCellSize) + 1.0);

  float GridCellSizeLod0 = uGridCellSize * pow(10.0, floor(LOD));
  float GridCellSizeLod1 = GridCellSizeLod0 * 10.0;
  float GridCellSizeLod2 = GridCellSizeLod1 * 10.0;

  dudv *= 4.0;

  // LOD 0 (feinste Grid-Linien)
  vec2 mod_div_dudv = mod(vRelativePos.xz, GridCellSizeLod0) / dudv;
  float Lod0a = max2(vec2(1.0) - abs(satv(mod_div_dudv) * 2.0 - vec2(1.0)));

  // LOD 1 (mittlere Grid-Linien)
  mod_div_dudv = mod(vRelativePos.xz, GridCellSizeLod1) / dudv;
  float Lod1a = max2(vec2(1.0) - abs(satv(mod_div_dudv) * 2.0 - vec2(1.0)));
  
  // LOD 2 (dickste Grid-Linien)
  mod_div_dudv = mod(vRelativePos.xz, GridCellSizeLod2) / dudv;
  float Lod2a = max2(vec2(1.0) - abs(satv(mod_div_dudv) * 2.0 - vec2(1.0)));

  float LOD_fade = fract(LOD);
  vec4 Color;

  // Wähle Farbe basierend auf LOD
  if (Lod2a > 0.0) {
    Color = uGridColorThick;
    Color.a *= Lod2a;
  } else {
    if (Lod1a > 0.0) {
      Color = mix(uGridColorThick, uGridColorThin, LOD_fade);
      Color.a *= Lod1a;
    } else {
      Color = uGridColorThin;
      Color.a *= (Lod0a * (1.0 - LOD_fade));
    }
  }
  
  // Opacity Falloff basierend auf Distanz zur Kamera
  float OpacityFalloff = 1.0 - satf(length(vRelativePos.xz - uCameraOffset.xz) / uGridSize);
  Color.a *= OpacityFalloff;

  gl_FragColor = Color;
}