import * as THREE from 'three'
import {
  parametricEllipseX,
  parametricEllipseY,
  parametricEllipseXDerivative,
  parametricEllipseYDerivative,
} from '../syntax/parametric-ellipse'
import {
  parametricTravellingWaveX,
  parametricTravellingWaveY,
  parametricTravellingWaveXDerivative,
  parametricTravellingWaveYDerivative,
} from '../syntax/parametric-travelling-wave'
import { CycleTiming } from '../cycle-timing'
import { Line } from '../line'
import { newtonsMethod } from '../newtons-method'
import * as C from '../constants'
import * as U from '../utils'

const MAX_TICKS = 1000 / 16 * 20
const ELLIPSE_POINT_COUNT = 100
const TRAVELLING_WAVE_POINT_COUNT = 100

export class BreathForm {

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

  getFootprintData(deltaMs, absoluteMs) {
    const { cycleRatio } = this.cycleTiming.update(deltaMs, absoluteMs)

    // TODO: it looks like the height of the ellipse changes over time
    // full height => less high => full height => less high => full height
    const parametricEllipseXFn = parametricEllipseX(this.ellipseRx)
    const parametricEllipseYFn = parametricEllipseY(this.ellipseRy)
    const parametricEllipseXDerivativeFn = parametricEllipseXDerivative(this.ellipseRx)
    const parametricEllipseYDerivativeFn = parametricEllipseYDerivative(this.ellipseRy)

    const A = this.travellingWaveRy
    const λ = this.width * 0.9
    const k = C.TWO_PI / λ
    const f = 1
    const ω = C.TWO_PI * f
    const ωt = ω * cycleRatio
    const φ = THREE.MathUtils.degToRad(120)
    const margin = this.width * 0.02
    const waveWidth = this.width
    const xoffset = -waveWidth / 2 + margin
    const parametricTravellingWaveXFn = parametricTravellingWaveX(xoffset)
    const parametricTravellingWaveYFn = parametricTravellingWaveY(A, k, ωt, φ)
    const parametricTravellingWaveXDerivativeFn = parametricTravellingWaveXDerivative(xoffset)
    const parametricTravellingWaveYDerivativeFn = parametricTravellingWaveYDerivative(A, k, ωt, φ)

    const t1Guess = THREE.MathUtils.degToRad(-180)
    const t2Guess = 0

    const { t1, t2 } = newtonsMethod(
      parametricEllipseXFn,
      parametricEllipseYFn,
      parametricTravellingWaveXFn,
      parametricTravellingWaveYFn,
      parametricEllipseXDerivativeFn,
      parametricEllipseYDerivativeFn,
      parametricTravellingWaveXDerivativeFn,
      parametricTravellingWaveYDerivativeFn,
      t1Guess,
      t2Guess)

    const t3Guess = 0
    const t4Guess = waveWidth

    const { t1: t3, t2: t4 } = newtonsMethod(
      parametricEllipseXFn,
      parametricEllipseYFn,
      parametricTravellingWaveXFn,
      parametricTravellingWaveYFn,
      parametricEllipseXDerivativeFn,
      parametricEllipseYDerivativeFn,
      parametricTravellingWaveXDerivativeFn,
      parametricTravellingWaveYDerivativeFn,
      t3Guess,
      t4Guess)

    const intersectionPoint1 = new THREE.Vector2(parametricEllipseXFn(t1), parametricEllipseYFn(t1))
    const intersectionPoint2 = new THREE.Vector2(parametricEllipseXFn(t3), parametricEllipseYFn(t3))

    const upperEllipsePoints = this.getEllipsePoints(
      parametricEllipseXFn,
      parametricEllipseYFn,
      t3,
      THREE.MathUtils.degToRad(148))

    const lowerEllipsePoints = this.getEllipsePoints(
      parametricEllipseXFn,
      parametricEllipseYFn,
      THREE.MathUtils.degToRad(-148),
      THREE.MathUtils.degToRad(-32))

    const Δx = (t4 - t2) / TRAVELLING_WAVE_POINT_COUNT
    const travellingWavePoints = U.range(TRAVELLING_WAVE_POINT_COUNT + 1).map(n => {
      const t = t2 + n * Δx
      const x = parametricTravellingWaveXFn(t)
      const y = parametricTravellingWaveYFn(t)
      return new THREE.Vector2(x, y)
    })

    const combinedPoints = U.combinePoints(travellingWavePoints, upperEllipsePoints)

    const combinedLine = new Line(combinedPoints)
    const lowerEllipseLine = new Line(lowerEllipsePoints)
    const lines = [combinedLine, lowerEllipseLine]

    const intersectionPoints = [intersectionPoint1, intersectionPoint2]
    const footprintData = { lines, intersectionPoints }

    return footprintData
  }
}
