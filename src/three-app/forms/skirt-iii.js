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

const parametricEyeWaveTopX = xoffset =>
  t => t + xoffset

const parametricEyeWaveTopY = (A, F, S, f, Φ, φ, k, h, tick) =>
  t => {
    const θ = k * t
    const ω = A * Math.sin(F * θ + S * tick + Φ) * Math.cos(f * tick + φ)
    return (h + ω) * Math.sin(θ)
  }

const parametricEyeWaveBottomX = xoffset =>
  t => t + xoffset

const parametricEyeWaveBottomY = (A, F, S, f, Φ, φ, k, h, tick) =>
  t => {
    const θ = C.TWO_PI - (k * t)
    const ω = A * Math.sin(F * θ + S * tick + Φ) * Math.cos(f * tick + φ)
    return (h + ω) * Math.sin(θ)
  }

// The following online tool was very useful for finding the derivatives:
// https://www.symbolab.com/solver/derivative-calculator

const parametricEllipseXDerivative = rx =>
  t => -rx * Math.sin(t)

const parametricEllipseYDerivative = ry =>
  t => ry * Math.cos(t)

const parametricEyeWaveTopXDerivative = (_xoffset, _width, deltaX) =>
  t => deltaX

const parametricEyeWaveBottomXDerivative = (_xoffset, _width, deltaX) =>
  t => -deltaX

const parametricEyeWaveTopYDerivative = (A, F, S, f, Φ, φ, height, deltaAngle, tick) =>
  t => A * F * deltaAngle * Math.cos(f * tick + φ) * Math.cos(F * deltaAngle * t + S * tick + Φ) * Math.sin(deltaAngle * t) + Math.cos(deltaAngle * t) * deltaAngle * (height + A * Math.sin(F * deltaAngle * t + S * tick + Φ) * Math.cos(f * tick + φ))

const parametricEyeWaveBottomYDerivative = (A, F, S, f, Φ, φ, height, deltaAngle, tick) =>
  t => A * F * deltaAngle * Math.cos(f * tick + φ) * Math.cos(F * (C.PI + deltaAngle * t) + S * tick + Φ) * Math.sin(C.PI + deltaAngle * t) + Math.cos(C.PI + deltaAngle * t) * deltaAngle * (height + A * Math.sin(F * (C.PI + deltaAngle * t) + S * tick + Φ) * Math.cos(f * tick + φ))

const ELLIPSE_POINT_COUNT = 100
const WAVE_POINT_COUNT = 100

export class SkirtIIIForm {

  constructor(width, height) {
    this.width = width
    this.height = height
    this.tick = 0
    this.ellipseRadiusX = this.width / 2
    this.ellipseRadiusY = this.height / 2
    this.eyeWaveWidth = this.width * 5 / 6
    this.eyeWaveHeight = this.height / 6
    this.eyeWaveInitialOffsetX = (this.width - this.eyeWaveWidth) / 2
    this.eyeWaveOffsetX = this.eyeWaveInitialOffsetX
  }

  getLines() {
    const xoffset = this.eyeWaveOffsetX - this.eyeWaveInitialOffsetX
    const parametricEyeWaveTopXFn = parametricEyeWaveTopX(xoffset)
    const parametricEyeWaveTopXDerivativeFn = parametricEyeWaveTopXDerivative(xoffset)
    const parametricEyeWaveBottomXFn = parametricEyeWaveBottomX(xoffset)
    const parametricEyeWaveBottomXDerivativeFn = parametricEyeWaveBottomXDerivative(xoffset)
    const xoffset2 = xoffset - this.width
    const parametricEyeWaveTopXFn2 = parametricEyeWaveTopX(xoffset2)
    const parametricEyeWaveTopXDerivativeFn2 = parametricEyeWaveTopXDerivative(xoffset2)
    const parametricEyeWaveBottomXFn2 = parametricEyeWaveBottomX(xoffset2)
    const parametricEyeWaveBottomXDerivativeFn2 = parametricEyeWaveBottomXDerivative(xoffset2)

    const A = this.height / 8
    const F = 1.7
    const S = 0.003
    const f = 0.003
    const Φ = THREE.MathUtils.degToRad(35)
    const φ = THREE.MathUtils.degToRad(125)
    const k = C.PI / this.eyeWaveWidth
    const h = this.eyeWaveHeight
    const parametricEyeWaveTopYFn = parametricEyeWaveTopY(A, F, S, f, Φ, φ, k, h, this.tick)
    const parametricEyeWaveTopYDerivativeFn = parametricEyeWaveTopYDerivative(A, F, S, f, Φ, φ, k, h, this.tick)
    const parametricEyeWaveBottomYFn = parametricEyeWaveBottomY(A, F, S, f, Φ, φ, k, h, this.tick)
    const parametricEyeWaveBottomYDerivativeFn = parametricEyeWaveBottomYDerivative(A, F, S, f, Φ, φ, k, h, this.tick)

    const parametricEllipseXFn = parametricEllipseX(this.ellipseRadiusX)
    const parametricEllipseYFn = parametricEllipseY(this.ellipseRadiusY)
    const parametricEllipseXDerivativeFn = parametricEllipseXDerivative(this.ellipseRadiusX)
    const parametricEllipseYDerivativeFn = parametricEllipseYDerivative(this.ellipseRadiusY)

    const findEyeWaveTopIntersection = angle => {

      const xstart = parametricEyeWaveTopXFn(0)
      const xend = parametricEyeWaveTopXFn(WAVE_POINT_COUNT)

      if (xstart <= this.ellipseRadiusX && xend >= this.ellipseRadiusX) {

        const t1Guess = THREE.MathUtils.degToRad(angle)
        const x = parametricEllipseXFn(t1Guess)
        const d = x - xstart
        const l = xend - xstart
        const t2Guess = d / l * WAVE_POINT_COUNT

        try {
          return newtonsMethod(
            parametricEllipseXFn,
            parametricEllipseYFn,
            parametricEyeWaveTopXFn,
            parametricEyeWaveTopYFn,
            parametricEllipseXDerivativeFn,
            parametricEllipseYDerivativeFn,
            parametricEyeWaveTopXDerivativeFn,
            parametricEyeWaveTopYDerivativeFn,
            t1Guess,
            t2Guess)
        } catch {
          return undefined
        }
      }
    }

    const findEyeWaveBottomIntersection = angle => {

      const xstart = parametricEyeWaveBottomXFn(0)
      const xend = parametricEyeWaveBottomXFn(WAVE_POINT_COUNT)

      if (xend <= this.ellipseRadiusX && xstart >= this.ellipseRadiusX) {

        const t1Guess = THREE.MathUtils.degToRad(angle)
        const x = parametricEllipseXFn(t1Guess)
        const d = xstart - x
        const l = xstart - xend
        const t2Guess = d / l * WAVE_POINT_COUNT

        try {
          return newtonsMethod(
            parametricEllipseXFn,
            parametricEllipseYFn,
            parametricEyeWaveBottomXFn,
            parametricEyeWaveBottomYFn,
            parametricEllipseXDerivativeFn,
            parametricEllipseYDerivativeFn,
            parametricEyeWaveBottomXDerivativeFn,
            parametricEyeWaveBottomYDerivativeFn,
            t1Guess,
            t2Guess)
        } catch {
          return undefined
        }
      }
    }

    const findEyeWaveTopIntersection2 = angle => {

      const xstart = parametricEyeWaveTopXFn2(0)
      const xend = parametricEyeWaveTopXFn2(WAVE_POINT_COUNT)

      if (xstart <= -this.ellipseRadiusX && xend >= -this.ellipseRadiusX) {

        const t1Guess = THREE.MathUtils.degToRad(angle)
        const x = parametricEllipseXFn(t1Guess)
        const d = x - xstart
        const l = xend - xstart
        const t2Guess = d / l * WAVE_POINT_COUNT

        try {
          return newtonsMethod(
            parametricEllipseXFn,
            parametricEllipseYFn,
            parametricEyeWaveTopXFn2,
            parametricEyeWaveTopYFn,
            parametricEllipseXDerivativeFn,
            parametricEllipseYDerivativeFn,
            parametricEyeWaveTopXDerivativeFn2,
            parametricEyeWaveTopYDerivativeFn,
            t1Guess,
            t2Guess)
        } catch {
          return undefined
        }
      }
    }

    const findEyeWaveBottomIntersection2 = angle => {

      const xstart = parametricEyeWaveBottomXFn2(0)
      const xend = parametricEyeWaveBottomXFn2(WAVE_POINT_COUNT)

      if (xend <= -this.ellipseRadiusX && xstart >= -this.ellipseRadiusX) {

        const t1Guess = THREE.MathUtils.degToRad(angle)
        const x = parametricEllipseXFn(t1Guess)
        const d = xstart - x
        const l = xstart - xend
        const t2Guess = d / l * WAVE_POINT_COUNT

        try {
          return newtonsMethod(
            parametricEllipseXFn,
            parametricEllipseYFn,
            parametricEyeWaveBottomXFn2,
            parametricEyeWaveBottomYFn,
            parametricEllipseXDerivativeFn,
            parametricEllipseYDerivativeFn,
            parametricEyeWaveBottomXDerivativeFn2,
            parametricEyeWaveBottomYDerivativeFn,
            t1Guess,
            t2Guess)
        } catch {
          return undefined
        }
      }
    }

    const tryVariousAngles = (findIntersection, ...angles) => {
      // for (const angle of angles) {
      //   const intersection = findIntersection(angle)
      //   if (intersection) return intersection
      // }
      return undefined
    }

    const intersection1 = tryVariousAngles(findEyeWaveTopIntersection, 0, 30, 45)
    const intersection2 = tryVariousAngles(findEyeWaveBottomIntersection, 0, -30, -45)
    const intersection3 = tryVariousAngles(findEyeWaveTopIntersection2, 180, 150, 135)
    const intersection4 = tryVariousAngles(findEyeWaveBottomIntersection2, 180, 210, 225)

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

    const getEyeWavePoints = () => {

      const pointCount = WAVE_POINT_COUNT
      const deltaX = this.eyeWaveWidth / pointCount

      const topPoints = U.range(pointCount + 1).map(n => {
        const t = n * deltaX
        const x = parametricEyeWaveTopXFn(t)
        const y = parametricEyeWaveTopYFn(t)
        return new THREE.Vector2(x, y)
      })

      const bottomPoints = U.range(pointCount + 1).map(n => {
        const t = this.eyeWaveWidth - (n * deltaX)
        const x = parametricEyeWaveBottomXFn(t)
        const y = parametricEyeWaveBottomYFn(t)
        return new THREE.Vector2(x, y)
      })

      return U.combinePoints(topPoints, bottomPoints)
    }

    const getEyeWavePointsLeft = (p1, p2) => {
      const pointCountTop = Math.floor(p1)
      const topPoints = U.range(pointCountTop).map(t => {
        const x = parametricEyeWaveTopXFn(t)
        const y = parametricEyeWaveTopYFn(t)
        return new THREE.Vector2(x, y)
      })
      topPoints.push(new THREE.Vector2(
        parametricEyeWaveTopXFn(p1),
        parametricEyeWaveTopYFn(p1))
      )

      const pointCountBottom = WAVE_POINT_COUNT - Math.floor(p2)
      const bottomPoints = U.range(pointCountBottom).map(t => {
        const x = parametricEyeWaveBottomXFn(p2 + t)
        const y = parametricEyeWaveBottomYFn(p2 + t)
        return new THREE.Vector2(x, y)
      })
      bottomPoints.push(new THREE.Vector2(
        parametricEyeWaveBottomXFn(WAVE_POINT_COUNT),
        parametricEyeWaveBottomYFn(WAVE_POINT_COUNT))
      )

      return U.combinePoints(topPoints.reverse(), bottomPoints)
    }

    const getEyeWavePointsRight = (p1, p2) => {
      const pointCountTop = WAVE_POINT_COUNT - Math.floor(p1)
      const topPoints = U.range(pointCountTop).map(t => {
        const x = parametricEyeWaveTopXFn2(p1 + t)
        const y = parametricEyeWaveTopYFn(p1 + t)
        return new THREE.Vector2(x, y)
      })
      topPoints.push(new THREE.Vector2(
        parametricEyeWaveTopXFn2(WAVE_POINT_COUNT),
        parametricEyeWaveTopYFn(WAVE_POINT_COUNT))
      )

      const pointCountBottom = Math.floor(p2)
      const bottomPoints = U.range(pointCountBottom).map(t => {
        const x = parametricEyeWaveBottomXFn2(t)
        const y = parametricEyeWaveBottomYFn(t)
        return new THREE.Vector2(x, y)
      })
      bottomPoints.push(new THREE.Vector2(
        parametricEyeWaveBottomXFn2(p2),
        parametricEyeWaveBottomYFn(p2))
      )

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
      const eyeWavePointsLeft = getEyeWavePointsLeft(intersection1.t2, intersection2.t2)
      const eyeWavePointsRight = getEyeWavePointsRight(intersection3.t2, intersection4.t2)
      const ellipseTopPoints = getEllipsePoints(C.PI * 5 / 8, intersection1.t1)
      const ellipseBottomPoints = getEllipsePoints(intersection4.t1, C.PI + C.PI * 5 / 8)

      const topPoints = U.combinePoints(ellipseTopPoints, eyeWavePointsLeft)
      const bottomPoints = U.combinePoints(eyeWavePointsRight, ellipseBottomPoints)
      const line1 = new Line(topPoints)
      const line2 = new Line(bottomPoints)

      this.tick++
      this.eyeWaveOffsetX = (this.eyeWaveOffsetX + 0.001) % (this.width)

      const lines = [line1, line2]
      lines.intersectionPoints = intersectionPoints
      return lines
    }

    const eyeWavePoints = getEyeWavePoints()
    const ellipseTopPoints = getEllipsePoints(0, C.PI * 5 / 8)
    const ellipseBottomPoints = getEllipsePoints(C.PI, C.PI + C.PI * 5 / 8)

    const line1 = new Line(eyeWavePoints, 1, true)
    const line2 = new Line(ellipseTopPoints)
    const line3 = new Line(ellipseBottomPoints)

    this.tick++
    // this.eyeWaveOffsetX = (this.eyeWaveOffsetX + 0.001) % (this.width)

    const lines = [line1, line2, line3]
    lines.intersectionPoints = intersectionPoints
    return lines
  }
}
