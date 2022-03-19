import * as THREE from 'three'
import { Line } from '../line'
import { Ellipse } from '../syntax/ellipse'
import * as U from '../utils'
import * as C from '../constants'

const ELLIPSE_POINT_COUNT = 100
const TRAVELLING_WAVE_POINT_COUNT = 100

export class BreathIIIForm {

  constructor(width, height) {
    this.width = width
    this.height = height
    this.waveLength = width * 3 / 4
    this.rx = Math.min(width, height) / 4
    this.ry = this.rx
    this.tick = 0
  }

  get lineCount() {
    return 1
  }

  getEllipsePoints() {
    return new Ellipse(0, 0, this.rx, this.ry).getPoints(
      0,
      C.TWO_PI,
      ELLIPSE_POINT_COUNT)
  }

  getTravellingWavePoints() {
    const k = C.TWO_PI / this.waveLength
    const f = 1
    const omega = C.TWO_PI * f
    const speed = 0.0001
    const phase = THREE.MathUtils.degToRad(0)
    const dx = this.width / TRAVELLING_WAVE_POINT_COUNT
    return U.range(TRAVELLING_WAVE_POINT_COUNT + 1).map(n => {
      const x = dx * n
      const y = this.height / 2 * Math.sin(k * x - omega * this.tick * speed + phase)
      return new THREE.Vector2(x - this.width / 2, y)
    })
  }

  getLines() {
    const ellipsePoints = this.getEllipsePoints()
    const travellingWavePoints = this.getTravellingWavePoints()
    const lines = [ellipsePoints, travellingWavePoints].map(points => new Line(points))
    this.tick++
    return lines
  }
}
