import * as THREE from 'three'
import {
  parametricEllipseX,
  parametricEllipseY,
} from '../syntax/parametric-ellipse'
import {
  parametricTravellingWaveX,
  parametricTravellingWaveY,
} from '../syntax/parametric-travelling-wave'
import { CycleTiming } from '../cycle-timing'
import { Line } from '../line'
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

  getUpperEllipsePoints() {
    const baseθ = THREE.MathUtils.degToRad(32)
    const Δθ = THREE.MathUtils.degToRad(116) / ELLIPSE_POINT_COUNT
    return U.range(ELLIPSE_POINT_COUNT + 1).map(n => {
      const t = baseθ + n * Δθ
      const x = parametricEllipseX(this.ellipseRx)(t)
      const y = parametricEllipseY(this.ellipseRy)(t)
      return new THREE.Vector2(x, y)
    })
  }

  getLowerEllipsePoints() {
    const baseθ = THREE.MathUtils.degToRad(-148)
    const Δθ = THREE.MathUtils.degToRad(116) / ELLIPSE_POINT_COUNT
    return U.range(ELLIPSE_POINT_COUNT + 1).map(n => {
      const t = baseθ + n * Δθ
      const x = parametricEllipseX(this.ellipseRx)(t)
      const y = parametricEllipseY(this.ellipseRy)(t)
      return new THREE.Vector2(x, y)
    })
  }

  // getEllipsePoints() {
  //   const Δθ = C.TWO_PI / ELLIPSE_POINT_COUNT
  //   return U.range(ELLIPSE_POINT_COUNT + 1).map(n => {
  //     const t = n * Δθ
  //     const x = parametricEllipseX(this.ellipseRx)(t)
  //     const y = parametricEllipseY(this.ellipseRy)(t)
  //     return new THREE.Vector2(x, y)
  //   })
  // }

  getTravellingWavePoints(cycleRatio) {
    const λ = this.width * 0.9
    const k = C.TWO_PI / λ
    const f = 1
    const ω = C.TWO_PI * f
    const ωt = ω * cycleRatio
    const margin = this.width * 0.02
    const waveWidth = this.width - (2 * margin)
    const xoffset = -waveWidth / 2
    const Δx = waveWidth / TRAVELLING_WAVE_POINT_COUNT
    return U.range(TRAVELLING_WAVE_POINT_COUNT + 1).map(n => {
      const t = n * Δx
      const x = parametricTravellingWaveX(xoffset)(t)
      const y = parametricTravellingWaveY(this.travellingWaveRy, k, ωt, 0)(t)
      return new THREE.Vector2(x, -y)
    })
  }

  getFootprintData(deltaMs, absoluteMs) {
    const { cycleRatio, tick } = this.cycleTiming.update(deltaMs, absoluteMs)

    // const ellipsePoints = this.getEllipsePoints(tick)
    const upperEllipsePoints = this.getUpperEllipsePoints(tick)
    const lowerEllipsePoints = this.getLowerEllipsePoints(tick)
    const travellingWavePoints = this.getTravellingWavePoints(cycleRatio)

    // const ellipseLine = new Line(ellipsePoints)
    const upperEllipseLine = new Line(upperEllipsePoints)
    const lowerEllipseLine = new Line(lowerEllipsePoints)
    const travellingWaveLine = new Line(travellingWavePoints, { clipToFormBoundary: true })
    // const lines = [ellipseLine, travellingWaveLine]
    const lines = [upperEllipseLine, lowerEllipseLine, travellingWaveLine]

    const intersectionPoints = []
    const footprintData = { lines, intersectionPoints }

    return footprintData
  }
}
