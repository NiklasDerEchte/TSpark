attribute vec3 position;
uniform mat4 uModel;
uniform mat4 uView;
uniform mat4 uProjection;

varying vec3 vWorldPos;

void main() {
  vec4 worldPos = uModel * vec4(position, 1.0);
  vWorldPos = worldPos.xyz;
  gl_Position = uProjection * uView * worldPos;
}
