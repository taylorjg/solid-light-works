uniform sampler2D hazeTexture;
varying vec3 vPosition;
varying vec3 vNormal;
varying vec2 vUv;

const vec4 WHITE = vec4(1.0);

void main() {
  vec3 cameraToPosition = normalize(vPosition - cameraPosition);
  float weight = 1.0 - abs(dot(cameraToPosition, vNormal));
  vec4 hazeValue = texture2D(hazeTexture, vUv.ss);
  hazeValue.a = 0.1;
  gl_FragColor = mix(hazeValue, WHITE, weight);
}
