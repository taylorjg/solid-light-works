import * as THREE from 'three'
import {
  parametricEllipseX,
  parametricEllipseY,
  parametricEllipseXDerivative,
  parametricEllipseYDerivative,
} from '@app/three-app/syntax/parametric-ellipse'
import {
  parametricTravellingWaveX,
  parametricTravellingWaveY,
  parametricTravellingWaveXDerivative,
  parametricTravellingWaveYDerivative,
} from '@app/three-app/syntax/parametric-travelling-wave'
import { CycleTiming } from '@app/three-app/cycle-timing'
import { Line } from '@app/three-app/line'
import { newtonsMethod } from '@app/three-app/newtons-method'
import * as C from '@app/three-app/constants'
import * as U from '@app/three-app/utils'

const MAX_TICKS = 1000 / 16 * 20
const ELLIPSE_POINT_COUNT = 30
const TRAVELLING_WAVE_POINT_COUNT = 100

export class TailForm {

  constructor(width, height) {
    this.cycleTiming = new CycleTiming(MAX_TICKS)
    this.width = width
    this.height = height
    this.rx = width / 2 * 0.98
    this.ry = height / 2 * 0.98
    this.ellipseRx = this.rx
    this.ellipseRy = this.ry
    this.travellingWaveRy = this.ry / 2
  }

  getEllipsePoints(parametricEllipseXFn, parametricEllipseYFn, θ1, θ2) {
    const Δθ = (θ2 - θ1) / ELLIPSE_POINT_COUNT
    return U.range(ELLIPSE_POINT_COUNT + 1).map(n => {
      const t = θ1 + n * Δθ
      const x = parametricEllipseXFn(t)
      const y = parametricEllipseYFn(t)
      return new THREE.Vector2(x, y)
    })
  }

  getTravellingWavePoints(parametricTravellingWaveXFn, parametricTravellingWaveYFn, t1, t2) {
    const Δt = (t2 - t1) / TRAVELLING_WAVE_POINT_COUNT
    return U.range(TRAVELLING_WAVE_POINT_COUNT + 1).map(n => {
      const t = t1 + n * Δt
      const x = parametricTravellingWaveXFn(t)
      const y = parametricTravellingWaveYFn(t)
      return new THREE.Vector2(x, y)
    })
  }

  getFootprintData(deltaMs, absoluteMs) {
    const { cycleRatio } = this.cycleTiming.update(deltaMs, absoluteMs)

    const ellipseRx = this.width / 2 * 0.98
    const ellipseRy = this.height / 2 * 0.98

    const waveWidth = this.width

    const parametricEllipseXFn = parametricEllipseX(ellipseRx)
    const parametricEllipseYFn = parametricEllipseY(ellipseRy)
    const parametricEllipseXDerivativeFn = parametricEllipseXDerivative(ellipseRx)
    const parametricEllipseYDerivativeFn = parametricEllipseYDerivative(ellipseRy)

    const configureTravellingWave1 = () => {
      const A = this.travellingWaveRy * 0.6
      const λ = this.width * 1.0
      const k = C.TWO_PI / λ
      const f = 1
      const ω = C.TWO_PI * f
      const ωt = ω * cycleRatio
      const φ = THREE.MathUtils.degToRad(-70)
      const xoffset = -waveWidth / 2
      const parametricTravellingWaveXFn = parametricTravellingWaveX(xoffset)
      const tmp = parametricTravellingWaveY(A, k, ωt, φ)
      const parametricTravellingWaveYFn = (t) => tmp(t) + this.height / 6
      const parametricTravellingWaveXDerivativeFn = parametricTravellingWaveXDerivative(xoffset)
      const parametricTravellingWaveYDerivativeFn = parametricTravellingWaveYDerivative(A, k, ωt, φ)
      return {
        parametricTravellingWaveXFn,
        parametricTravellingWaveYFn,
        parametricTravellingWaveXDerivativeFn,
        parametricTravellingWaveYDerivativeFn,
      }
    }

    const configureTravellingWave2 = () => {
      const A = this.travellingWaveRy * 0.6
      const λ = this.width * 1.0
      const k = C.TWO_PI / λ
      const f = 1
      const ω = C.TWO_PI * f
      const ωt = ω * cycleRatio
      const φ = THREE.MathUtils.degToRad(55)
      const xoffset = -waveWidth / 2
      const parametricTravellingWaveXFn = parametricTravellingWaveX(xoffset)
      const tmp = parametricTravellingWaveY(A, k, ωt, φ)
      const parametricTravellingWaveYFn = (t) => tmp(t) - this.height / 6
      const parametricTravellingWaveXDerivativeFn = parametricTravellingWaveXDerivative(xoffset)
      const parametricTravellingWaveYDerivativeFn = parametricTravellingWaveYDerivative(A, k, ωt, φ)
      return {
        parametricTravellingWaveXFn,
        parametricTravellingWaveYFn,
        parametricTravellingWaveXDerivativeFn,
        parametricTravellingWaveYDerivativeFn,
      }
    }

    const {
      parametricTravellingWaveXFn: parametricTravellingWave1XFn,
      parametricTravellingWaveYFn: parametricTravellingWave1YFn,
      parametricTravellingWaveXDerivativeFn: parametricTravellingWave1XDerivativeFn,
      parametricTravellingWaveYDerivativeFn: parametricTravellingWave1YDerivativeFn,
    } = configureTravellingWave1()

    const {
      parametricTravellingWaveXFn: parametricTravellingWave2XFn,
      parametricTravellingWaveYFn: parametricTravellingWave2YFn,
      parametricTravellingWaveXDerivativeFn: parametricTravellingWave2XDerivativeFn,
      parametricTravellingWaveYDerivativeFn: parametricTravellingWave2YDerivativeFn,
    } = configureTravellingWave2()

    const t1Guess = 0
    const t2Guess = waveWidth

    const { t1, t2 } = newtonsMethod(
      parametricEllipseXFn,
      parametricEllipseYFn,
      parametricTravellingWave1XFn,
      parametricTravellingWave1YFn,
      parametricEllipseXDerivativeFn,
      parametricEllipseYDerivativeFn,
      parametricTravellingWave1XDerivativeFn,
      parametricTravellingWave1YDerivativeFn,
      t1Guess,
      t2Guess)

    const t3Guess = 0
    const t4Guess = waveWidth

    const { t1: t3, t2: t4 } = newtonsMethod(
      parametricEllipseXFn,
      parametricEllipseYFn,
      parametricTravellingWave2XFn,
      parametricTravellingWave2YFn,
      parametricEllipseXDerivativeFn,
      parametricEllipseYDerivativeFn,
      parametricTravellingWave2XDerivativeFn,
      parametricTravellingWave2YDerivativeFn,
      t3Guess,
      t4Guess)

    const intersectionPoint1 = new THREE.Vector2(parametricEllipseXFn(t1), parametricEllipseYFn(t1))
    const intersectionPoint2 = new THREE.Vector2(parametricEllipseXFn(t3), parametricEllipseYFn(t3))

    const arcPoints = this.getEllipsePoints(
      parametricEllipseXFn,
      parametricEllipseYFn,
      t1,
      t3)

    const upperTravellingWavePoints = this.getTravellingWavePoints(
      parametricTravellingWave1XFn,
      parametricTravellingWave1YFn,
      0,
      t2)

    const lowerTravellingWavePoints = this.getTravellingWavePoints(
      parametricTravellingWave2XFn,
      parametricTravellingWave2YFn,
      t4,
      0)

    const combinedPoints = U.combinePoints(
      upperTravellingWavePoints,
      arcPoints,
      lowerTravellingWavePoints)

    const lineOptions = { clipToFormBoundary: true }
    const combinedLine = new Line(combinedPoints, lineOptions)
    const lines = [combinedLine]

    const intersectionPoints = [intersectionPoint1, intersectionPoint2]
    const footprintData = { lines, intersectionPoints }

    return footprintData
  }
}
