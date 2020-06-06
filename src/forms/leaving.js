import * as THREE from 'three'
import { Line } from '../projector'
import { newtonsMethod } from '../newtons-method'
import * as U from '../utils'
import * as C from '../constants'

// Parametric equation of an ellipse:
// x = a * cos(t)
// y = b * sin(t)

// Parametric equation of a travelling wave:
// x = t
// y = a * sin(k * t - wt)

// Parametric equation of a travelling wave rotated ccw by theta:
// x = t * cos(theta) - a * sin(k * t - wt) * sin(theta)
// y = t * sin(theta) + a * sin(k * t - wt) * cos(theta)
// (see https://math.stackexchange.com/questions/245859/rotating-parametric-curve)

const parametricEllipseX = rx =>
  t => rx * Math.cos(t)

const parametricEllipseY = ry =>
  t => ry * Math.sin(t)

const parametricTravellingWaveX = (a, k, wt, theta) =>
  t => t * Math.cos(theta) - a * Math.sin(k * t - wt) * Math.sin(theta)

const parametricTravellingWaveY = (a, k, wt, theta) =>
  t => t * Math.sin(theta) + a * Math.sin(k * t - wt) * Math.cos(theta)

// The following online tool was very useful for finding the derivatives:
// https://www.symbolab.com/solver/derivative-calculator

const parametricEllipseXDerivative = rx =>
  t => -rx * Math.sin(t)

const parametricEllipseYDerivative = ry =>
  t => ry * Math.cos(t)

const parametricTravellingWaveXDerivative = (a, k, wt, theta) =>
  t => Math.cos(theta) - a * Math.sin(theta) * Math.cos(k * t - wt) * k

const parametricTravellingWaveYDerivative = (a, k, wt, theta) =>
  t => Math.sin(theta) + a * Math.cos(theta) * Math.cos(k * t - wt) * k

const easeInOutQuint = x =>
  x < 0.5 ? 16 * x * x * x * x * x : 1 - Math.pow(-2 * x + 2, 5) / 2

const MAX_TICKS = 10000
const ELLIPSE_POINT_COUNT = 100
const TRAVELLING_WAVE_POINT_COUNT = 50

export class LeavingForm {

  constructor(rx, ry, initiallyGrowing) {
    this.rx = rx
    this.ry = ry
    this.growing = initiallyGrowing
    this.tick = 0
  }

  get shapeCount() {
    return 1
  }

  // 0.00 => 0.25: 0.00 => 1.00
  // 0.25 => 0.75: 1.00
  // 0.75 => 1.00: 1.00 => 0.00
  travellingWaveRadiusRatio(tickRatio) {
    if (tickRatio <= 0.25) {
      const t = tickRatio * 4
      return t
    }
    if (tickRatio >= 0.75) {
      const t = (1 - tickRatio) * 4
      return t
    }
    return 1
  }

  // 0.00 => 0.25: -PI/4 => 0
  // 0.25 => 0.75: 0
  // 0.75 => 1.00: 0 => PI/4
  travellingWaveAdditionalRotation(tickRatio) {
    if (tickRatio <= 0.25) {
      const t = 1 - (tickRatio * 4)
      return -(t * C.QUARTER_PI)
    }
    if (tickRatio >= 0.75) {
      const t = (tickRatio - 0.75) * 4
      return t * C.QUARTER_PI
    }
    return 0
  }

  // 0.00 => 0.25: 0 => max
  // 0.25 => 0.50: max => 0
  // 0.50 => 0.75: 0 => max
  // 0.75 => 1.00: max => 0
  travellingWaveAmplitude(tickRatio) {
    const maxAmplitude = 0.15
    if (tickRatio < 0.25) {
      const t = tickRatio * 4
      return maxAmplitude * easeInOutQuint(t)
    }
    if (tickRatio < 0.5) {
      const t = (0.5 - tickRatio) * 4
      return maxAmplitude * t
    }
    if (tickRatio < 0.75) {
      const t = (tickRatio - 0.5) * 4
      return maxAmplitude * t
    }
    const t = (1 - tickRatio) * 4
    return maxAmplitude * easeInOutQuint(t)
  }

  combinePoints(ellipsePoints, travellingWavePoints) {
    const travellingWavePointsTail = travellingWavePoints.slice(1)
    return this.growing
      ? ellipsePoints.concat(travellingWavePointsTail)
      : travellingWavePointsTail.reverse().concat(ellipsePoints)
  }

  getLines() {

    const tickRatio = this.tick / MAX_TICKS
    const a = this.travellingWaveAmplitude(tickRatio)
    const f = 25
    const waveLength = Math.min(this.rx, this.ry)
    const k = C.TWO_PI / waveLength
    const omega = C.TWO_PI * f
    const wt = omega * tickRatio

    const desiredAngle = C.TWO_PI * tickRatio
    const convertedAngle = -C.HALF_PI - desiredAngle
    const theta = convertedAngle - C.PI

    const t1e = convertedAngle
    const t2e = this.rx * Math.cos(convertedAngle)

    const { t1, t2 } = newtonsMethod(
      parametricEllipseX(this.rx),
      parametricEllipseY(this.ry),
      parametricTravellingWaveX(a, k, wt, theta),
      parametricTravellingWaveY(a, k, wt, theta),
      parametricEllipseXDerivative(this.rx),
      parametricEllipseYDerivative(this.ry),
      parametricTravellingWaveXDerivative(a, k, wt, theta),
      parametricTravellingWaveYDerivative(a, k, wt, theta),
      t1e,
      t2e)

    const [startAngle, endAngle] = this.growing
      ? [-C.HALF_PI, t1]
      : [t1, -C.HALF_PI - C.TWO_PI]
    const deltaAngle = (endAngle - startAngle) / ELLIPSE_POINT_COUNT
    const ellipsePoints = U.range(ELLIPSE_POINT_COUNT + 1).map(n => {
      let t = startAngle + n * deltaAngle
      let x = parametricEllipseX(this.rx)(t)
      let y = parametricEllipseY(this.ry)(t)
      return new THREE.Vector2(x, y)
    })

    const p = new THREE.Vector2(parametricEllipseX(this.rx)(t1), parametricEllipseY(this.ry)(t1))
    const radius = p.length()
    const radiusRatio = this.travellingWaveRadiusRatio(tickRatio)
    const deltaRadius = radius * radiusRatio / TRAVELLING_WAVE_POINT_COUNT
    const additionalRotation = this.travellingWaveAdditionalRotation(tickRatio)
    const travellingWavePoints = U.range(TRAVELLING_WAVE_POINT_COUNT + 1).map(n => {
      const t = t2 + n * deltaRadius
      const x = parametricTravellingWaveX(a, k, wt, theta)(t)
      const y = parametricTravellingWaveY(a, k, wt, theta)(t)
      const wavePoint = new THREE.Vector2(x, y)
      return additionalRotation ? wavePoint.rotateAround(p, additionalRotation) : wavePoint
    })

    let combinedPoints = this.combinePoints(ellipsePoints, travellingWavePoints)
    const line = new Line(combinedPoints)
    const lines = [line]

    this.tick += 1
    if (this.tick > MAX_TICKS) {
      this.toggleGrowing()
    }

    return lines
  }

  toggleGrowing() {
    this.growing = !this.growing
    this.tick = 0
  }
}
