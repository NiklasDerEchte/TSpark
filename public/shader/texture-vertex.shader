attribute vec4 position;
attribute vec2 texCoord;

uniform mat4 u_worldViewProjection;

varying vec2 v_texCoord;

void main() {
  gl_Position = u_worldViewProjection * position;
  v_texCoord = texCoord;
}