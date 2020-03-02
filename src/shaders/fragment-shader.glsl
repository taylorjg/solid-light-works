uniform sampler2D hazeTexture;
varying vec3 vPosition;
varying vec3 vNormal;
varying vec2 vUv;
varying vec3 vProjectorPosition;

void main() {
  float d = distance(vPosition, vProjectorPosition);
  float a = 1.0 - (d / 18.0);
  vec3 v = normalize(vPosition - cameraPosition);
  vec3 n = vNormal;
  float weight = 1.0 - abs(dot(v, n));
  vec4 hazeValue = texture2D(hazeTexture, vUv);
  vec4 whiteValue = vec4(1.0);
  gl_FragColor = mix(hazeValue, whiteValue, weight);
  gl_FragColor.a = a;
}
