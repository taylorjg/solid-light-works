// Membrane (cone-of-light) fragment shader.
//
// Models haze-filled projected light as a thin volumetric sheet:
//   - Distance falloff: Gaussian-style exp(-falloffK * t^2) along beam length.
//   - Angular brightness: Henyey–Greenstein phase function (forward scatter in
//     haze) blended with a rim/edge term (grazing-angle highlight on the sheet).
//   - glareStrength: app-specific fix — raw forward scatter blows out when
//     viewing back along the beam toward the projector.
//
// References:
//   - https://en.wikipedia.org/wiki/Henyey%E2%80%93Greenstein_phase_function
//   - https://www.pbr-book.org/3ed-2018/Volume_Scattering/Phase_Functions.html
//     (PBRT: phase functions for volumetric light transport)
//
// Uniforms scatterG (g), edgeMix, falloffK, glareStrength are tunable in
// projection-effect.js; g ≈ 0.7–0.9 gives strong forward scatter (typical haze).

uniform sampler2D hazeTexture;
uniform float opacity;
uniform vec3 projectorPosition;
uniform float beamLength;
uniform float scatterG;
uniform float edgeMix;
uniform float falloffK;
uniform float glareStrength;

varying vec3 vPosition;
varying vec3 vNormal;
varying vec2 vUv;

// https://stackoverflow.com/questions/42532545/add-clipping-to-three-shadermaterial
#include <clipping_planes_pars_fragment>

// Henyey–Greenstein phase function: P(cos θ) where θ is angle between
// beam direction and view direction. g > 0 peaks when looking along the beam.
float henyeyGreenstein(float cosTheta, float g) {
  float gg = g * g;
  return (1.0 - gg) / pow(max(1.0 + gg - 2.0 * g * cosTheta, 1e-4), 1.5);
}

void main() {
  #include <clipping_planes_fragment>

  vec3 toFrag = vPosition - projectorPosition;
  float distSq = dot(toFrag, toFrag);
  float dist = sqrt(distSq);
  float t = dist / beamLength;
  float distAtten = exp(-falloffK * t * t);

  vec3 viewDir = normalize(cameraPosition - vPosition);
  vec3 beamDir = dist > 1e-5 ? toFrag / dist : vec3(0.0, 0.0, -1.0);
  float cosTheta = dot(beamDir, viewDir);

  float edgeTerm = 1.0 - abs(dot(viewDir, vNormal));
  float phasePeak = henyeyGreenstein(1.0, scatterG);
  float phase = henyeyGreenstein(cosTheta, scatterG) / phasePeak;
  // Viewing downstream along the beam (back toward the projector) peaks forward scatter.
  float alongBeam = max(cosTheta, 0.0);
  float glareSuppress = 1.0 - glareStrength * alongBeam * alongBeam;
  float weight = min(mix(edgeTerm, phase, edgeMix) * glareSuppress, 1.0);

  vec4 hazeValue = texture2D(hazeTexture, vUv);
  hazeValue.a = 0.05;
  vec4 whiteValue = vec4(1.0);
  whiteValue.a = distAtten;
  gl_FragColor = mix(hazeValue, whiteValue, weight) * opacity;
}
