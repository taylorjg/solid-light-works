import * as THREE from 'three'
import { Line } from '../line'
import * as U from '../utils'

const NUM_POINTS = 1

export class TestForm {

  constructor(width, height) {
    this.width = width
    this.height = height
    this.tick = 0

    const dx = this.width / NUM_POINTS
    const dy = this.height / NUM_POINTS
    this.points = U.range(NUM_POINTS + 1).map(n => {
      const x = -this.width / 2 + n * dx
      const y = -this.height / 2 + n * dy
      return new THREE.Vector2(x, y)
    })
  }

  getLines() {
    const normal = new THREE.Vector3(1, 0, 0)
    const constant = 0 // this.width * 0.2
    const clippingPlane = new THREE.Plane(normal, constant)
    const line = new Line(this.points, { lineThickness: 0.5, clippingPlanes: [clippingPlane] })
    this.tick++
    return [line]
  }
}
