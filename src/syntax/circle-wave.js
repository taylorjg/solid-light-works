import * as THREE from 'three'
import * as U from '../utils'
import * as C from '../constants'

// https://www.ericforman.com/anthony-mccall-solid-light#6
// https://www.ericforman.com/anthony-mccall-solid-light#7
// https://www.ericforman.com/blog/making-of-solid-light-for-anthony-mccall

export class CircleWave {

  // R = distance from circle center to middle of wave; 0 ≤ R < ∞
  // A = amplitude of circle wave; 0 < A < ∞
  // F = number of wavelengths per circumference; F = 1, 2, 3, …
  // S = speed of rotation of circle wave; 0 ≤ S < ∞
  // f = frequency of circle wave oscillation; 0 ≤ f < ∞
  // Φ = phase of circle wave rotation; 0 ≤ Φ < 2π
  // φ = phase of circle wave oscillation; 0 ≤ φ < 2π
  constructor(R, A, F, S, f, rotationPhase, oscillationPhase) {
    this.R = R
    this.A = A
    this.F = F
    this.S = S
    this.f = f
    this.rotationPhase = rotationPhase
    this.oscillationPhase = oscillationPhase
  }

  // θ = radial angle to a point on the circle wave; 0 ≤ θ < ∞
  // t = time; 0 ≤ t < ∞

  // ω(θ, t) := A · sin(F · θ + S · t + Φ) · cos(f · t + φ)
  omega(theta, t) {
    return (
      this.A *
      Math.sin(this.F * theta + this.S * t + this.rotationPhase) *
      Math.cos(this.f * t + this.oscillationPhase)
    )
  }

  // Cx(θ, t) := (R + ω(θ, t)) · cos(θ)
  // Cy(θ, t) := (R + ω(θ, t)) · sin(θ)
  getPoint(theta, t) {
    const adjustedR = this.R + this.omega(theta, t)
    const cx = adjustedR * Math.cos(theta)
    const cy = adjustedR * Math.sin(theta)
    return new THREE.Vector2(cx, 3 + cy)
  }

  getPoints(divisions, t) {
    const deltaAngle = C.TWO_PI / divisions
    return U.range(divisions + 1).map(index => {
      const theta = deltaAngle * index
      return this.getPoint(theta, t)
    })
  }
}
