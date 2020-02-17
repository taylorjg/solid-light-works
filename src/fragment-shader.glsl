uniform sampler2D hazeTexture;
varying vec2 vUv;

void main() {
  vec4 stHazeValue = texture2D(hazeTexture, vUv.st);
  vec4 ssHazeValue = texture2D(hazeTexture, vUv.ss);
  stHazeValue.a = 0.1;
  ssHazeValue.a = 0.2;
  gl_FragColor = stHazeValue + ssHazeValue;
  // TODO: photon mapping ?
}
