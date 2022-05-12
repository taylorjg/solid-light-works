// http://labman.phys.utk.edu/phys221core/modules/m11/traveling_waves.html
// Parametric equation of a travelling wave:
// x = t
// y = A * sin(k * t - ωt + φ)

export const parametricTravellingWaveX = xoffset =>
  t => t + xoffset

export const parametricTravellingWaveY = (A, k, ωt, φ) =>
  t => A * Math.sin(k * t - ωt + φ)

// The following online tool was very useful for finding the derivatives:
// https://www.symbolab.com/solver/derivative-calculator

export const parametricTravellingWaveXDerivative = _xoffset =>
  t => 1

export const parametricTravellingWaveYDerivative = (A, k, ωt, φ) =>
  t => A * Math.cos(k * t - ωt + φ) * k
