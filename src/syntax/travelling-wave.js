import * as THREE from 'three'
import * as U from '../utils'
import * as C from '../constants'

// http://labman.phys.utk.edu/phys221core/modules/m11/traveling_waves.html

// Consider a transverse harmonic wave traveling in the positive x-direction.
// Harmonic waves are sinusoidal waves.
// The displacement y of a particle in the medium is given as a function of x and t by
//
//   y(x,t) = A sin(kx - ωt + φ)
//
// Here k is the wave number, k = 2π/λ, and ω = 2π/T = 2πf is the angular frequency of the wave.
// φ is called the phase constant.

export class TravellingWave {

  constructor(cx, cy, width, height, vertical) {
    this.cx = cx
    this.cy = cy
    this.width = width
    this.height = height
    this.vertical = vertical
    this.k = 1 // k = 2π/λ
    this.omega = 1 // ω = 2π/T = 2πf
    this.phase = vertical ? C.PI / 180 * 250 : C.PI // phase constant
  }

  getPointsHorizontal(divisions, t) {
    const dx = this.width / divisions
    return U.range(divisions + 1).map(index => {
      const x = dx * index
      const y = this.height / 2 * Math.sin(this.k * x - this.omega * t * 0.0005 + this.phase)
      return new THREE.Vector2(this.cx - this.width / 2 + x, this.cy + y)
    })
  }

  getPointsVertical(divisions, t) {
    const dx = this.height / divisions
    return U.range(divisions + 1).map(index => {
      const x = dx * index
      const y = this.height / 2 * Math.sin(this.k * x - this.omega * t * 0.0005 + this.phase)
      return new THREE.Vector2(this.cx + y, this.cy - this.height / 2 + x)
    })
  }

  getPoints(divisions, t) {
    return this.vertical
      ? this.getPointsVertical(divisions, t)
      : this.getPointsHorizontal(divisions, t)
  }
}
