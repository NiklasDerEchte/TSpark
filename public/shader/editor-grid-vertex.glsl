attribute vec3 position;
uniform mat4 uModel;
uniform mat4 uView;
uniform mat4 uProjection;
uniform vec3 uCameraPosition;

varying vec3 vWorldPos;      // Für Grid-Berechnung
varying vec3 vRelativePos;   // Für Präzision

void main() {
  vec4 worldPos = uModel * vec4(position, 1.0);
  
  // Absolute Welt-Position für Grid-Pattern
  vWorldPos = worldPos.xyz;
  
  // Relative Position für Präzision bei fract()
  vRelativePos = worldPos.xyz - vec3(floor(uCameraPosition.x), 0.0, floor(uCameraPosition.z));
  
  gl_Position = uProjection * uView * worldPos;
}
