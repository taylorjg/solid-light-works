import * as THREE from 'three'
import { Line } from '../projector'
import * as U from '../utils'
import * as C from '../constants'

const MAX_TICKS = 8900
const DELAY_TICKS = 120
const TRAVELLING_WAVE_POINT_COUNT = 200

// https://paddle8.com/work/anthony-mccall/156781-doubling-back/
export class DoublingBackForm {

  constructor(width, height) {
    this.width = width
    this.height = height
    this.waveLength = width * 4 / 3
    this.tick = 0
    this.direction = 1
    this.delaying = false
    this.delayTick = 0
    this.firstTime = true
  }

  get lineCount() {
    return 2
  }

  getTravellingWavePoints1() {
    const k = C.TWO_PI / this.waveLength
    const frequency = 1
    const omega = C.TWO_PI * frequency
    const speed = 0.0001
    const phase = THREE.MathUtils.degToRad(160)
    const dx = this.width / TRAVELLING_WAVE_POINT_COUNT
    return U.range(TRAVELLING_WAVE_POINT_COUNT + 1).map(n => {
      const x = dx * n
      const y = this.height / 2 * Math.sin(k * x - omega * this.tick * speed + phase)
      return new THREE.Vector2(x - this.width / 2, y)
    })
  }

  getTravellingWavePoints2() {
    const k = C.TWO_PI / this.waveLength
    const frequency = 1
    const omega = C.TWO_PI * frequency
    const speed = 0.0001
    const phase = THREE.MathUtils.degToRad(70)
    const dy = this.height / TRAVELLING_WAVE_POINT_COUNT
    const midpoint = this.width / 2 - this.height / 2
    return U.range(TRAVELLING_WAVE_POINT_COUNT + 1).map(n => {
      const y = dy * n
      const x = this.height / 2 * Math.sin(k * y - omega * this.tick * speed + phase)
      return new THREE.Vector2(midpoint - x, y - this.height / 2)
    })
  }

  getLines() {

    if (this.tick == MAX_TICKS || (this.tick == 0 && !this.firstTime)) {
      if (this.delaying) {
        this.delayTick -= 1
        if (this.delayTick == 0) {
          this.delaying = false
          this.firstTime = false
          this.direction *= -1
        }
      } else {
        this.delaying = true
        this.delayTick = DELAY_TICKS
      }
    }

    const points1 = this.getTravellingWavePoints1()
    const points2 = this.getTravellingWavePoints2()
    const lines = [points1, points2].map(points => new Line(points))

    if (!this.delaying) {
      this.tick += this.direction
    }

    return lines
  }
}
