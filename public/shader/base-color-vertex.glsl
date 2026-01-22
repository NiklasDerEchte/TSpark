attribute vec4 position;

uniform mat4 u_worldViewProjection;
uniform mat4 u_world;

void main() {
  gl_Position = u_worldViewProjection * u_world * position;
}