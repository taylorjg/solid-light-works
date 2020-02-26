import * as THREE from 'three'

export class AlternateFormPoints {

  constructor(x1, y1, x2, y2) {
    this.straightLinePoints = [
      new THREE.Vector2(x1, y1),
      new THREE.Vector2(x2, y2)
    ]
  }

  getUpdatedPoints() {
    return this.straightLinePoints
  }
}
