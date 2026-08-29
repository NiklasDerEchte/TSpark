attribute vec2 position;
attribute vec2 texCoord;

varying vec2 v_uv;

void main() {
  v_uv = texCoord;
  gl_Position = vec4(position, 0.0, 1.0);
}
