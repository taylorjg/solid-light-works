import * as THREE from 'three'
import * as U from '../utils'

// I'm using my own code to calculate points on an elliptical curve that
// assumes a clockwise direction. I found that I was having to fight against
// THREE.EllipseCurve due to negative start/end angles etc.
export class Ellipse {

  constructor(cx, cy, rx, ry) {
    this.cx = cx
    this.cy = cy
    this.rx = rx
    this.ry = ry
  }

  getPoint(angle) {
    const x = this.cx - this.rx * Math.cos(angle)
    const y = this.cy + this.ry * Math.sin(angle)
    return new THREE.Vector2(x, y)
  }

  getPoints(startAngle, endAngle, divisions) {
    const deltaAngle = endAngle - startAngle
    return U.range(divisions + 1).map(index => {
      const t = index / divisions
      const angle = startAngle + t * deltaAngle
      return this.getPoint(angle)
    })
  }
}
