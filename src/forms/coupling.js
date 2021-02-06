import { CircleWave } from '../syntax/circle-wave'
import { Line } from '../line'
import * as C from '../constants'

// https://www.ericforman.com/anthony-mccall-solid-light#6
// https://www.ericforman.com/anthony-mccall-solid-light#7
// https://www.ericforman.com/blog/making-of-solid-light-for-anthony-mccall

const MAX_TICKS = 10000
const CIRCLE_WAVE_POINT_COUNT = 200

export class CouplingForm {

  constructor(outerRadius, innerRadius) {
    this.outerRadius = outerRadius
    this.innerRadius = innerRadius
    const A = (outerRadius - innerRadius) * 0.2
    const F = 3.5
    const S = C.TWO_PI / (MAX_TICKS / 4)
    const f = 0
    this.circleWaveA = new CircleWave(A, F, S, f, C.PI, C.PI)
    this.circleWaveB = new CircleWave(A, F, S, f, -C.HALF_PI, C.PI)
    this.tick = 0
    this.firstTime = true
  }

  get lineCount() {
    return 2
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

  getLines() {
    const tickRatio = this.tick / MAX_TICKS
    const radiusA = this.calcRadiusA(tickRatio)
    const radiusB = this.calcRadiusB(tickRatio)
    const opacityA = this.calcOpacityA(tickRatio)
    const opacityB = this.calcOpacityB(tickRatio)
    const pointsA = radiusA
      ? this.circleWaveA.getPoints(radiusA, CIRCLE_WAVE_POINT_COUNT, this.tick)
      : []
    const pointsB = radiusB
      ? this.circleWaveB.getPoints(radiusB, CIRCLE_WAVE_POINT_COUNT, this.tick).map(this.flipX)
      : []
    const lineA = new Line(pointsA, opacityA)
    const lineB = new Line(pointsB, opacityB)
    const lines = [lineA, lineB]
    this.tick += 1
    if (this.tick > MAX_TICKS) {
      this.firstTime = false
      this.tick = 0
    }
    return lines
  }
}
