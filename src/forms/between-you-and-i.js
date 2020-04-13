import * as THREE from 'three'
import lineclip from 'lineclip'
import { Ellipse } from '../syntax/ellipse'
import * as U from '../utils'
import * as C from '../constants'

const ELLIPSE_POINT_COUNT = 100
const TRAVELLING_WAVE_POINT_COUNT = 100
const RX = 1.5
const RY = 2
const MAX_TICKS = 10000

export class BetweenYouAndIForm {

  constructor(initiallyWipingInEllipse, distance) {
    this.distance = distance
    this.reset(initiallyWipingInEllipse)
  }

  get shapeCount() {
    return 3
  }

  getEllipsePoints(wipeExtent) {
    const y = RY - wipeExtent
    const theta = Math.acos(y / RY)

    const startAngle = this.wipingInEllipse
      ? C.HALF_PI + theta
      : C.HALF_PI - theta

    const endAngle = this.wipingInEllipse
      ? C.HALF_PI - theta
      : C.HALF_PI - (C.TWO_PI - theta)

    const rx = RX - (1 * Math.sin(C.PI * this.tick / MAX_TICKS))

    const ellipse = new Ellipse(0, this.distance, rx, RY)
    return ellipse.getPoints(startAngle, endAngle, ELLIPSE_POINT_COUNT)
  }

  getTravellingWavePoints(wipeExtent) {
    // http://labman.phys.utk.edu/phys221core/modules/m11/traveling_waves.html
    // y(x,t) = A sin(kx - ωt + φ)
    // Here k is the wave number, k = 2π/λ,
    // and ω = 2π/T = 2πf is the angular frequency of the wave.
    // φ is called the phase constant.

    const thresholdY = this.distance + RY - wipeExtent
    const lambda = 2 * RY
    const k = C.TWO_PI / lambda
    const f = 2
    const omega = C.TWO_PI * f
    const t = this.tick / MAX_TICKS

    if (this.wipingInEllipse) {
      const dy = (2 * RY - wipeExtent) / TRAVELLING_WAVE_POINT_COUNT
      return U.range(TRAVELLING_WAVE_POINT_COUNT + 1).map(n => {
        const y = n * dy
        const x = RX * Math.sin(k * y + omega * t)
        return new THREE.Vector2(x, thresholdY - y)
      })
    } else {
      const dy = wipeExtent / TRAVELLING_WAVE_POINT_COUNT
      return U.range(TRAVELLING_WAVE_POINT_COUNT + 1).map(n => {
        const y = n * dy
        const x = RX * Math.sin(k * -y + omega * t)
        return new THREE.Vector2(x, thresholdY + y)
      })
    }
  }

  getStraightLinePoints(wipeExtent) {
    const cx = 0
    const cy = this.distance
    const thresholdY = this.distance + RY - wipeExtent
    const theta = -C.QUARTER_PI + (C.PI * this.tick / MAX_TICKS)

    const aabb = {
      minX: -RX,
      maxX: RX,
      minY: this.wipingInEllipse ? this.distance - RY : thresholdY,
      maxY: this.wipingInEllipse ? thresholdY : this.distance + RY
    }

    const p1x = cx + 2 * RX * Math.cos(theta)
    const p1y = cy + 2 * RY * Math.sin(theta)

    const p2x = cx - 2 * RX * Math.cos(theta)
    const p2y = cy - 2 * RY * Math.sin(theta)

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
    const min = this.distance - RY
    const max = this.distance + RY
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
