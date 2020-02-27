import * as THREE from 'three'
import { EllipseCurve } from './ellipse-curve'
import * as U from './utils'
import * as C from './constants'

const ELLIPSE_POINT_COUNT = 50
const WAVE_POINT_COUNT = 50

export class AlternateFormPoints {

  constructor(isProjector) {
    this.pointsArray = [
      this.createEllipse(isProjector),
      this.createWave(isProjector),
      this.createLine(isProjector)
    ]
  }

  createEllipse(isProjector) {
    if (isProjector) {
      return U.repeat(ELLIPSE_POINT_COUNT + 1, new THREE.Vector2(0, C.PROJECTOR_CY * 4))
    }
    const ellipseCurve = new EllipseCurve(0, 2, 3.2, 2)
    return ellipseCurve.getPoints(-Math.PI / 2, Math.PI / 2, ELLIPSE_POINT_COUNT)
  }

  createWave(isProjector) {
    if (isProjector) {
      return U.repeat(WAVE_POINT_COUNT + 1, new THREE.Vector2(0, C.PROJECTOR_CY * 4))
    }
    const startAngle = Math.PI / 180 * 20
    const endAngle = Math.PI / 180 * 250
    const dx = 6 / WAVE_POINT_COUNT
    const deltaAngle = (endAngle - startAngle) / WAVE_POINT_COUNT
    return U.range(WAVE_POINT_COUNT + 1).map(n => {
      return new THREE.Vector2(0 + n * dx, 2.4 + Math.cos(startAngle + n * deltaAngle) * 2.4)
    })
  }

  createLine(isProjector) {
    if (isProjector) {
      return U.repeat(2, new THREE.Vector2(0, C.PROJECTOR_CY * 4))
    }
    return [
      new THREE.Vector2(0, 1.4),
      new THREE.Vector2(6, 1.2)
    ]
  }

  getUpdatedPoints() {
    return this.pointsArray
  }
}
