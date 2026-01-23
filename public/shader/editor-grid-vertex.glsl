attribute vec3 position;
uniform mat4 uModel;
uniform mat4 uView;
uniform mat4 uProjection;
uniform vec3 uCameraOffset;  // Fractional offset relativ zu Grid-Cell

varying vec3 vRelativePos;   // Für Präzision

void main() {
  // Berechne relative Position DIREKT (keine großen Werte!)
  // position bleibt bei ±500, uCameraOffset bei ±0.5
  vRelativePos = position + uCameraOffset;
  
  // World-Transformation für Projektion
  vec4 worldPos = uModel * vec4(position, 1.0);
  gl_Position = uProjection * uView * worldPos;
}
