import * as THREE from 'three'
import * as U from '../utils'

export class Ellipse {

  constructor(cx, cy, rx, ry) {
    this.cx = cx
    this.cy = cy
    this.rx = rx
    this.ry = ry
  }

  getPoint(angle) {
    const x = this.cx + this.rx * Math.cos(angle)
    const y = this.cy + this.ry * Math.sin(angle)
    return new THREE.Vector2(x, y)
  }

  getPoints(startAngle, endAngle, divisions) {
    const diffAngle = endAngle - startAngle
    return U.range(divisions + 1).map(n => {
      const t = n / divisions
      const angle = startAngle + t * diffAngle
      return this.getPoint(angle)
    })
  }
}
