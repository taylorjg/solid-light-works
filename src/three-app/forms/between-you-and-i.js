import * as THREE from 'three'
import lineclip from 'lineclip'
import { Line } from '../line'
import { Ellipse } from '../syntax/ellipse'
import * as C from '../constants'
import * as U from '../utils'

// Parametric equation of an ellipse:
// x = a * cos(t)
// y = b * sin(t)

const parametricEllipseX = rx =>
  t => rx * Math.cos(t)

const parametricEllipseY = ry =>
  t => ry * Math.sin(t)

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
    this.tick = 0
    this.wipingInEllipse = initiallyWipingInEllipse
  }

  getEllipsePoints(tickRatio, wipeY) {
    const θ = Math.acos(wipeY / this.ry)

    const [startAngle, endAngle] = this.wipingInEllipse
      ? [θ, -θ]
      : [-θ, θ - C.TWO_PI]

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

    const λ = this.height
    const k = C.TWO_PI / λ
    const f = 2
    const ω = C.TWO_PI * f
    const ωt = ω * tickRatio

    if (this.wipingInEllipse) {
      const Δy = (this.height - wipeExtent) / TRAVELLING_WAVE_POINT_COUNT
      return U.range(TRAVELLING_WAVE_POINT_COUNT + 1).map(n => {
        const y = n * Δy
        const x = this.rx * Math.sin(k * y + ωt)
        return new THREE.Vector2(x, wipeY - y)
      })
    } else {
      const Δy = wipeExtent / TRAVELLING_WAVE_POINT_COUNT
      return U.range(TRAVELLING_WAVE_POINT_COUNT + 1).map(n => {
        const y = n * Δy
        const x = this.rx * Math.sin(k * -y + ωt)
        return new THREE.Vector2(x, wipeY + y)
      })
    }
  }

  getStraightLinePoints(tickRatio, wipeY) {
    const minY = this.wipingInEllipse ? this.minY : wipeY
    const maxY = this.wipingInEllipse ? wipeY : this.maxY

    const θ = -C.QUARTER_PI + (C.PI * tickRatio)
    const px = this.width * Math.cos(θ)
    const py = this.height * Math.sin(θ)

    const points = [[px, py], [-px, -py]]
    const bbox = [this.minX, minY, this.maxX, maxY]
    const clippedLines = lineclip(points, bbox)

    return clippedLines.length
      ? clippedLines[0].map(([x, y]) => new THREE.Vector2(x, y))
      : Array(2).fill(new THREE.Vector2())
  }

  getLines() {
    const tickRatio = this.tick / MAX_TICKS
    const wipeExtent = this.height * tickRatio
    const wipeY = this.maxY - wipeExtent
    const ellipsePoints = this.getEllipsePoints(tickRatio, wipeY)
    const travellingWavePoints = this.getTravellingWavePoints(tickRatio, wipeY, wipeExtent)
    const straightLinePoints = this.getStraightLinePoints(tickRatio, wipeY)
    const lines = [ellipsePoints, travellingWavePoints, straightLinePoints].map(points => new Line(points))
    this.tick++
    if (this.tick > MAX_TICKS) {
      this.toggleWipeMode()
    }
    return lines
  }

  toggleWipeMode() {
    this.tick = 0
    this.wipingInEllipse = !this.wipingInEllipse
  }
}
