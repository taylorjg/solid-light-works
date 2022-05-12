// https://www.ericforman.com/blog/making-of-solid-light-for-anthony-mccall
//
// ω(θ, t) := A · sin(F · θ + S · t + Φ) · cos(f · t + φ) 
// Cx(θ, t) := (R + ω(θ, t)) · cos(θ)
// Cy(θ, t) := (R + ω(θ, t)) · sin(θ) 
//
// Variables:
// θ = radial angle to a point on the circle wave; 0 ≤ θ < ∞ 
// t = time; 0 ≤ t < ∞
//
// Parameters:
// R = distance from circle center to middle of wave; 0 ≤ R < ∞
// A = amplitude of circle wave; 0 < A < ∞
// F = number of wavelengths per circumference; F = 1, 2, 3, …
// S = speed of rotation of circle wave; 0 ≤ S < ∞
// f = frequency of circle wave oscillation; 0 ≤ f < ∞
// Φ = phase of circle wave rotation; 0 ≤ Φ < 2π
// φ = phase of circle wave oscillation; 0 ≤ φ < 2π

export const parametricCircleWaveX = (A, F, S, f, Φ, φ, R, tick) =>
  t => {
    const θ = t
    const ωt = A * Math.sin(F * θ + S * tick + Φ) * Math.cos(f * tick + φ)
    return (R + ωt) * Math.cos(θ)
  }

export const parametricCircleWaveY = (A, F, S, f, Φ, φ, R, tick) =>
  t => {
    const θ = t
    const ωt = A * Math.sin(F * θ + S * tick + Φ) * Math.cos(f * tick + φ)
    return (R + ωt) * Math.sin(θ)
  }
