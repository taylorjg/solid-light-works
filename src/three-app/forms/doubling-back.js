import * as THREE from 'three'
import { Line } from '../line'
import * as U from '../utils'
import * as C from '../constants'

const parametricTravellingWaveX = xoffset =>
  t => t + xoffset

const parametricTravellingWaveY = (A, k, ωt, φ) =>
  t => A * Math.sin(k * t - ωt + φ)

const MAX_TICKS = 8900
const DELAY_TICKS = 120
const TRAVELLING_WAVE_POINT_COUNT = 200

// https://paddle8.com/work/anthony-mccall/156781-doubling-back/
export class DoublingBackForm {

  constructor(width, height) {
    this.width = width
    this.height = height
    this.tick = 0
    this.direction = 1
    this.delaying = false
    this.delayTick = 0
    this.firstTime = true
  }

  getTravellingWavePoints1() {
    const λ = this.width * 4 / 3
    const k = C.TWO_PI / λ
    const f = 1
    const ω = C.TWO_PI * f
    const speed = 0.0001
    const φ = THREE.MathUtils.degToRad(160)
    const Δx = this.width / TRAVELLING_WAVE_POINT_COUNT
    return U.range(TRAVELLING_WAVE_POINT_COUNT + 1).map(n => {
      const x = Δx * n
      const y = this.height / 2 * Math.sin(k * x - ω * this.tick * speed + φ)
      return new THREE.Vector2(x - this.width / 2, y)
    })
  }

  getTravellingWavePoints2() {
    const λ = this.width * 4 / 3
    const k = C.TWO_PI / λ
    const f = 1
    const ω = C.TWO_PI * f
    const speed = 0.0001
    const φ = THREE.MathUtils.degToRad(70)
    const Δy = this.height / TRAVELLING_WAVE_POINT_COUNT
    const midpoint = this.width / 2 - this.height / 2
    return U.range(TRAVELLING_WAVE_POINT_COUNT + 1).map(n => {
      const y = Δy * n
      const x = this.height / 2 * Math.sin(k * y - ω * this.tick * speed + φ)
      return new THREE.Vector2(midpoint - x, y - this.height / 2)
    })
  }

  getLines() {

    if (this.tick === MAX_TICKS || (this.tick === 0 && !this.firstTime)) {
      if (this.delaying) {
        this.delayTick -= 1
        if (this.delayTick === 0) {
          this.delaying = false
          this.firstTime = false
          this.direction *= -1
        }
      } else {
        this.delaying = true
        this.delayTick = DELAY_TICKS
      }
    }

    const travellingWavePoints1 = this.getTravellingWavePoints1()
    const travellingWavePoints2 = this.getTravellingWavePoints2()
    const line1 = new Line(travellingWavePoints1)
    const line2 = new Line(travellingWavePoints2)
    const lines = [line1, line2]

    if (!this.delaying) {
      this.tick += this.direction
    }

    return lines
  }
}
