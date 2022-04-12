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

// Circle-wave equation:
// Cx(θ, t) := (R + ω(θ, t)) · cos(θ)
// Cy(θ, t) := (R + ω(θ, t)) · sin(θ)

// Wave function:
// ω(θ, t) := A · sin(F · θ + S · t + Φ) · cos(f · t + φ)

// Variables:
// θ = radial angle to a point on the circle wave; 0 ≤ θ < ∞
// t = time; 0 ≤ t < ∞

// Parameters:
// R = distance from circle center to middle of wave; 0 ≤ R < ∞
// A = amplitude of circle wave; 0 < A < ∞
// F = number of wavelengths per circumference; F = 1, 2, 3, …
// S = speed of rotation of circle wave; 0 ≤ S < ∞
// f = frequency of circle wave oscillation; 0 ≤ f < ∞
// Φ = phase of circle wave rotation; 0 ≤ Φ < 2π
// φ = phase of circle wave oscillation; 0 ≤ φ < 2π

const parametricEyeWaveX = (xoffset, R, A, F, S, f, Φ, φ, tick) =>
  t => {
    const θ = t
    // const ω = A * Math.sin(F * θ + S * tick + Φ) * Math.cos(f * tick * φ)
    // return (R + ω) * Math.cos(θ)
    return R * Math.cos(θ)
    // return Math.abs(t)
  }

// const parametricEyeWaveTopY = (A, F, S, f, Φ, φ, k, h, tick) =>
//   t => {
//     const θ = k * t
//     const ω = A * Math.sin(F * θ + S * tick + Φ) * Math.cos(f * tick + φ)
//     return (h + ω) * Math.sin(θ)
//   }

const parametricEyeWaveY = (R, A, F, S, f, Φ, φ, tick) =>
  t => {
    const θ = t
    const ω = A * Math.sin(F * θ + S * tick + Φ) * Math.cos(f * tick * φ)
    return (R + ω) * Math.sin(θ)
  }

// const parametricEyeWaveTopX = (xoffset, width, deltaX) =>
//   t => xoffset - width / 2 + deltaX * t

// const parametricEyeWaveTopY = (A, F, S, f, Φ, φ, height, deltaAngle, tick) =>
//   t => {
//     const θ = deltaAngle * t
//     const ω = A * Math.sin(F * θ + S * tick + Φ) * Math.cos(f * tick + φ)
//     return (height + ω) * Math.sin(θ)
//   }

// const parametricEyeWaveBottomX = (xoffset, width, deltaX) =>
//   t => xoffset + width / 2 - deltaX * t

// const parametricEyeWaveBottomY = (A, F, S, f, Φ, φ, height, deltaAngle, tick) =>
//   t => {
//     const θ = C.PI + deltaAngle * t
//     const ω = A * Math.sin(F * θ + S * tick + Φ) * Math.cos(f * tick + φ)
//     return (height + ω) * Math.sin(θ)
//   }

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
    const rx = this.width * 5 / 12
    const ry = 1 // this.height / 10
    const A = .2 // this.height / 8
    const F = 1.5
    const S = 0.003
    const f = 0.003
    const Φ = THREE.MathUtils.degToRad(0)
    const φ = THREE.MathUtils.degToRad(0)

    // const xoffset = this.eyeWaveOffsetX - this.eyeWaveInitialOffsetX
    // const xoffset2 = xoffset - this.width

    const parametricEyeWaveXFn = parametricEyeWaveX(-rx, rx/C.HALF_PI, A, F, S, f, Φ, φ, this.tick)
    const parametricEyeWaveYFn = parametricEyeWaveY(ry, A, F, S, f, Φ, φ, this.tick)

    const parametricEllipseXFn = parametricEllipseX(this.ellipseRadiusX)
    const parametricEllipseYFn = parametricEllipseY(this.ellipseRadiusY)
    // const parametricEllipseXDerivativeFn = parametricEllipseXDerivative(this.ellipseRadiusX)
    // const parametricEllipseYDerivativeFn = parametricEllipseYDerivative(this.ellipseRadiusY)

    // const findEyeWaveTopIntersection = angle => {

    //   const xstart = parametricEyeWaveXFn(0)
    //   const xend = parametricEyeWaveXFn(WAVE_POINT_COUNT)

    //   if (xstart <= this.ellipseRadiusX && xend >= this.ellipseRadiusX) {

    //     const t1Guess = THREE.MathUtils.degToRad(angle)
    //     const x = parametricEllipseXFn(t1Guess)
    //     const d = x - xstart
    //     const l = xend - xstart
    //     const t2Guess = d / l * WAVE_POINT_COUNT

    //     try {
    //       return newtonsMethod(
    //         parametricEllipseXFn,
    //         parametricEllipseYFn,
    //         parametricEyeWaveXFn,
    //         parametricEyeWaveYFn,
    //         parametricEllipseXDerivativeFn,
    //         parametricEllipseYDerivativeFn,
    //         parametricEyeWaveXDerivativeFn,
    //         parametricEyeWaveYDerivativeFn,
    //         t1Guess,
    //         t2Guess)
    //     } catch {
    //       return undefined
    //     }
    //   }
    // }

    // const findEyeWaveBottomIntersection = angle => {

    //   const xstart = parametricEyeWaveBottomXFn(0)
    //   const xend = parametricEyeWaveBottomXFn(WAVE_POINT_COUNT)

    //   if (xend <= this.ellipseRadiusX && xstart >= this.ellipseRadiusX) {

    //     const t1Guess = THREE.MathUtils.degToRad(angle)
    //     const x = parametricEllipseXFn(t1Guess)
    //     const d = xstart - x
    //     const l = xstart - xend
    //     const t2Guess = d / l * WAVE_POINT_COUNT

    //     try {
    //       return newtonsMethod(
    //         parametricEllipseXFn,
    //         parametricEllipseYFn,
    //         parametricEyeWaveBottomXFn,
    //         parametricEyeWaveBottomYFn,
    //         parametricEllipseXDerivativeFn,
    //         parametricEllipseYDerivativeFn,
    //         parametricEyeWaveBottomXDerivativeFn,
    //         parametricEyeWaveBottomYDerivativeFn,
    //         t1Guess,
    //         t2Guess)
    //     } catch {
    //       return undefined
    //     }
    //   }
    // }

    // const findEyeWaveTopIntersection2 = angle => {

    //   const xstart = parametricEyeWaveXFn2(0)
    //   const xend = parametricEyeWaveXFn2(WAVE_POINT_COUNT)

    //   if (xstart <= -this.ellipseRadiusX && xend >= -this.ellipseRadiusX) {

    //     const t1Guess = THREE.MathUtils.degToRad(angle)
    //     const x = parametricEllipseXFn(t1Guess)
    //     const d = x - xstart
    //     const l = xend - xstart
    //     const t2Guess = d / l * WAVE_POINT_COUNT

    //     try {
    //       return newtonsMethod(
    //         parametricEllipseXFn,
    //         parametricEllipseYFn,
    //         parametricEyeWaveXFn2,
    //         parametricEyeWaveYFn,
    //         parametricEllipseXDerivativeFn,
    //         parametricEllipseYDerivativeFn,
    //         parametricEyeWaveXDerivativeFn2,
    //         parametricEyeWaveYDerivativeFn,
    //         t1Guess,
    //         t2Guess)
    //     } catch {
    //       return undefined
    //     }
    //   }
    // }

    // const findEyeWaveBottomIntersection2 = angle => {

    //   const xstart = parametricEyeWaveBottomXFn2(0)
    //   const xend = parametricEyeWaveBottomXFn2(WAVE_POINT_COUNT)

    //   if (xend <= -this.ellipseRadiusX && xstart >= -this.ellipseRadiusX) {

    //     const t1Guess = THREE.MathUtils.degToRad(angle)
    //     const x = parametricEllipseXFn(t1Guess)
    //     const d = xstart - x
    //     const l = xstart - xend
    //     const t2Guess = d / l * WAVE_POINT_COUNT

    //     try {
    //       return newtonsMethod(
    //         parametricEllipseXFn,
    //         parametricEllipseYFn,
    //         parametricEyeWaveBottomXFn2,
    //         parametricEyeWaveBottomYFn,
    //         parametricEllipseXDerivativeFn,
    //         parametricEllipseYDerivativeFn,
    //         parametricEyeWaveBottomXDerivativeFn2,
    //         parametricEyeWaveBottomYDerivativeFn,
    //         t1Guess,
    //         t2Guess)
    //     } catch {
    //       return undefined
    //     }
    //   }
    // }

    // const tryVariousAngles = (findIntersection, ...angles) => {
    //   for (const angle of angles) {
    //     const intersection = findIntersection(angle)
    //     if (intersection) return intersection
    //   }
    //   return undefined
    // }

    // const intersection1 = tryVariousAngles(findEyeWaveTopIntersection, 0, 30, 45)
    // const intersection2 = tryVariousAngles(findEyeWaveBottomIntersection, 0, -30, -45)
    // const intersection3 = tryVariousAngles(findEyeWaveTopIntersection2, 180, 150, 135)
    // const intersection4 = tryVariousAngles(findEyeWaveBottomIntersection2, 180, 210, 225)

    // const intersections = [
    //   intersection1,
    //   intersection2,
    //   intersection3,
    //   intersection4
    // ]
    //   .filter(Boolean)

    // const intersectionPoints = intersections.map(intersection =>
    //   new THREE.Vector2(
    //     parametricEllipseXFn(intersection.t1),
    //     parametricEllipseYFn(intersection.t1))
    // )

    // const intersections = []

    const getEyeWavePoints = () => {
      const pointCount = WAVE_POINT_COUNT
      const deltaAngle = C.TWO_PI / pointCount
      return U.range(pointCount + 1).map(n => {
        const t = n * deltaAngle
        const x = parametricEyeWaveXFn(t)
        const y = parametricEyeWaveYFn(t)
        return new THREE.Vector2(x, y)
      })

      // const topPoints = U.range(WAVE_POINT_COUNT + 1).map(t => {
      //   const x = parametricEyeWaveXFn(t)
      //   const y = parametricEyeWaveYFn(t)
      //   return new THREE.Vector2(x, y)
      // })

      // const bottomPoints = U.range(WAVE_POINT_COUNT).map(t => {
      //   const x = parametricEyeWaveBottomXFn(t)
      //   const y = parametricEyeWaveBottomYFn(t)
      //   return new THREE.Vector2(x, y)
      // })

      // return U.combinePoints(topPoints, bottomPoints)
    }

    // const getEyeWavePointsLeft = (p1, p2) => {
    //   const pointCountTop = Math.floor(p1)
    //   const topPoints = U.range(pointCountTop).map(t => {
    //     const x = parametricEyeWaveXFn(t)
    //     const y = parametricEyeWaveYFn(t)
    //     return new THREE.Vector2(x, y)
    //   })
    //   topPoints.push(new THREE.Vector2(
    //     parametricEyeWaveXFn(p1),
    //     parametricEyeWaveYFn(p1))
    //   )

    //   const pointCountBottom = WAVE_POINT_COUNT - Math.floor(p2)
    //   const bottomPoints = U.range(pointCountBottom).map(t => {
    //     const x = parametricEyeWaveBottomXFn(p2 + t)
    //     const y = parametricEyeWaveBottomYFn(p2 + t)
    //     return new THREE.Vector2(x, y)
    //   })
    //   bottomPoints.push(new THREE.Vector2(
    //     parametricEyeWaveBottomXFn(WAVE_POINT_COUNT),
    //     parametricEyeWaveBottomYFn(WAVE_POINT_COUNT))
    //   )

    //   return U.combinePoints(topPoints.reverse(), bottomPoints)
    // }

    // const getEyeWavePointsRight = (p1, p2) => {
    //   const pointCountTop = WAVE_POINT_COUNT - Math.floor(p1)
    //   const topPoints = U.range(pointCountTop).map(t => {
    //     const x = parametricEyeWaveXFn2(p1 + t)
    //     const y = parametricEyeWaveYFn(p1 + t)
    //     return new THREE.Vector2(x, y)
    //   })
    //   topPoints.push(new THREE.Vector2(
    //     parametricEyeWaveXFn2(WAVE_POINT_COUNT),
    //     parametricEyeWaveYFn(WAVE_POINT_COUNT))
    //   )

    //   const pointCountBottom = Math.floor(p2)
    //   const bottomPoints = U.range(pointCountBottom).map(t => {
    //     const x = parametricEyeWaveBottomXFn2(t)
    //     const y = parametricEyeWaveBottomYFn(t)
    //     return new THREE.Vector2(x, y)
    //   })
    //   bottomPoints.push(new THREE.Vector2(
    //     parametricEyeWaveBottomXFn2(p2),
    //     parametricEyeWaveBottomYFn(p2))
    //   )

    //   return U.combinePoints(topPoints, bottomPoints)
    // }

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

    // if (intersections.length === 4) {
    //   const eyeWavePointsLeft = getEyeWavePointsLeft(intersection1.t2, intersection2.t2)
    //   const eyeWavePointsRight = getEyeWavePointsRight(intersection3.t2, intersection4.t2)
    //   const ellipseTopPoints = getEllipsePoints(C.PI * 5 / 8, intersection1.t1)
    //   const ellipseBottomPoints = getEllipsePoints(intersection4.t1, C.PI + C.PI * 5 / 8)

    //   const topPoints = U.combinePoints(ellipseTopPoints, eyeWavePointsLeft)
    //   const bottomPoints = U.combinePoints(eyeWavePointsRight, ellipseBottomPoints)
    //   const line1 = new Line(topPoints)
    //   const line2 = new Line(bottomPoints)

    //   this.tick++
    //   this.eyeWaveOffsetX = (this.eyeWaveOffsetX + 0.001) % (this.width)

    //   const lines = [line1, line2]
    //   lines.intersectionPoints = intersectionPoints
    //   return lines
    // }

    const eyeWavePoints = getEyeWavePoints()
    const ellipseTopPoints = getEllipsePoints(0, C.PI * 5 / 8)
    const ellipseBottomPoints = getEllipsePoints(C.PI, C.PI + C.PI * 5 / 8)

    const line1 = new Line(eyeWavePoints, 1, true)
    const line2 = new Line(ellipseTopPoints)
    const line3 = new Line(ellipseBottomPoints)

    this.tick++
    // this.eyeWaveOffsetX = (this.eyeWaveOffsetX + 0.001) % (this.width)

    const lines = [line1, line2, line3]
    lines.intersectionPoints = [] // intersectionPoints
    return lines
  }
}
