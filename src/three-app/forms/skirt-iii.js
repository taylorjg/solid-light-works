import * as THREE from 'three'
import { Line } from '../line'
import * as C from '../constants'
import * as U from '../utils'

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

const parametricEyeWaveTopX = (xoffset, width, deltaX) =>
  t => xoffset - width / 2 + deltaX * t

const parametricEyeWaveTopY = (A, F, S, f, Φ, φ, height, deltaAngle, tick) =>
  t => {
    const θ = deltaAngle * t
    const ω = A * Math.sin(F * θ + S * tick + Φ) * Math.cos(f * tick + φ)
    return (height + ω) * Math.sin(θ)
  }

const parametricEyeWaveBottomX = (xoffset, width, deltaX) =>
  t => xoffset + width / 2 - deltaX * t

const parametricEyeWaveBottomY = (A, F, S, f, Φ, φ, height, deltaAngle, tick) =>
  t => {
    const θ = C.PI + deltaAngle * t
    const ω = A * Math.sin(F * θ + S * tick + Φ) * Math.cos(f * tick + φ)
    return (height + ω) * Math.sin(θ)
  }

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
    this.tick = 0
    this.ellipseRadiusX = this.width / 2
    this.ellipseRadiusY = this.height / 2
    this.eyeWaveWidth = this.width * 0.75
    this.eyeWaveHeight = this.height / 6
    this.eyeWaveInitialOffsetX = (this.width - this.eyeWaveWidth) / 2
    this.eyeWaveOffsetX = this.eyeWaveInitialOffsetX
  }

  getLines() {
    const xoffset = this.eyeWaveOffsetX - this.eyeWaveInitialOffsetX
    const deltaX = this.eyeWaveWidth / WAVE_POINT_COUNT
    const parametricEyeWaveTopXFn = parametricEyeWaveTopX(xoffset, this.eyeWaveWidth, deltaX)
    const parametricEyeWaveBottomXFn = parametricEyeWaveBottomX(xoffset, this.eyeWaveWidth, deltaX)

    const deltaAngle = C.PI / WAVE_POINT_COUNT
    const A = this.height / 8
    const F = 1.7
    const S = C.PI / 2000
    const f = 0
    const Φ = -C.HALF_PI
    const φ = -C.PI
    const parametricEyeWaveTopYFn = parametricEyeWaveTopY(A, F, S, f, Φ, φ, this.eyeWaveHeight, deltaAngle, this.tick)
    const parametricEyeWaveBottomYFn = parametricEyeWaveBottomY(A, F, S, f, Φ, φ, this.eyeWaveHeight, deltaAngle, this.tick)

    const parametricEllipseXFn = parametricEllipseX(this.ellipseRadiusX)
    const parametricEllipseYFn = parametricEllipseY(this.ellipseRadiusY)

    const getEyeWaveCombinedPoints = () => {
      const mappedPoints1 = U.range(WAVE_POINT_COUNT + 1).map(t => {
        const x = parametricEyeWaveTopXFn(t)
        const y = parametricEyeWaveTopYFn(t)
        return new THREE.Vector2(x, y)
      })

      const mappedPoints2 = U.range(WAVE_POINT_COUNT + 1).map(t => {
        const x = parametricEyeWaveBottomXFn(t)
        const y = parametricEyeWaveBottomYFn(t)
        return new THREE.Vector2(x, y)
      })

      return U.combinePoints(mappedPoints1, mappedPoints2)
    }

    const getEllipsePoints = (angle1, angle2) => {
      const pointCount = ELLIPSE_POINT_COUNT
      const deltaAngle = (angle2 - angle1) / pointCount
      return U.range(pointCount + 1).map(n => {
        const t = angle1 + n * deltaAngle
        const x = parametricEllipseXFn(t)
        const y = parametricEllipseYFn(t)
        return new THREE.Vector2(x, y)
      })
    }

    const eyeWavePoints = getEyeWaveCombinedPoints()
    const ellipseTopPoints = getEllipsePoints(0, C.PI * 5 / 8)
    const ellipseBottomPoints = getEllipsePoints(C.PI, C.PI + C.PI * 5 / 8)

    const line1 = new Line(eyeWavePoints, 1, true)
    const line2 = new Line(ellipseTopPoints)
    const line3 = new Line(ellipseBottomPoints)

    this.tick++
    this.eyeWaveOffsetX = (this.eyeWaveOffsetX + 0.001) % (this.width)

    return [line1, line2, line3]
  }
}
