// WebGL 1.0 Version von infinite_grid.vs
attribute vec3 position;

uniform mat4 uViewProjection;
uniform float uGridSize;
uniform vec3 uCameraPosition;

varying vec3 vWorldPos;

void main() {
  // Skaliere Position mit GridSize
  vec3 pos = position * uGridSize;
  
  // Verschiebe zur Kamera-Position (nur X und Z)
  pos.x += uCameraPosition.x;
  pos.z += uCameraPosition.z;
  
  vWorldPos = pos;
  gl_Position = uViewProjection * vec4(pos, 1.0);
}
