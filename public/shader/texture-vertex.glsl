attribute vec4 position;
attribute vec2 texCoord;

uniform mat4 u_worldViewProjection;
uniform mat4 u_world;

varying vec2 v_texCoord;

void main() {
  gl_Position = u_worldViewProjection * u_world * position;
  v_texCoord = texCoord;
}