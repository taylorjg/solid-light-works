import * as THREE from 'three'
import { Line } from '../line'
import { EyeWave } from '../syntax/eye-wave'
import * as U from '../utils'
import * as C from '../constants'

// Parametric equation of an ellipse:
// x = a * cos(t)
// y = b * sin(t)

// Parametric equation of a travelling wave:
// x = t
// y = a * sin(k * t - wt + phi)

const parametricEllipseX = rx =>
  t => rx * Math.cos(t)

const parametricEllipseY = ry =>
  t => ry * Math.sin(t)

const parametricTravellingWaveX = xoffset =>
  t => t + xoffset

const parametricTravellingWaveY = (a, k, wt, phi) =>
  t => a * Math.sin(k * t - wt + phi)

// The following online tool was very useful for finding the derivatives:
// https://www.symbolab.com/solver/derivative-calculator

const parametricEllipseXDerivative = rx =>
  t => -rx * Math.sin(t)

const parametricEllipseYDerivative = ry =>
  t => ry * Math.cos(t)

const parametricTravellingWaveXDerivative = xoffset =>
  t => 1

const parametricTravellingWaveYDerivative = (a, k, wt, phi) =>
  t => a * Math.cos(k * t - wt + phi) * k

const ELLIPSE_POINT_COUNT = 100
const WAVE_POINT_COUNT = 100

export class SkirtIIIForm {

  constructor(width, height) {
    this.width = width
    this.height = height
    const A = this.height / 8
    const F = 1.7
    const S = C.PI / 2000
    const f = 0
    this.eyeWave = new EyeWave(A, F, S, f, -C.HALF_PI, -C.PI)
    this.tick = 0
    this.ellipseRadiusX = this.width / 2
    this.ellipseRadiusY = this.height / 2
    this.eyeWaveRadiusX = this.width * 0.75 / 2
    this.eyeWaveRadiusY = this.height / 6
    this.fudge = this.ellipseRadiusX - this.eyeWaveRadiusX
    this.eyeWaveOffsetX = this.fudge
  }

  getEllipsePoints(angle1, angle2) {
    const parametricEllipseXFn = parametricEllipseX(this.ellipseRadiusX)
    const parametricEllipseYFn = parametricEllipseY(this.ellipseRadiusY)
    const pointCount = ELLIPSE_POINT_COUNT
    const deltaAngle = (angle2 - angle1) / pointCount
    return U.range(pointCount + 1).map(n => {
      const t = angle1 + n * deltaAngle
      const x = parametricEllipseXFn(t)
      const y = parametricEllipseYFn(t)
      return new THREE.Vector2(x, y)
    })
  }

  getEyeWaveCombinedPoints() {
    const topPoints = this.eyeWave.getTopPoints(
      this.eyeWaveRadiusX,
      this.eyeWaveRadiusY,
      WAVE_POINT_COUNT,
      this.tick)

    const bottomPoints = this.eyeWave.getBottomPoints(
      this.eyeWaveRadiusX,
      this.eyeWaveRadiusY,
      WAVE_POINT_COUNT,
      this.tick)

    const offsetX = dx => pt => pt.setX(pt.x + dx)

    const mappedPoints1 = topPoints.map(offsetX(this.eyeWaveOffsetX - this.fudge))
    const mappedPoints2 = bottomPoints.map(offsetX(this.eyeWaveOffsetX - this.fudge))

    return U.combinePoints(mappedPoints1, mappedPoints2)
  }

  getLines() {
    const eyeWavePoints = this.getEyeWaveCombinedPoints()
    const ellipseTopPoints = this.getEllipsePoints(0, C.PI * 5 / 8)
    const ellipseBottomPoints = this.getEllipsePoints(C.PI, C.PI + C.PI * 5 / 8)
    const line1 = new Line(eyeWavePoints, 1, true)
    const line2 = new Line(ellipseTopPoints)
    const line3 = new Line(ellipseBottomPoints)

    this.tick++
    this.eyeWaveOffsetX = (this.eyeWaveOffsetX + 0.001) % (this.width)

    return [line1, line2, line3]
  }
}
