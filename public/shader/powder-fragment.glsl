precision mediump float;

uniform sampler2D u_grid;
uniform vec2 u_gridSize;
uniform vec2 u_origin;
uniform vec2 u_viewSize;
uniform vec2 u_cursor;
uniform float u_brush;
uniform vec4 u_voidColor;
uniform vec4 u_brushColor;

varying vec2 v_uv;

void main() {
  vec2 world = u_origin + v_uv * u_viewSize;
  vec2 cell = floor(world);

  if (cell.x < 0.0 || cell.y < 0.0 || cell.x >= u_gridSize.x || cell.y >= u_gridSize.y) {
    gl_FragColor = u_voidColor;
    return;
  }

  vec2 texel = (cell + 0.5) / u_gridSize;
  vec4 color = texture2D(u_grid, texel);

  if (u_brush > 0.0 && u_cursor.x >= 0.0) {
    float d = distance(cell + 0.5, u_cursor + 0.5);
    if (abs(d - u_brush) < 0.7) {
      color = mix(color, u_brushColor, 0.85);
    } else if (d < u_brush) {
      color.rgb += 0.06;
    }
  }

  gl_FragColor = color;
}
