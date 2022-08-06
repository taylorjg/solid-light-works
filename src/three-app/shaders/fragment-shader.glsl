uniform sampler2D hazeTexture;
uniform float opacity;

varying vec3 vPosition;
varying vec3 vNormal;
varying vec2 vUv;
varying vec3 vProjectorPosition;

// https://stackoverflow.com/questions/42532545/add-clipping-to-three-shadermaterial
#include <clipping_planes_pars_fragment>

void main() {
  #include <clipping_planes_fragment>

  float d = distance(vPosition, vProjectorPosition);
  float a = 1.0 - (d / 12.0);
  vec3 v = normalize(vPosition - cameraPosition);
  vec3 n = vNormal;
  float weight = 1.0 - abs(dot(v, n));
  vec4 hazeValue = texture2D(hazeTexture, vUv);
  hazeValue.a = 0.05;
  vec4 whiteValue = vec4(1.0);
  whiteValue.a = a;
  gl_FragColor = mix(hazeValue, whiteValue, weight) * opacity;
}
