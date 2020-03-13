import * as THREE from 'three'
import * as U from '../utils'

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

  constructor(cx, cy, width, height) {
    this.cx = cx
    this.cy = cy
    this.width = width
    this.height = height
    this.k = 1 // k = 2π/λ
    this.omega = 1 // ω = 2π/T = 2πf
    this.phase = 0 // phase constant
  }

  getPoints(divisions, t) {
    const left = this.cx - this.width / 2
    const dx = this.width / divisions
    return U.range(divisions + 1).map(index => {
      const x = dx * index
      const y = this.height * Math.sin(this.k * x - this.omega * t / 500 + this.phase)
      return new THREE.Vector2(left + x, this.cy + y)
    })
  }
}
