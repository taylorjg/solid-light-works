import * as THREE from 'three'
import {
  parametricTravellingWaveX,
  parametricTravellingWaveY,
  parametricTravellingWaveXDerivative,
  parametricTravellingWaveYDerivative,
} from '../syntax/parametric-travelling-wave'
import { CycleTiming } from '../cycle-timing'
import { Line } from '../line'
import * as C from '../constants'
import * as U from '../utils'

const MAX_TICKS = 1000 / 16 * 20
// const ELLIPSE_POINT_COUNT = 100
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

    const waveWidth = this.width

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

    const upperTravellingWavePoints = this.getTravellingWavePoints(
      parametricTravellingWave1XFn,
      parametricTravellingWave1YFn,
      0,
      waveWidth)

    const lowerTravellingWavePoints = this.getTravellingWavePoints(
      parametricTravellingWave2XFn,
      parametricTravellingWave2YFn,
      0,
      waveWidth)

    const lineOptions = { clipToFormBoundary: true }
    const upperTravellingWaveLine = new Line(upperTravellingWavePoints, lineOptions)
    const lowerTravellingWaveLine = new Line(lowerTravellingWavePoints, lineOptions)
    const lines = [upperTravellingWaveLine, lowerTravellingWaveLine]
    // const lines = [upperTravellingWaveLine]
    // const lines = [lowerTravellingWaveLine]
    const intersectionPoints = []
    const footprintData = { lines, intersectionPoints }

    return footprintData
  }
}
