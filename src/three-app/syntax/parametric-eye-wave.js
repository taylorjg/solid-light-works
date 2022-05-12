export const parametricEyeWaveX = xoffset =>
  t => t + xoffset

export const parametricEyeWaveY = (R, A, F, S, f, Φ, φ, k, tick, θoffset) =>
  t => {
    const θ = θoffset + k * t
    const ω = A * Math.sin(F * θ + S * tick + Φ) * Math.cos(f * tick + φ)
    return (R + ω) * Math.sin(θ)
  }

// The following online tool was very useful for finding the derivatives:
// https://www.symbolab.com/solver/derivative-calculator

export const parametricEyeWaveXDerivative = _xoffset =>
  t => 1

export const parametricEyeWaveYDerivative = (R, A, F, S, f, Φ, φ, k, tick, θoffset) =>
  t => (
    A * F * k * Math.cos(tick * f + φ) * Math.cos(F * (k * t + θoffset) + S * tick + Φ) * Math.sin(θoffset + k * t) +
    Math.cos(θoffset + k * t) * k * (R + A * Math.sin(F * (θoffset + k * t) + S * tick + Φ) * Math.cos(f * tick + φ))
  )
