// Vertex-Shader für 2D-UI-Elemente
attribute vec2 a_position; // Position des Rechtecks in Pixel-Koordinaten (x, y)
attribute vec2 a_texCoord; // Texturkoordinate für den Font-Atlas

uniform mat4 u_projection; // Die orthographische Projektionsmatrix

varying vec2 v_texCoord;

void main() {
  // Projiziere die 2D-Pixel-Position in den Clip-Space
  gl_Position = u_projection * vec4(a_position, 0, 1);
  
  // Gib die Texturkoordinate an den Fragment-Shader weiter
  v_texCoord = a_texCoord;
}