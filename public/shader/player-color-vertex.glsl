attribute vec2 position;
attribute vec4 color;

varying vec4 v_color;

void main() {
  v_color = color;
  gl_Position = vec4(position, 0.0, 1.0);
}
