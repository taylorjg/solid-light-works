import * as THREE from 'three'
import { Line } from '../line'
import { parametricCircleWaveX, parametricCircleWaveY } from '../syntax/parametric-circle-wave'
import * as C from '../constants'
import * as U from '../utils'

// https://www.ericforman.com/anthony-mccall-solid-light#6
// https://www.ericforman.com/anthony-mccall-solid-light#7
// https://www.ericforman.com/blog/making-of-solid-light-for-anthony-mccall

const MAX_TICKS = 10000
const CIRCLE_WAVE_POINT_COUNT = 200

export class CouplingForm {

  constructor(outerRadius, innerRadius) {
    this.outerRadius = outerRadius
    this.innerRadius = innerRadius
    this.A = (outerRadius - innerRadius) * 0.2
    this.F = 3.5
    this.S = C.TWO_PI / (MAX_TICKS / 4)
    this.f = 0
    this.tick = 0
    this.firstTime = true
  }

  flipX(pt) {
    return pt.setX(-pt.x)
  }

  // 0.00 => 0.25: outerRadius
  // 0.25 => 0.50: not visible (shrinking: outerRadius => innerRadius)
  // 0.50 => 0.75: innerRadius
  // 0.75 => 1.00: growing: innerRadius => outerRadius
  calcRadiusA(tickRatio) {
    if (tickRatio < 0.25) {
      return this.outerRadius
    }
    if (tickRatio < 0.5) {
      return undefined
    }
    if (tickRatio < 0.75) {
      return this.innerRadius
    }
    const t = (tickRatio - 0.75) * 4
    return this.innerRadius + (this.outerRadius - this.innerRadius) * t
  }

  // 0.00 => 0.25: innerRadius
  // 0.25 => 0.50: growing: innerRadius => outerRadius
  // 0.50 => 0.75: outerRadius
  // 0.75 => 1.00: not visible (shrinking: outerRadius => innerRadius)
  calcRadiusB(tickRatio) {
    if (tickRatio < 0.25) {
      return this.innerRadius
    }
    if (tickRatio < 0.5) {
      const t = (tickRatio - 0.25) * 4
      return this.innerRadius + (this.outerRadius - this.innerRadius) * t
    }
    if (tickRatio < 0.75) {
      return this.outerRadius
    }
    return undefined
  }

  calcOpacityA(tickRatio) {
    const duration = 0.01
    const scale = 1 / duration
    if (tickRatio < (0.25 - duration)) {
      return 1
    }
    if (tickRatio < 0.25) {
      return (0.25 - tickRatio) * scale
    }
    if (tickRatio < (0.5 + duration)) {
      return (tickRatio - 0.5) * scale
    }
    return 1
  }

  calcOpacityB(tickRatio) {
    const duration = 0.01
    const scale = 1 / duration
    if (tickRatio < duration) {
      return this.firstTime ? 1 : tickRatio * scale
    }
    if (tickRatio < (0.75 - duration)) {
      return 1
    }
    if (tickRatio < 0.75) {
      return (0.75 - tickRatio) * scale
    }
    return 1
  }

  getCircleWavePoints(rx, ry, Φ, φ) {
    const { A, F, S, f, tick } = this
    const Δθ = C.TWO_PI / CIRCLE_WAVE_POINT_COUNT
    return U.range(CIRCLE_WAVE_POINT_COUNT + 1).map(n => {
      const t = Δθ * n
      const x = parametricCircleWaveX(A, F, S, f, Φ, φ, rx, tick)(t)
      const y = parametricCircleWaveY(A, F, S, f, Φ, φ, ry, tick)(t)
      return new THREE.Vector2(x, y)
    })
  }

  getCircleWavePointsA = r => {
    if (!r) return []
    const rx = r * 1.1
    const ry = r
    const Φ = C.PI
    const φ = C.PI
    return this.getCircleWavePoints(rx, ry, Φ, φ)
  }

  getCircleWavePointsB = r => {
    if (!r) return []
    const rx = r * 1.1
    const ry = r
    const Φ = -C.HALF_PI
    const φ = C.PI
    return this.getCircleWavePoints(rx, ry, Φ, φ).map(this.flipX)
  }

  getLines() {
    const tickRatio = this.tick / MAX_TICKS
    const radiusA = this.calcRadiusA(tickRatio)
    const radiusB = this.calcRadiusB(tickRatio)
    const opacityA = this.calcOpacityA(tickRatio)
    const opacityB = this.calcOpacityB(tickRatio)
    const circleWavePointsA = this.getCircleWavePointsA(radiusA)
    const circleWavePointsB = this.getCircleWavePointsB(radiusB)
    const line1 = new Line(circleWavePointsA, { opacity: opacityA })
    const line2 = new Line(circleWavePointsB, { opacity: opacityB })
    const lines = [line1, line2]
    this.tick += 1
    if (this.tick > MAX_TICKS) {
      this.firstTime = false
      this.tick = 0
    }
    return lines
  }
}
