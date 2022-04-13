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

// n = R
// A = A
// b = F
// s = S
// m = f
// k = k
// t = tick
// w = Φ
// v = φ
// c = θoffset
// x = t
// (n + A * sin(b * (c + k * x) + s * t + w) * cos(m * t + v)) * sin(c + k * x)
// =>
// Abk\cos \left(tm+v\right)\cos \left(b\left(kx+c\right)+st+w\right)\sin \left(c+kx\right)+\cos \left(c+kx\right)k\left(n+A\sin \left(b\left(c+kx\right)+st+w\right)\cos \left(mt+v\right)\right)
// A*F*k * Math.cos(tick*f+φ) * Math.cos(F*(k*t+θoffset)+S*tick+Φ) * Math.sin(θoffset+k*t) + Math.cos(θoffset+k*t) * k * (R + A * Math.sin(F*(θoffset+k*t)+S*tick+Φ) * Math.cos(f*tick+φ))
const parametricEyeWaveYDerivative = (R, A, F, S, f, Φ, φ, k, tick, θoffset) =>
  t => A * F * k * Math.cos(tick * f + φ) * Math.cos(F * (k * t + θoffset) + S * tick + Φ) * Math.sin(θoffset + k * t) + Math.cos(θoffset + k * t) * k * (R + A * Math.sin(F * (θoffset + k * t) + S * tick + Φ) * Math.cos(f * tick + φ))

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
    const xoffset = (-this.width / 2) + this.eyeWaveOffsetX
    const parametricEyeWaveXFn = parametricEyeWaveX(xoffset)
    const parametricEyeWaveXDerivativeFn = parametricEyeWaveXDerivative(xoffset)
    const xoffset2 = xoffset - this.width
    const parametricEyeWaveXFn2 = parametricEyeWaveX(xoffset2)
    const parametricEyeWaveXDerivativeFn2 = parametricEyeWaveXDerivative(xoffset2)

    const A = this.height / 8
    const F = C.PI * .75
    const S = C.PI / 1000
    const f = 0.001
    const Φ = THREE.MathUtils.degToRad(90)
    const φ = THREE.MathUtils.degToRad(90)
    const k = C.PI / this.eyeWaveWidth
    const R = this.eyeWaveHeight
    const parametricEyeWaveTopYFn = parametricEyeWaveY(R, A, F, S, f, Φ, φ, k, this.tick, 0)
    const parametricEyeWaveTopYDerivativeFn = parametricEyeWaveYDerivative(R, A, F, S, f, Φ, φ, k, this.tick, 0)
    const parametricEyeWaveBottomYFn = parametricEyeWaveY(R, A, F, S, f, Φ, φ, k, this.tick, C.PI)
    const parametricEyeWaveBottomYDerivativeFn = parametricEyeWaveYDerivative(R, A, F, S, f, Φ, φ, k, this.tick, C.PI)

    const parametricEllipseXFn = parametricEllipseX(this.ellipseRadiusX)
    const parametricEllipseYFn = parametricEllipseY(this.ellipseRadiusY)
    const parametricEllipseXDerivativeFn = parametricEllipseXDerivative(this.ellipseRadiusX)
    const parametricEllipseYDerivativeFn = parametricEllipseYDerivative(this.ellipseRadiusY)

    const findEyeWaveIntersection = (top, first, angle) => {

      const a = first ? parametricEyeWaveXFn : parametricEyeWaveXFn2
      const aprime = first ? parametricEyeWaveXDerivativeFn : parametricEyeWaveXDerivativeFn2
      const b = top ? parametricEyeWaveTopYFn : parametricEyeWaveBottomYFn
      const bprime = top ? parametricEyeWaveTopYDerivativeFn : parametricEyeWaveBottomYDerivativeFn

      const xstart = parametricEyeWaveXFn(0)
      const xend = parametricEyeWaveXFn(this.eyeWaveWidth)

      if (xstart <= this.ellipseRadiusX && xend >= this.ellipseRadiusX) {

        const t1Guess = THREE.MathUtils.degToRad(angle)
        const x = parametricEllipseXFn(t1Guess)
        const t2Guess = x - xoffset

        try {
          return newtonsMethod(
            parametricEllipseXFn,
            parametricEllipseYFn,
            a,
            b,
            parametricEllipseXDerivativeFn,
            parametricEllipseYDerivativeFn,
            aprime,
            bprime,
            t1Guess,
            t2Guess)
        } catch {
          return undefined
        }
      }
    }

    const tryVariousAngles = (top, first, ...angles) => {
      for (const angle of angles) {
        const intersection = findEyeWaveIntersection(top, first, angle)
        if (intersection) return intersection
      }
      return undefined
    }

    // const intersection1 = tryVariousAngles(true, true, 0, 30, 45)
    // const intersection2 = tryVariousAngles(false, true, 0, -30, -45)
    // const intersection3 = tryVariousAngles(true, false, 180, 150, 135)
    // const intersection4 = tryVariousAngles(false, false, 180, 210, 225)
    const intersection1 = tryVariousAngles(true, true, 0, 30)
    const intersection2 = tryVariousAngles(false, true, 0, -30)
    const intersection3 = tryVariousAngles(true, false, 180, 150)
    const intersection4 = tryVariousAngles(false, false, 180, 210)

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

    // const findEyeWaveTopIntersection = angle => {

    //   const xstart = parametricEyeWaveTopXFn(0)
    //   const xend = parametricEyeWaveTopXFn(WAVE_POINT_COUNT)

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
    //         parametricEyeWaveTopXFn,
    //         parametricEyeWaveTopYFn,
    //         parametricEllipseXDerivativeFn,
    //         parametricEllipseYDerivativeFn,
    //         parametricEyeWaveTopXDerivativeFn,
    //         parametricEyeWaveTopYDerivativeFn,
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

    //   const xstart = parametricEyeWaveTopXFn2(0)
    //   const xend = parametricEyeWaveTopXFn2(WAVE_POINT_COUNT)

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
    //         parametricEyeWaveTopXFn2,
    //         parametricEyeWaveTopYFn,
    //         parametricEllipseXDerivativeFn,
    //         parametricEllipseYDerivativeFn,
    //         parametricEyeWaveTopXDerivativeFn2,
    //         parametricEyeWaveTopYDerivativeFn,
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

    // const intersectionPoints = []

    const getEyeWavePoints = () => {

      const pointCount = EYE_WAVE_POINT_COUNT
      const Δt = this.eyeWaveWidth / pointCount

      const topPoints = U.range(pointCount + 1).map(n => {
        const t = n * Δt
        const x = parametricEyeWaveXFn(t)
        const y = parametricEyeWaveTopYFn(t)
        return new THREE.Vector2(x, y)
      })

      const bottomPoints = U.range(pointCount + 1).map(n => {
        const t = n * Δt
        const x = parametricEyeWaveXFn(t)
        const y = parametricEyeWaveBottomYFn(t)
        return new THREE.Vector2(x, y)
      })

      return U.combinePoints(topPoints, bottomPoints)
    }

    const getEyeWavePoints2 = () => {

      const pointCount = EYE_WAVE_POINT_COUNT
      const Δt = this.eyeWaveWidth / pointCount

      const topPoints = U.range(pointCount + 1).map(n => {
        const t = n * Δt
        const x = parametricEyeWaveXFn2(t)
        const y = parametricEyeWaveTopYFn(t)
        return new THREE.Vector2(x, y)
      })

      const bottomPoints = U.range(pointCount + 1).map(n => {
        const t = n * Δt
        const x = parametricEyeWaveXFn2(t)
        const y = parametricEyeWaveBottomYFn(t)
        return new THREE.Vector2(x, y)
      })

      return U.combinePoints(topPoints, bottomPoints)
    }

    // const getEyeWavePointsLeft = (p1, p2) => {
    //   const pointCountTop = Math.floor(p1)
    //   const topPoints = U.range(pointCountTop).map(t => {
    //     const x = parametricEyeWaveTopXFn(t)
    //     const y = parametricEyeWaveTopYFn(t)
    //     return new THREE.Vector2(x, y)
    //   })
    //   topPoints.push(new THREE.Vector2(
    //     parametricEyeWaveTopXFn(p1),
    //     parametricEyeWaveTopYFn(p1))
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
    //     const x = parametricEyeWaveTopXFn2(p1 + t)
    //     const y = parametricEyeWaveTopYFn(p1 + t)
    //     return new THREE.Vector2(x, y)
    //   })
    //   topPoints.push(new THREE.Vector2(
    //     parametricEyeWaveTopXFn2(WAVE_POINT_COUNT),
    //     parametricEyeWaveTopYFn(WAVE_POINT_COUNT))
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
    const eyeWavePoints2 = getEyeWavePoints2()
    const ellipseTopPoints = getEllipsePoints(0, C.PI * 5 / 8)
    const ellipseBottomPoints = getEllipsePoints(C.PI, C.PI + C.PI * 5 / 8)

    const line1 = new Line(eyeWavePoints, 1, true)
    const line2 = new Line(ellipseTopPoints)
    const line3 = new Line(ellipseBottomPoints)
    const line4 = new Line(eyeWavePoints2, 1, true)

    this.tick++
    this.eyeWaveOffsetX = (this.eyeWaveOffsetX + 0.001) % (this.width)

    const lines = [line1, line2, line3, line4]
    lines.intersectionPoints = intersectionPoints
    return lines
  }
}
