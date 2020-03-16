import * as THREE from 'three'
import { Ellipse } from '../syntax/ellipse'
import { StraightLine } from '../syntax/straight-line'
import * as U from '../utils'
import * as C from '../constants'

const ELLIPSE_POINT_COUNT = 50
const TRAVELLING_WAVE_POINT_COUNT = 50

export class BetweenYouAndIForm {

  constructor(projectorPosition, isProjector) {
    this.vec2ProjectorPosition = new THREE.Vector2(projectorPosition.x, projectorPosition.z)
    this.pointsArray = [
      this.createEllipse(isProjector),
      this.createTravellingWave(isProjector),
      this.createStraightLine(isProjector)
    ]
  }

  get shapeCount() {
    return 3
  }

  createEllipse(isProjector) {
    if (isProjector) {
      return U.repeat(ELLIPSE_POINT_COUNT + 1, this.vec2ProjectorPosition)
    }
    const ellipse = new Ellipse(0, 2, 1.4, 0.8)
    return ellipse.getPoints(-C.HALF_PI, C.HALF_PI, ELLIPSE_POINT_COUNT)
  }

  createTravellingWave(isProjector) {
    if (isProjector) {
      return U.repeat(TRAVELLING_WAVE_POINT_COUNT + 1, this.vec2ProjectorPosition)
    }
    const startAngle = C.PI / 180 * 20
    const endAngle = C.PI / 180 * 250
    const dx = 2 / TRAVELLING_WAVE_POINT_COUNT
    const deltaAngle = (endAngle - startAngle) / TRAVELLING_WAVE_POINT_COUNT
    return U.range(TRAVELLING_WAVE_POINT_COUNT + 1).map(n => {
      return new THREE.Vector2(n * dx, 2 + Math.cos(startAngle + n * deltaAngle) * 1.2)
    })
  }

  createStraightLine(isProjector) {
    if (isProjector) {
      return U.repeat(2, this.vec2ProjectorPosition)
    }
    const straightLine = new StraightLine(
      new THREE.Vector2(0, 2.4),
      new THREE.Vector2(2, 2.2))
    return straightLine.getPoints()
  }

  getUpdatedPoints() {
    return this.pointsArray
  }
}
