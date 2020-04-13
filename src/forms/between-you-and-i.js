import * as THREE from 'three'
import lineclip from 'lineclip'
import { Ellipse } from '../syntax/ellipse'
import * as U from '../utils'
import * as C from '../constants'

const ELLIPSE_POINT_COUNT = 100
const TRAVELLING_WAVE_POINT_COUNT = 100
const MAX_TICKS = 10000

export class BetweenYouAndIForm {

  constructor(rx, ry, initiallyWipingInEllipse) {
    this.rx = rx
    this.ry = ry
    this.reset(initiallyWipingInEllipse)
  }

  get shapeCount() {
    return 3
  }

  getEllipsePoints(wipeExtent) {
    const y = this.ry - wipeExtent
    const theta = Math.acos(y / this.ry)

    const startAngle = this.wipingInEllipse
      ? C.HALF_PI + theta
      : C.HALF_PI - theta

    const endAngle = this.wipingInEllipse
      ? C.HALF_PI - theta
      : C.HALF_PI - (C.TWO_PI - theta)

    const rx = this.rx - Math.sin(C.PI * this.tick / MAX_TICKS)

    const ellipse = new Ellipse(0, 0, rx, this.ry)
    return ellipse.getPoints(startAngle, endAngle, ELLIPSE_POINT_COUNT)
  }

  getTravellingWavePoints(wipeExtent) {
    // http://labman.phys.utk.edu/phys221core/modules/m11/traveling_waves.html
    // y(x,t) = A sin(kx - ωt + φ)
    // Here k is the wave number, k = 2π/λ,
    // and ω = 2π/T = 2πf is the angular frequency of the wave.
    // φ is called the phase constant.

    const thresholdY = this.ry - wipeExtent
    const lambda = 2 * this.ry
    const k = C.TWO_PI / lambda
    const f = 2
    const omega = C.TWO_PI * f
    const t = this.tick / MAX_TICKS

    if (this.wipingInEllipse) {
      const dy = (2 * this.ry - wipeExtent) / TRAVELLING_WAVE_POINT_COUNT
      return U.range(TRAVELLING_WAVE_POINT_COUNT + 1).map(n => {
        const y = n * dy
        const x = this.rx * Math.sin(k * y + omega * t)
        return new THREE.Vector2(x, thresholdY - y)
      })
    } else {
      const dy = wipeExtent / TRAVELLING_WAVE_POINT_COUNT
      return U.range(TRAVELLING_WAVE_POINT_COUNT + 1).map(n => {
        const y = n * dy
        const x = this.rx * Math.sin(k * -y + omega * t)
        return new THREE.Vector2(x, thresholdY + y)
      })
    }
  }

  getStraightLinePoints(wipeExtent) {
    const thresholdY = this.ry - wipeExtent
    const theta = -C.QUARTER_PI + (C.PI * this.tick / MAX_TICKS)

    const aabb = {
      minX: -this.rx,
      maxX: this.rx,
      minY: this.wipingInEllipse ? -this.ry : thresholdY,
      maxY: this.wipingInEllipse ? thresholdY : this.ry
    }

    const p1x = 2 * this.rx * Math.cos(theta)
    const p1y = 2 * this.ry * Math.sin(theta)

    const p2x = -2 * this.rx * Math.cos(theta)
    const p2y = -2 * this.ry * Math.sin(theta)

    const clippedLines = lineclip(
      [[p1x, p1y], [p2x, p2y]],
      [aabb.minX, aabb.minY, aabb.maxX, aabb.maxY])

    if (clippedLines.length === 0) {
      return U.repeat(2, new THREE.Vector2())
    }

    return [
      new THREE.Vector2().fromArray(clippedLines[0][0]),
      new THREE.Vector2().fromArray(clippedLines[0][1])
    ]
  }

  getUpdatedPoints() {
    const min = -this.ry
    const max = this.ry
    const wipeExtent = (max - min) * this.tick / MAX_TICKS
    const points = [
      this.getEllipsePoints(wipeExtent),
      this.getTravellingWavePoints(wipeExtent),
      this.getStraightLinePoints(wipeExtent)
    ]
    this.tick++
    if (this.tick > MAX_TICKS) {
      this.reset(!this.wipingInEllipse)
    }
    return points
  }

  reset(wipingInEllipse) {
    this.tick = 0
    this.wipingInEllipse = wipingInEllipse
  }
}
