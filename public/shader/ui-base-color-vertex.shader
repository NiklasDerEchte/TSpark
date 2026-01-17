// Vertex-Shader für 2D-UI-Text (ohne Textur)
attribute vec2 a_position; // 2D-Position in Pixel-Koordinaten

uniform mat4 u_projection; // Orthographische Projektionsmatrix

void main() {
  // Direkte 2D-zu-Clip-Space Transformation
  gl_Position = u_projection * vec4(a_position, 0.0, 1.0);
}
