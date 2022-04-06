import * as THREE from 'three'
import * as U from '../utils'
import * as C from '../constants'

// Anthony McCall: Notebooks and Conversations, p155
// Top drawing has a vague mention of an "eye wave" which seems to be a
// travelling wave applied to a single cycle of sine wave with the second
// half of the wave folded back on itself.

// A bit similar to a circle wave described here:
// https://www.ericforman.com/blog/making-of-solid-light-for-anthony-mccall

export class EyeWave {

  constructor(A, F, S, f, Φ, φ) {
    this.A = A
    this.F = F
    this.S = S
    this.f = f
    this.Φ = Φ
    this.φ = φ
  }

  _ω(θ, t) {
    const { A, F, S, f, Φ, φ } = this
    return A * Math.sin(F * θ + S * t + Φ) * Math.cos(f * t + φ)
  }

  // getPoints(rx, ry, divisions, t) {
  //   const xoffset = -rx
  //   const totalX = rx * 4
  //   const deltaX = totalX / divisions
  //   const deltaAngle = C.TWO_PI / divisions
  //   return U.range(divisions + 1).map(index => {
  //     const θ = deltaAngle * index
  //     const x = θ <= C.PI
  //       ? deltaX * index
  //       : (totalX - deltaX * index)
  //     const ω = this._ω(θ, t)
  //     const y = (ry + ω) * Math.sin(θ)
  //     return new THREE.Vector2(x + xoffset, y)
  //   })
  // }

  getTopPoints(rx, ry, divisions, t) {
    const xoffset = -rx
    const totalX = rx * 2
    const deltaX = totalX / divisions
    const deltaAngle = C.PI / divisions
    return U.range(divisions + 1).map(index => {
      const x = deltaX * index
      const θ = deltaAngle * index
      const ω = this._ω(θ, t)
      const y = (ry + ω) * Math.sin(θ)
      return new THREE.Vector2(x + xoffset, y)
    })
  }

  getBottomPoints(rx, ry, divisions, t) {
    const xoffset = -rx
    const totalX = rx * 2
    const deltaX = totalX / divisions
    const deltaAngle = C.PI / divisions
    return U.range(divisions + 1).map(index => {
      const x = totalX - deltaX * index
      const θ = C.PI + deltaAngle * index
      const ω = this._ω(θ, t)
      const y = (ry + ω) * Math.sin(θ)
      return new THREE.Vector2(x + xoffset, y)
    })
  }
}
