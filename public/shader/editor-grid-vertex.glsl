attribute vec3 position;
uniform mat4 uModel;
uniform mat4 uView;
uniform mat4 uProjection;
uniform vec3 uCameraOffset;

varying vec3 vRelativePos;

void main() {
  vRelativePos = position + uCameraOffset;
  
  vec4 worldPos = uModel * vec4(position, 1.0);
  gl_Position = uProjection * uView * worldPos;
}
