import * as THREE from 'three'
import * as U from '../utils'
import * as C from '../constants'

const TWO_PI = Math.PI * 2
const HALF_PI = Math.PI / 2

// https://www.ericforman.com/anthony-mccall-solid-light#6
// https://www.ericforman.com/anthony-mccall-solid-light#7
// https://www.ericforman.com/blog/making-of-solid-light-for-anthony-mccall

class CircleWave {

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
    const deltaAngle = TWO_PI / divisions
    return U.range(divisions + 1).map(index => {
      const theta = deltaAngle * index
      return this.getPoint(theta, t)
    })
  }
}

const CIRCLE_WAVE_POINT_COUNT = 200

export class CouplingForm {

  constructor(isProjector) {
    this.isProjector = isProjector
    if (isProjector) {
      const point = new THREE.Vector2(0, C.PROJECTOR_CY * 4)
      this.points = [
        U.repeat(CIRCLE_WAVE_POINT_COUNT + 1, point),
        U.repeat(CIRCLE_WAVE_POINT_COUNT + 1, point)
      ]
    } else {
      this.circleWaveOuter = new CircleWave(2, 0.4, 3.5, 0.01, 0.01, 0, 0)
      this.circleWaveInner = new CircleWave(1, 0.4, 3.5, 0.01, 0.01, HALF_PI, 0)
      this.tick = 0
    }
  }

  getUpdatedPoints() {
    if (this.isProjector) {
      return this.points
    }
    const points = [
      this.circleWaveOuter.getPoints(CIRCLE_WAVE_POINT_COUNT, this.tick),
      this.circleWaveInner.getPoints(CIRCLE_WAVE_POINT_COUNT, this.tick)
    ]
    this.tick++
    return points
  }
}
