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

const WAVE_POINT_COUNT = 100

export class SkirtIIIForm {

  constructor(width, height) {
    this.width = width
    this.height = height
    const A = this.height / 6
    const F = 1.7
    const S = C.PI / 2000
    const f = 0
    this.eyeWave = new EyeWave(A, F, S, f, C.QUARTER_PI, 0)
    this.tick = 0
  }

  getLines() {
    const rx = this.width / 2
    const ry = this.height / 4
    const points = this.eyeWave.getPoints(rx, ry, WAVE_POINT_COUNT, this.tick)
    const line = new Line(points, 1, true)
    this.tick++
    return [line]
  }
}
