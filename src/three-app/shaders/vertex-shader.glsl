uniform sampler2D hazeTexture;
uniform vec3 projectorPosition;
varying vec3 vPosition;
varying vec3 vNormal;
varying vec2 vUv;
varying vec3 vProjectorPosition;

#include <clipping_planes_pars_vertex>

void main() {
  #include <begin_vertex>
  vPosition = (modelViewMatrix * vec4(position, 1.0)).xyz;
  vNormal = normalize(normalMatrix * normal);
  vUv = uv;
  vProjectorPosition = (modelViewMatrix * vec4(projectorPosition, 1.0)).xyz;
  #include <project_vertex>
  #include <clipping_planes_vertex>
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
