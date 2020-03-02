uniform sampler2D hazeTexture;
uniform vec3 projectorPosition;
varying vec3 vPosition;
varying vec3 vNormal;
varying vec2 vUv;
varying vec3 vProjectorPosition;

void main() {
  vPosition = (modelViewMatrix * vec4(position, 1.0)).xyz;
  vNormal = normalize(normalMatrix * normal);
  vUv = uv;
  vProjectorPosition = (modelViewMatrix * vec4(projectorPosition, 1.0)).xyz;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
