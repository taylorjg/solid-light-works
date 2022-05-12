import * as THREE from 'three'
import { parametricCircleWaveX, parametricCircleWaveY } from './parametric-circle-wave'
import * as C from '../constants'
import * as U from '../utils'

export class CircleWave {
  constructor(A, F, S, f, Φ, φ) {
    this.A = A
    this.F = F
    this.S = S
    this.f = f
    this.Φ = Φ
    this.φ = φ
  }

  getPoints(rx, ry, pointCount, tick) {
    const { A, F, S, f, Φ, φ } = this
    const Δθ = C.TWO_PI / pointCount
    return U.range(pointCount + 1).map(n => {
      const t = Δθ * n
      const x = parametricCircleWaveX(A, F, S, f, Φ, φ, rx, tick)(t)
      const y = parametricCircleWaveY(A, F, S, f, Φ, φ, ry, tick)(t)
      return new THREE.Vector2(x, y)
    })
  }
}
