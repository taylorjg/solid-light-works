import * as THREE from 'three'
import { Line } from '../line'
import * as C from '../constants'
import * as U from '../utils'

const NUM_POINTS = 1
const TEST_LINE_THICKNESS = C.LINE_THICKNESS * 5

export class TestForm {

  constructor(width, height) {
    this.width = width
    this.height = height
    const xoffset = -this.width / 2 - TEST_LINE_THICKNESS
    const yoffset = -this.height / 2 - TEST_LINE_THICKNESS
    const Δx = (this.width + 2 * TEST_LINE_THICKNESS) / NUM_POINTS
    const Δy = (this.height + 2 * TEST_LINE_THICKNESS) / NUM_POINTS
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
