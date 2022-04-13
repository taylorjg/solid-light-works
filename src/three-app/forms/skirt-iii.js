import * as THREE from 'three'
import { Line } from '../line'
import { newtonsMethod } from '../newtons-method'
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

const parametricEyeWaveX = xoffset =>
  t => t + xoffset

const parametricEyeWaveY = (R, A, F, S, f, Φ, φ, k, tick, θoffset) =>
  t => {
    const θ = θoffset + k * t
    const ω = A * Math.sin(F * θ + S * tick + Φ) * Math.cos(f * tick + φ)
    return (R + ω) * Math.sin(θ)
  }

// The following online tool was very useful for finding the derivatives:
// https://www.symbolab.com/solver/derivative-calculator

const parametricEllipseXDerivative = rx =>
  t => -rx * Math.sin(t)

const parametricEllipseYDerivative = ry =>
  t => ry * Math.cos(t)

const parametricEyeWaveXDerivative = _xoffset =>
  t => 1

const parametricEyeWaveYDerivative = (R, A, F, S, f, Φ, φ, k, tick, θoffset) =>
  t => (
    A * F * k * Math.cos(tick * f + φ) * Math.cos(F * (k * t + θoffset) + S * tick + Φ) * Math.sin(θoffset + k * t) +
    Math.cos(θoffset + k * t) * k * (R + A * Math.sin(F * (θoffset + k * t) + S * tick + Φ) * Math.cos(f * tick + φ))
  )

const ELLIPSE_POINT_COUNT = 100
const EYE_WAVE_POINT_COUNT = 100

export class SkirtIIIForm {

  constructor(width, height) {
    this.width = width
    this.height = height
    this.tick = 0
    this.ellipseRadiusX = this.width / 2
    this.ellipseRadiusY = this.height / 2
    this.eyeWaveWidth = this.width * 5 / 6
    this.eyeWaveHeight = this.height / 5
    this.eyeWaveInitialOffsetX = (this.width - this.eyeWaveWidth) / 2
    this.eyeWaveOffsetX = this.eyeWaveInitialOffsetX
  }

  getLines() {
    const TOP = 0
    const BOTTOM = 1
    const PRIMARY = 0
    const SECONDARY = 1

    const xoffsetPrimary = (-this.width / 2) + this.eyeWaveOffsetX
    const xoffsetSecondary = xoffsetPrimary - this.width

    const xoffsets = [
      xoffsetPrimary,
      xoffsetSecondary
    ]

    const parametricEyeWaveXFns = [
      parametricEyeWaveX(xoffsetPrimary),
      parametricEyeWaveX(xoffsetSecondary)
    ]

    const parametricEyeWaveXDerivativeFns = [
      parametricEyeWaveXDerivative(xoffsetPrimary),
      parametricEyeWaveXDerivative(xoffsetSecondary)
    ]

    const A = this.height / 8
    const F = C.PI * .75
    const S = C.PI / 1000
    const f = 0.001
    const Φ = THREE.MathUtils.degToRad(90)
    const φ = THREE.MathUtils.degToRad(90)
    const k = C.PI / this.eyeWaveWidth
    const R = this.eyeWaveHeight

    const parametricEyeWaveYFns = [
      parametricEyeWaveY(R, A, F, S, f, Φ, φ, k, this.tick, 0),
      parametricEyeWaveY(R, A, F, S, f, Φ, φ, k, this.tick, C.PI)
    ]

    const parametricEyeWaveYDerivativeFns = [
      parametricEyeWaveYDerivative(R, A, F, S, f, Φ, φ, k, this.tick, 0),
      parametricEyeWaveYDerivative(R, A, F, S, f, Φ, φ, k, this.tick, C.PI)
    ]

    const parametricEllipseXFn = parametricEllipseX(this.ellipseRadiusX)
    const parametricEllipseYFn = parametricEllipseY(this.ellipseRadiusY)
    const parametricEllipseXDerivativeFn = parametricEllipseXDerivative(this.ellipseRadiusX)
    const parametricEllipseYDerivativeFn = parametricEllipseYDerivative(this.ellipseRadiusY)

    const findEyeWaveIntersection = (primaryOrSecondary, topOrBottom, angle) => {

      const parametricEyeWaveXFn = parametricEyeWaveXFns[primaryOrSecondary]
      const parametricEyeWaveXDerivativeFn = parametricEyeWaveXDerivativeFns[primaryOrSecondary]
      const parametricEyeWaveYFn = parametricEyeWaveYFns[topOrBottom]
      const parametricEyeWaveYDerivativeFn = parametricEyeWaveYDerivativeFns[topOrBottom]

      const xstart = Math.abs(parametricEyeWaveXFn(0))
      const xend = Math.abs(parametricEyeWaveXFn(this.eyeWaveWidth))

      const rx = this.ellipseRadiusX
      if (xstart < rx && xend < rx) return
      if (xstart > rx && xend > rx) return

      const t1Guess = THREE.MathUtils.degToRad(angle)
      const x = parametricEllipseXFn(t1Guess)
      const t2Guess = x - xoffsets[primaryOrSecondary]

      try {
        return newtonsMethod(
          parametricEllipseXFn,
          parametricEllipseYFn,
          parametricEyeWaveXFn,
          parametricEyeWaveYFn,
          parametricEllipseXDerivativeFn,
          parametricEllipseYDerivativeFn,
          parametricEyeWaveXDerivativeFn,
          parametricEyeWaveYDerivativeFn,
          t1Guess,
          t2Guess)
      } catch {
        return undefined
      }
    }

    const tryVariousAngles = (primaryOrSecondary, topOrBottom, ...angles) => {
      for (const angle of angles) {
        const intersection = findEyeWaveIntersection(primaryOrSecondary, topOrBottom, angle)
        if (intersection) return intersection
      }
      return undefined
    }

    const intersection1 = tryVariousAngles(PRIMARY, TOP, 0, 30)
    const intersection2 = tryVariousAngles(PRIMARY, BOTTOM, 0, -30)
    const intersection3 = tryVariousAngles(SECONDARY, TOP, 180, 150)
    const intersection4 = tryVariousAngles(SECONDARY, BOTTOM, 180, 210)

    const intersections = [
      intersection1,
      intersection2,
      intersection3,
      intersection4
    ]
      .filter(Boolean)

    const intersectionPoints = intersections.map(intersection =>
      new THREE.Vector2(
        parametricEllipseXFn(intersection.t1),
        parametricEllipseYFn(intersection.t1))
    )

    const getEyeWavePoints = (primaryOrSecondary) => {

      const pointCount = EYE_WAVE_POINT_COUNT
      const Δt = this.eyeWaveWidth / pointCount

      const topPoints = U.range(pointCount + 1).map(n => {
        const t = n * Δt
        const x = parametricEyeWaveXFns[primaryOrSecondary](t)
        const y = parametricEyeWaveYFns[TOP](t)
        return new THREE.Vector2(x, y)
      })

      const bottomPoints = U.range(pointCount + 1).map(n => {
        const t = n * Δt
        const x = parametricEyeWaveXFns[primaryOrSecondary](t)
        const y = parametricEyeWaveYFns[BOTTOM](t)
        return new THREE.Vector2(x, y)
      })

      return U.combinePoints(topPoints, bottomPoints)
    }

    const getEyeWavePointsPrimary = (t1, t2) => {

      const pointCount = EYE_WAVE_POINT_COUNT
      const topΔt = t1 / pointCount
      const bottomΔt = t2 / pointCount

      const topPoints = U.range(pointCount + 1).map(n => {
        const t = n * topΔt
        const x = parametricEyeWaveXFns[PRIMARY](t)
        const y = parametricEyeWaveYFns[TOP](t)
        return new THREE.Vector2(x, y)
      })

      const bottomPoints = U.range(pointCount + 1).map(n => {
        const t = n * bottomΔt
        const x = parametricEyeWaveXFns[PRIMARY](t)
        const y = parametricEyeWaveYFns[BOTTOM](t)
        return new THREE.Vector2(x, y)
      })

      return U.combinePoints(topPoints.reverse(), bottomPoints)
    }

    const getEyeWavePointsSecondary = (t1, t2) => {

      const pointCount = EYE_WAVE_POINT_COUNT
      const topΔt = (this.eyeWaveWidth - t1) / pointCount
      const bottomΔt = (this.eyeWaveWidth - t2) / pointCount

      const topPoints = U.range(pointCount + 1).map(n => {
        const t = t1 + n * topΔt
        const x = parametricEyeWaveXFns[SECONDARY](t)
        const y = parametricEyeWaveYFns[TOP](t)
        return new THREE.Vector2(x, y)
      })

      const bottomPoints = U.range(pointCount + 1).map(n => {
        const t = t2 + n * bottomΔt
        const x = parametricEyeWaveXFns[SECONDARY](t)
        const y = parametricEyeWaveYFns[BOTTOM](t)
        return new THREE.Vector2(x, y)
      })

      return U.combinePoints(topPoints, bottomPoints)
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

    if (intersections.length === 4) {
      const eyeWavePointsPrimary = getEyeWavePointsPrimary(intersection1.t2, intersection2.t2)
      const eyeWavePointsSecondary = getEyeWavePointsSecondary(intersection3.t2, intersection4.t2)
      const ellipsePointsTop = getEllipsePoints(C.PI * 5 / 8, intersection1.t1)
      const ellipsePointsBottom = getEllipsePoints(intersection4.t1, C.PI + C.PI * 5 / 8)

      const topPoints = U.combinePoints(ellipsePointsTop, eyeWavePointsPrimary)
      const bottomPoints = U.combinePoints(eyeWavePointsSecondary, ellipsePointsBottom)
      const line1 = new Line(topPoints)
      const line2 = new Line(bottomPoints)

      this.tick++
      this.eyeWaveOffsetX = (this.eyeWaveOffsetX + 0.001) % (this.width)

      const lines = [line1, line2]
      lines.intersectionPoints = intersectionPoints
      return lines
    }

    const eyeWavePointsPrimary = getEyeWavePoints(PRIMARY)
    const ellipsePointsTop = getEllipsePoints(0, C.PI * 5 / 8)
    const ellipsePointsBottom = getEllipsePoints(C.PI, C.PI + C.PI * 5 / 8)

    const line1 = new Line(eyeWavePointsPrimary, 1, true)
    const line2 = new Line(ellipsePointsTop)
    const line3 = new Line(ellipsePointsBottom)

    this.tick++
    this.eyeWaveOffsetX = (this.eyeWaveOffsetX + 0.001) % (this.width)

    const lines = [line1, line2, line3]
    lines.intersectionPoints = intersectionPoints
    return lines
  }
}
