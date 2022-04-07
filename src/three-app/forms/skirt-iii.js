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

// The following online tool was very useful for finding the derivatives:
// https://www.symbolab.com/solver/derivative-calculator

const parametricEllipseXDerivative = rx =>
  t => -rx * Math.sin(t)

const parametricEllipseYDerivative = ry =>
  t => ry * Math.cos(t)

const parametricEyeWaveTopXDerivative = (xoffset, width, deltaX) =>
  t => deltaX

const parametricEyeWaveBottomXDerivative = (xoffset, width, deltaX) =>
  t => -deltaX

// (height + (A * Math.sin(F * deltaAngle * t + S * tick + Φ) * Math.cos(f * tick + φ))) * Math.sin(deltaAngle * t)
// (m + (a*sin(b*d*t + s*k + w) * cos(c*k + q))) * sin(d*t)
// m = height
// a = A
// b = F
// d = deltaAngle
// s = S
// k = tick
// w = Φ
// c = f
// q = φ
// => abd cos(ck+q) cos(bdt+sk+w) sin(dt) + cos(dt) d(m+a sin(bdt+sk+w) cos(ck+q))
// => A*F*deltaAngle*Math.cos(f*tick+φ) * Math.cos(F*deltaAngle*t+S*tick+Φ) * Math.sin(deltaAngle*t) + Math.cos(deltaAngle*t) * deltaAngle*(height + A * Math.sin(F*deltaAngle*t+S*tick+Φ) * Math.cos(f*tick+φ))
const parametricEyeWaveTopYDerivative = (A, F, S, f, Φ, φ, height, deltaAngle, tick) =>
  t => A * F * deltaAngle * Math.cos(f * tick + φ) * Math.cos(F * deltaAngle * t + S * tick + Φ) * Math.sin(deltaAngle * t) + Math.cos(deltaAngle * t) * deltaAngle * (height + A * Math.sin(F * deltaAngle * t + S * tick + Φ) * Math.cos(f * tick + φ))

// (height + (A * Math.sin(F * (C.PI + deltaAngle * t) + S * tick + Φ) * Math.cos(f * tick + φ))) * Math.sin(C.PI + deltaAngle * t)
// (m + (a*sin(b*(v+d*t) + s*k + w) * cos(c*k + q))) * sin(v+d*t)
// v = C.PI
// => abd cos(ck+q) cos(bdt+sk+w)     sin(dt)   + cos(dt)   d(m+a sin(bdt+sk+w)     cos(ck+q))
// => abd cos(ck+q) cos(b(dt+v)+sk+w) sin(v+dt) + cos(v+dt) d(m+a sin(b(v+dt)+sk+w) cos(ck+q))
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
    this.eyeWaveWidth = this.width * 0.75
    this.eyeWaveHeight = this.height / 6
    this.eyeWaveInitialOffsetX = (this.width - this.eyeWaveWidth) / 2
    this.eyeWaveOffsetX = this.eyeWaveInitialOffsetX
  }

  getLines() {
    const xoffset = this.eyeWaveOffsetX - this.eyeWaveInitialOffsetX
    const deltaX = this.eyeWaveWidth / WAVE_POINT_COUNT
    const parametricEyeWaveTopXFn = parametricEyeWaveTopX(xoffset, this.eyeWaveWidth, deltaX)
    const parametricEyeWaveTopXDerivativeFn = parametricEyeWaveTopXDerivative(xoffset, this.eyeWaveWidth, deltaX)
    const parametricEyeWaveBottomXFn = parametricEyeWaveBottomX(xoffset, this.eyeWaveWidth, deltaX)
    const parametricEyeWaveBottomXDerivativeFn = parametricEyeWaveBottomXDerivative(xoffset, this.eyeWaveWidth, deltaX)

    const deltaAngle = C.PI / WAVE_POINT_COUNT
    const A = this.height / 8
    const F = 1.7
    const S = C.PI / 2000
    const f = 0
    const Φ = -C.HALF_PI
    const φ = -C.PI
    const parametricEyeWaveTopYFn = parametricEyeWaveTopY(A, F, S, f, Φ, φ, this.eyeWaveHeight, deltaAngle, this.tick)
    const parametricEyeWaveTopYDerivativeFn = parametricEyeWaveTopYDerivative(A, F, S, f, Φ, φ, this.eyeWaveHeight, deltaAngle, this.tick)
    const parametricEyeWaveBottomYFn = parametricEyeWaveBottomY(A, F, S, f, Φ, φ, this.eyeWaveHeight, deltaAngle, this.tick)
    const parametricEyeWaveBottomYDerivativeFn = parametricEyeWaveBottomYDerivative(A, F, S, f, Φ, φ, this.eyeWaveHeight, deltaAngle, this.tick)

    const parametricEllipseXFn = parametricEllipseX(this.ellipseRadiusX)
    const parametricEllipseYFn = parametricEllipseY(this.ellipseRadiusY)
    const parametricEllipseXDerivativeFn = parametricEllipseXDerivative(this.ellipseRadiusX)
    const parametricEllipseYDerivativeFn = parametricEllipseYDerivative(this.ellipseRadiusY)

    let intersection1
    let intersection2

    const xstart1 = parametricEyeWaveTopXFn(0)
    const xend1 = parametricEyeWaveTopXFn(WAVE_POINT_COUNT)
    // console.log(`xstart1: ${xstart1}, xend1: ${xend1}`)

    if (xstart1 < this.ellipseRadiusX && xend1 > this.ellipseRadiusX) {

      const d = this.ellipseRadiusX - xstart1
      const l = xend1 - xstart1

      const t1Guess = 0 // TODO: calculate a better estimate
      const t2Guess = d / l * WAVE_POINT_COUNT
      // console.log(`d: ${d}, l: ${l}, t2Guess: ${t2Guess}`)

      try {
        intersection1 = newtonsMethod(
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
      }
    }

    const xstart2 = parametricEyeWaveBottomXFn(0)
    const xend2 = parametricEyeWaveBottomXFn(WAVE_POINT_COUNT)
    // console.log(`xstart2: ${xstart2}, xend2: ${xend2}`)

    if (xend2 < this.ellipseRadiusX && xstart2 > this.ellipseRadiusX) {

      const d = xstart2 - this.ellipseRadiusX
      const l = xstart2 - xend2

      const t1Guess = 0 // TODO: calculate a better estimate
      const t2Guess = d / l * WAVE_POINT_COUNT
      // console.log(`d: ${d}, l: ${l}, t2Guess: ${t2Guess}`)

      try {
        intersection2 = newtonsMethod(
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
      }
    }

    // console.log("intersection1:", intersection1, "intersection2:", intersection2)

    const intersectionPoints = []

    if (intersection1) {
      intersectionPoints.push(new THREE.Vector2(
        parametricEllipseXFn(intersection1.t1),
        parametricEllipseYFn(intersection1.t1))
      )
    }

    if (intersection2) {
      intersectionPoints.push(new THREE.Vector2(
        parametricEllipseXFn(intersection2.t1),
        parametricEllipseYFn(intersection2.t1))
      )
    }

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

    const lines = [line1, line2, line3]
    lines.intersectionPoints = intersectionPoints
    return lines
  }
}
