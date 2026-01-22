// Fragment-Shader für texturierte UI-Elemente
precision mediump float;

uniform sampler2D u_texture; // Der Font-Atlas
uniform vec4 u_color;       // Textfarbe

varying vec2 v_texCoord;

void main() {
  // Hole die Farbe aus der Textur (normalerweise ist der Font weiß)
  // und multipliziere sie mit der gewünschten Textfarbe.
  gl_FragColor = texture2D(u_texture, v_texCoord) * u_color;
}