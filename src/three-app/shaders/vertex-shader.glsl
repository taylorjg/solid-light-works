varying vec3 vPosition;
varying vec3 vNormal;
varying vec2 vUv;

// https://stackoverflow.com/questions/42532545/add-clipping-to-three-shadermaterial
#include <clipping_planes_pars_vertex>

void main() {
  #include <begin_vertex>
  #include <project_vertex>
  #include <clipping_planes_vertex>

  vPosition = (modelMatrix * vec4(position, 1.0)).xyz;
  vNormal = normalize((modelMatrix * vec4(normal, 0.0)).xyz);
  vUv = uv;

  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
