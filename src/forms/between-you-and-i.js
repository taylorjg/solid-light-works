import * as THREE from 'three'
import { Ellipse } from '../syntax/ellipse'
import { StraightLine } from '../syntax/straight-line'
import * as U from '../utils'
import * as C from '../constants'

const ELLIPSE_POINT_COUNT = 50
const TRAVELLING_WAVE_POINT_COUNT = 50

export class BetweenYouAndIForm {

  constructor(isProjector) {
    this.projectorCentre = new THREE.Vector2(0, C.PROJECTOR_CY * 4)
    this.pointsArray = [
      this.createEllipse(isProjector),
      this.createTravellingWave(isProjector),
      this.createStraightLine(isProjector)
    ]
  }

  createEllipse(isProjector) {
    if (isProjector) {
      return U.repeat(ELLIPSE_POINT_COUNT + 1, this.projectorCentre)
    }
    const ellipse = new Ellipse(0, 2, 3.2, 2)
    return ellipse.getPoints(-C.HALF_PI, C.HALF_PI, ELLIPSE_POINT_COUNT)
  }

  createTravellingWave(isProjector) {
    if (isProjector) {
      return U.repeat(TRAVELLING_WAVE_POINT_COUNT + 1, this.projectorCentre)
    }
    const startAngle = C.PI / 180 * 20
    const endAngle = C.PI / 180 * 250
    const dx = 6 / TRAVELLING_WAVE_POINT_COUNT
    const deltaAngle = (endAngle - startAngle) / TRAVELLING_WAVE_POINT_COUNT
    return U.range(TRAVELLING_WAVE_POINT_COUNT + 1).map(n => {
      return new THREE.Vector2(0 + n * dx, 2.4 + Math.cos(startAngle + n * deltaAngle) * 2.4)
    })
  }

  createStraightLine(isProjector) {
    if (isProjector) {
      return U.repeat(2, this.projectorCentre)
    }
    const straightLine = new StraightLine(
      new THREE.Vector2(0, 1.4),
      new THREE.Vector2(6, 1.2))
    return straightLine.getPoints()
  }

  getUpdatedPoints() {
    return this.pointsArray
  }
}
