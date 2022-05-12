// http://labman.phys.utk.edu/phys221core/modules/m11/traveling_waves.html
// Parametric equation of a travelling wave:
// x = t
// y = A * sin(k * t - ωt + φ)

// Parametric equation of a travelling wave rotated ccw by θ:
// x = t * cos(θ) - a * sin(k * t - ωt) * sin(θ)
// y = t * sin(θ) + a * sin(k * t - ωt) * cos(θ)
// (see https://math.stackexchange.com/questions/245859/rotating-parametric-curve)

export const parametricRotatingTravellingWaveX = (A, k, ωt, θ) =>
  t => t * Math.cos(θ) - A * Math.sin(k * t - ωt) * Math.sin(θ)

export const parametricRotatingTravellingWaveY = (A, k, ωt, θ) =>
  t => t * Math.sin(θ) + A * Math.sin(k * t - ωt) * Math.cos(θ)

// The following online tool was very useful for finding the derivatives:
// https://www.symbolab.com/solver/derivative-calculator

export const parametricRotatingTravellingWaveXDerivative = (A, k, ωt, θ) =>
  t => Math.cos(θ) - A * Math.sin(θ) * Math.cos(k * t - ωt) * k

export const parametricRotatingTravellingWaveYDerivative = (A, k, ωt, θ) =>
  t => Math.sin(θ) + A * Math.cos(θ) * Math.cos(k * t - ωt) * k
