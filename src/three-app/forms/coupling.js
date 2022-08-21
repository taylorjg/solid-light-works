import * as THREE from 'three'
import { Line } from '../line'
import { parametricCircleWaveX, parametricCircleWaveY } from '../syntax/parametric-circle-wave'
import { CycleTiming } from '../cycle-timing'
import * as C from '../constants'
import * as U from '../utils'

// https://www.ericforman.com/anthony-mccall-solid-light#6
// https://www.ericforman.com/anthony-mccall-solid-light#7
// https://www.ericforman.com/blog/making-of-solid-light-for-anthony-mccall

const MAX_TICKS = 10000
const CIRCLE_WAVE_POINT_COUNT = 200

export class CouplingForm {

  constructor(outerRadius, innerRadius) {
    this.cycleTiming = new CycleTiming(MAX_TICKS)
    this.outerRadius = outerRadius
    this.innerRadius = innerRadius
    this.A = (outerRadius - innerRadius) * 0.2
    this.F = 3.5
    this.S = C.TWO_PI / (MAX_TICKS / 4)
    this.f = 0
    this.width = (outerRadius * 1.1 + this.A) * 2
    this.height = (outerRadius + this.A) * 2
  }

  flipX(pt) {
    return pt.setX(-pt.x)
  }

  // 0.00 => 0.25: outerRadius
  // 0.25 => 0.50: not visible (shrinking: outerRadius => innerRadius)
  // 0.50 => 0.75: innerRadius
  // 0.75 => 1.00: growing: innerRadius => outerRadius
  calcRadiusA(cycleRatio) {
    if (cycleRatio < 0.25) {
      return this.outerRadius
    }
    if (cycleRatio < 0.5) {
      return undefined
    }
    if (cycleRatio < 0.75) {
      return this.innerRadius
    }
    const t = (cycleRatio - 0.75) * 4
    return this.innerRadius + (this.outerRadius - this.innerRadius) * t
  }

  // 0.00 => 0.25: innerRadius
  // 0.25 => 0.50: growing: innerRadius => outerRadius
  // 0.50 => 0.75: outerRadius
  // 0.75 => 1.00: not visible (shrinking: outerRadius => innerRadius)
  calcRadiusB(cycleRatio) {
    if (cycleRatio < 0.25) {
      return this.innerRadius
    }
    if (cycleRatio < 0.5) {
      const t = (cycleRatio - 0.25) * 4
      return this.innerRadius + (this.outerRadius - this.innerRadius) * t
    }
    if (cycleRatio < 0.75) {
      return this.outerRadius
    }
    return undefined
  }

  calcOpacityA(cycleRatio) {
    const duration = 0.01
    const scale = 1 / duration
    if (cycleRatio < (0.25 - duration)) {
      return 1
    }
    if (cycleRatio < 0.25) {
      return (0.25 - cycleRatio) * scale
    }
    if (cycleRatio < (0.5 + duration)) {
      return (cycleRatio - 0.5) * scale
    }
    return 1
  }

  calcOpacityB(cycleRatio, firstTime) {
    const duration = 0.01
    const scale = 1 / duration
    if (cycleRatio < duration) {
      return firstTime ? 1 : cycleRatio * scale
    }
    if (cycleRatio < (0.75 - duration)) {
      return 1
    }
    if (cycleRatio < 0.75) {
      return (0.75 - cycleRatio) * scale
    }
    return 1
  }

  getCircleWavePoints(rx, ry, Φ, φ, tick) {
    const { A, F, S, f } = this
    const Δθ = C.TWO_PI / CIRCLE_WAVE_POINT_COUNT
    return U.range(CIRCLE_WAVE_POINT_COUNT + 1).map(n => {
      const t = Δθ * n
      const x = parametricCircleWaveX(A, F, S, f, Φ, φ, rx, tick)(t)
      const y = parametricCircleWaveY(A, F, S, f, Φ, φ, ry, tick)(t)
      return new THREE.Vector2(x, y)
    })
  }

  getCircleWavePointsA = (r, tick) => {
    if (!r) return []
    const rx = r * 1.1
    const ry = r
    const Φ = C.PI
    const φ = C.PI
    return this.getCircleWavePoints(rx, ry, Φ, φ, tick)
  }

  getCircleWavePointsB = (r, tick) => {
    if (!r) return []
    const rx = r * 1.1
    const ry = r
    const Φ = -C.HALF_PI
    const φ = C.PI
    return this.getCircleWavePoints(rx, ry, Φ, φ, tick).map(this.flipX)
  }

  getFootprintData(deltaMs, absoluteMs) {
    const { cycleRatio, tick, firstTime } = this.cycleTiming.update(deltaMs, absoluteMs)

    const radiusA = this.calcRadiusA(cycleRatio)
    const radiusB = this.calcRadiusB(cycleRatio)

    const opacityA = this.calcOpacityA(cycleRatio)
    const opacityB = this.calcOpacityB(cycleRatio, firstTime)

    const circleWavePointsA = this.getCircleWavePointsA(radiusA, tick)
    const circleWavePointsB = this.getCircleWavePointsB(radiusB, tick)

    const line1 = new Line(circleWavePointsA, { opacity: opacityA })
    const line2 = new Line(circleWavePointsB, { opacity: opacityB })
    const lines = [line1, line2]

    const footprintData = { lines }

    return footprintData
  }
}
