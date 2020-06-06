import * as THREE from 'three'
import lineclip from 'lineclip'
import { Line } from '../projector'
import { Ellipse } from '../syntax/ellipse'
import * as U from '../utils'
import * as C from '../constants'

const ELLIPSE_POINT_COUNT = 100
const TRAVELLING_WAVE_POINT_COUNT = 100
const MAX_TICKS = 10000

export class BetweenYouAndIForm {

  constructor(width, height, initiallyWipingInEllipse) {
    this.width = width
    this.height = height
    this.rx = width / 2
    this.ry = height / 2
    this.minX = -this.rx
    this.maxX = this.rx
    this.minY = -this.ry
    this.maxY = this.ry
    this.reset(initiallyWipingInEllipse)
  }

  get shapeCount() {
    return 3
  }

  getEllipsePoints(tickRatio, wipeY) {
    const theta = Math.acos(wipeY / this.ry)

    const [startAngle, endAngle] = this.wipingInEllipse
      ? [theta, -theta]
      : [-theta, theta - C.TWO_PI]

    const rx = this.rx - Math.sin(C.PI * tickRatio)

    return new Ellipse(0, 0, rx, this.ry).getPoints(
      startAngle + C.HALF_PI,
      endAngle + C.HALF_PI,
      ELLIPSE_POINT_COUNT)
  }

  getTravellingWavePoints(tickRatio, wipeY, wipeExtent) {
    // http://labman.phys.utk.edu/phys221core/modules/m11/traveling_waves.html
    // y(x,t) = A sin(kx - ωt + φ)
    // Here k is the wave number, k = 2π/λ,
    // and ω = 2π/T = 2πf is the angular frequency of the wave.
    // φ is called the phase constant.

    const lambda = this.height
    const k = C.TWO_PI / lambda
    const f = 2
    const omega = C.TWO_PI * f

    if (this.wipingInEllipse) {
      const dy = (this.height - wipeExtent) / TRAVELLING_WAVE_POINT_COUNT
      return U.range(TRAVELLING_WAVE_POINT_COUNT + 1).map(n => {
        const y = n * dy
        const x = this.rx * Math.sin(k * y + omega * tickRatio)
        return new THREE.Vector2(x, wipeY - y)
      })
    } else {
      const dy = wipeExtent / TRAVELLING_WAVE_POINT_COUNT
      return U.range(TRAVELLING_WAVE_POINT_COUNT + 1).map(n => {
        const y = n * dy
        const x = this.rx * Math.sin(k * -y + omega * tickRatio)
        return new THREE.Vector2(x, wipeY + y)
      })
    }
  }

  getStraightLinePoints(tickRatio, wipeY) {
    const minY = this.wipingInEllipse ? this.minY : wipeY
    const maxY = this.wipingInEllipse ? wipeY : this.maxY

    const theta = -C.QUARTER_PI + (C.PI * tickRatio)
    const px = this.width * Math.cos(theta)
    const py = this.height * Math.sin(theta)

    const points = [[px, py], [-px, -py]]
    const bbox = [this.minX, minY, this.maxX, maxY]
    const clippedLines = lineclip(points, bbox)

    return clippedLines.length
      ? clippedLines[0].map(([x, y]) => new THREE.Vector2(x, y))
      : U.repeat(2, new THREE.Vector2())
  }

  getLines() {
    const tickRatio = this.tick / MAX_TICKS
    const wipeExtent = this.height * tickRatio
    const wipeY = this.maxY - wipeExtent
    const pointss = [
      this.getEllipsePoints(tickRatio, wipeY),
      this.getTravellingWavePoints(tickRatio, wipeY, wipeExtent),
      this.getStraightLinePoints(tickRatio, wipeY)
    ]
    const lines = pointss.map(points => new Line(points))
    this.tick++
    if (this.tick > MAX_TICKS) {
      this.reset(!this.wipingInEllipse)
    }
    return lines
  }

  reset(wipingInEllipse) {
    this.tick = 0
    this.wipingInEllipse = wipingInEllipse
  }
}
