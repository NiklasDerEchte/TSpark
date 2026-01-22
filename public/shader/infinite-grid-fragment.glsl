#extension GL_OES_standard_derivatives : enable

precision highp float;

varying vec3 vWorldPos;

uniform vec3 uCameraPosition;
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
  vec2 dvx = vec2(dFdx(vWorldPos.x), dFdy(vWorldPos.x));
  vec2 dvy = vec2(dFdx(vWorldPos.z), dFdy(vWorldPos.z));

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
  vec2 mod_div_dudv = mod(vWorldPos.xz, GridCellSizeLod0) / dudv;
  float Lod0a = max2(vec2(1.0) - abs(satv(mod_div_dudv) * 2.0 - vec2(1.0)));

  // LOD 1 (mittlere Grid-Linien)
  mod_div_dudv = mod(vWorldPos.xz, GridCellSizeLod1) / dudv;
  float Lod1a = max2(vec2(1.0) - abs(satv(mod_div_dudv) * 2.0 - vec2(1.0)));
  
  // LOD 2 (dickste Grid-Linien)
  mod_div_dudv = mod(vWorldPos.xz, GridCellSizeLod2) / dudv;
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
  float OpacityFalloff = 1.0 - satf(length(vWorldPos.xz - uCameraPosition.xz) / uGridSize);
  Color.a *= OpacityFalloff;

  gl_FragColor = Color;
}
