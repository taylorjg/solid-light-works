import * as THREE from 'three'
import { Line } from '../line'
import {
  parametricEllipseX,
  parametricEllipseY,
  parametricEllipseXDerivative,
  parametricEllipseYDerivative
} from '../syntax/parametric-ellipse'
import {
  parametricRotatingTravellingWaveX,
  parametricRotatingTravellingWaveY,
  parametricRotatingTravellingWaveXDerivative,
  parametricRotatingTravellingWaveYDerivative
} from '../syntax/parametric-rotating-travelling-wave'
import { newtonsMethod } from '../newtons-method'
import * as C from '../constants'
import * as U from '../utils'

const easeInOutQuint = x =>
  x < 0.5 ? 16 * x * x * x * x * x : 1 - Math.pow(-2 * x + 2, 5) / 2

const MAX_TICKS = 10000
const ELLIPSE_POINT_COUNT = 100
const TRAVELLING_WAVE_POINT_COUNT = 50

export class LeavingForm {

  constructor(rx, ry, initiallyGrowing) {
    this.width = 2 * rx
    this.height = 2 * ry
    this.rx = rx - C.LINE_THICKNESS / 2
    this.ry = ry - C.LINE_THICKNESS / 2
    this.growing = initiallyGrowing
    this.tick = 0
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

  getLines() {

    const tickRatio = this.tick / MAX_TICKS
    const A = this.travellingWaveAmplitude(tickRatio)
    const f = 25
    const waveLength = Math.min(this.rx, this.ry)
    const k = C.TWO_PI / waveLength
    const ω = C.TWO_PI * f
    const ωt = ω * tickRatio

    const desiredAngle = C.TWO_PI * tickRatio
    const convertedAngle = -C.HALF_PI - desiredAngle
    const θ = convertedAngle - C.PI

    const t1Guess = convertedAngle
    const t2Guess = this.rx * Math.cos(convertedAngle)

    const parametricEllipseXFn = parametricEllipseX(this.rx)
    const parametricEllipseYFn = parametricEllipseY(this.ry)
    const parametricEllipseXDerivativeFn = parametricEllipseXDerivative(this.rx)
    const parametricEllipseYDerivativeFn = parametricEllipseYDerivative(this.ry)

    const parametricRotatingTravellingWaveXFn = parametricRotatingTravellingWaveX(A, k, ωt, θ)
    const parametricRotatingTravellingWaveYFn = parametricRotatingTravellingWaveY(A, k, ωt, θ)
    const parametricRotatingTravellingWaveXDerivativeFn = parametricRotatingTravellingWaveXDerivative(A, k, ωt, θ)
    const parametricRotatingTravellingWaveYDerivativeFn = parametricRotatingTravellingWaveYDerivative(A, k, ωt, θ)

    const { t1, t2 } = newtonsMethod(
      parametricEllipseXFn,
      parametricEllipseYFn,
      parametricRotatingTravellingWaveXFn,
      parametricRotatingTravellingWaveYFn,
      parametricEllipseXDerivativeFn,
      parametricEllipseYDerivativeFn,
      parametricRotatingTravellingWaveXDerivativeFn,
      parametricRotatingTravellingWaveYDerivativeFn,
      t1Guess,
      t2Guess)

    const [θ1, θ2] = this.growing
      ? [-C.HALF_PI, t1]
      : [t1, -C.HALF_PI - C.TWO_PI]
    const Δθ = (θ2 - θ1) / ELLIPSE_POINT_COUNT
    const ellipsePoints = U.range(ELLIPSE_POINT_COUNT + 1).map(n => {
      const t = θ1 + n * Δθ
      const x = parametricEllipseXFn(t)
      const y = parametricEllipseYFn(t)
      return new THREE.Vector2(x, y)
    })

    const p = new THREE.Vector2(parametricEllipseXFn(t1), parametricEllipseYFn(t1))
    const radius = p.length()
    const radiusRatio = this.travellingWaveRadiusRatio(tickRatio)
    const Δr = radius * radiusRatio / TRAVELLING_WAVE_POINT_COUNT
    const additionalRotation = this.travellingWaveAdditionalRotation(tickRatio)
    const travellingWavePoints = U.range(TRAVELLING_WAVE_POINT_COUNT + 1).map(n => {
      const t = t2 + n * Δr
      const x = parametricRotatingTravellingWaveXFn(t)
      const y = parametricRotatingTravellingWaveYFn(t)
      const wavePoint = new THREE.Vector2(x, y)
      return additionalRotation ? wavePoint.rotateAround(p, additionalRotation) : wavePoint
    })

    const combinedPoints = this.growing
      ? U.combinePoints(ellipsePoints, travellingWavePoints)
      : U.combinePoints(ellipsePoints.reverse(), travellingWavePoints.reverse())

    const line = new Line(combinedPoints)
    const lines = [line]

    this.tick += 1
    if (this.tick > MAX_TICKS) {
      this.toggleGrowing()
    }

    lines.intersectionPoints = [p]
    return lines
  }

  toggleGrowing() {
    this.growing = !this.growing
    this.tick = 0
  }
}
