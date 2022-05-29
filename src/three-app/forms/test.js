import * as THREE from 'three'
import { Line } from '../line'
import * as C from '../constants'
import * as U from '../utils'

const NUM_POINTS = 10
const TEST_LINE_THICKNESS = C.LINE_THICKNESS * 5

export class TestForm {

  constructor(width, height) {
    this.width = width
    this.height = height

    const divisor = window.location.search.includes('test2') ? 2 : 1
    const lineWidth = this.width / divisor
    const lineHeight = this.height / divisor

    const xoffset = -lineWidth / 2 - TEST_LINE_THICKNESS
    const yoffset = -lineHeight / 2 - TEST_LINE_THICKNESS
    const Δx = (lineWidth + 2 * TEST_LINE_THICKNESS) / NUM_POINTS
    const Δy = (lineHeight + 2 * TEST_LINE_THICKNESS) / NUM_POINTS

    this.points = U.range(NUM_POINTS + 1).map(n => {
      const x = xoffset + n * Δx
      const y = yoffset + n * Δy
      return new THREE.Vector2(x, y)
    })
    const line = new Line(this.points, {
      lineThickness: TEST_LINE_THICKNESS,
      clipToFormBoundary: true
    })
    this.lines = [line]
  }

  getLines() {
    return this.lines
  }
}
