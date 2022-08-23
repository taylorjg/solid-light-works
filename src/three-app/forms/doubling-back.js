import * as THREE from 'three'
import { Line } from '../line'
import { parametricTravellingWaveX, parametricTravellingWaveY } from '../syntax/parametric-travelling-wave'
import { CycleTiming } from '../cycle-timing'
import * as C from '../constants'
import * as U from '../utils'

const MAX_TICKS = 8900
const DELAY_TICKS = 120
const TRAVELLING_WAVE_POINT_COUNT = 200

export class DoublingBackForm {

  constructor(width, height) {
    this.cycleTiming = new CycleTiming(MAX_TICKS + DELAY_TICKS, this.onReset.bind(this))
    this.width = width
    this.height = height
    this.direction = 1
    this.A = this.height / 2 - C.LINE_THICKNESS / 2
    const λ = this.width * 4 / 3
    this.k = C.TWO_PI / λ
    const f = 1
    this.ω = C.TWO_PI * f
    this.speed = 0.0001
  }

  getLeftToRightTravellingWavePoints(tick) {
    const { A, k, ω, speed } = this
    const ωt = ω * tick * speed
    const φ = THREE.MathUtils.degToRad(160)
    const xoffset = -this.width / 2
    const Δx = this.width / TRAVELLING_WAVE_POINT_COUNT
    const parametricTravellingWaveXFn = parametricTravellingWaveX(xoffset)
    const parametricTravellingWaveYFn = parametricTravellingWaveY(A, k, ωt, φ)
    return U.range(TRAVELLING_WAVE_POINT_COUNT + 1).map(n => {
      const t = n * Δx
      const x = parametricTravellingWaveXFn(t)
      const y = parametricTravellingWaveYFn(t)
      return new THREE.Vector2(x, y)
    })
  }

  getBottomToTopTravellingWavePoints(tick) {
    const { A, k, ω, speed } = this
    const ωt = ω * tick * speed
    const φ = THREE.MathUtils.degToRad(70)
    const xoffset = -this.height / 2
    const Δx = this.height / TRAVELLING_WAVE_POINT_COUNT
    const midpoint = this.width / 2 - this.height / 2
    const parametricTravellingWaveXFn = parametricTravellingWaveX(xoffset)
    const parametricTravellingWaveYFn = parametricTravellingWaveY(A, k, ωt, φ)
    return U.range(TRAVELLING_WAVE_POINT_COUNT + 1).map(n => {
      const t = n * Δx
      const x = parametricTravellingWaveXFn(t)
      const y = parametricTravellingWaveYFn(t)
      return new THREE.Vector2(midpoint - y, x)
    })
  }

  getFootprintData(deltaMs, absoluteMs) {
    const directionBeforeUpdate = this.direction
    const { tick } = this.cycleTiming.update(deltaMs, absoluteMs)
    const clampedTick = Math.min(tick, MAX_TICKS)
    const directionalTick = directionBeforeUpdate > 0 ? clampedTick : MAX_TICKS - clampedTick

    const leftToRightTravellingWavePoints = this.getLeftToRightTravellingWavePoints(directionalTick)
    const bottomToTopTravellingWavePoints = this.getBottomToTopTravellingWavePoints(directionalTick)

    const line1 = new Line(leftToRightTravellingWavePoints, { clipToFormBoundary: true })
    const line2 = new Line(bottomToTopTravellingWavePoints, { clipToFormBoundary: true })
    const lines = [line1, line2]

    const footprintData = { lines }

    return footprintData
  }

  onReset() {
    this.direction *= -1
  }
}
