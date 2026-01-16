attribute vec4 position;

uniform mat4 u_worldViewProjection;

void main() {
  gl_Position = u_worldViewProjection * position;
}