import * as THREE from 'three'
import { Ellipse } from '../syntax/ellipse'
import { StraightLine } from '../syntax/straight-line'
import * as U from '../utils'
import * as C from '../constants'

const ELLIPSE_POINT_COUNT = 50
const TRAVELLING_WAVE_POINT_COUNT = 50
const R = 2

export class BetweenYouAndIForm {

  constructor(projectorPosition, isProjector, isFront, depth) {
    this.vec2ProjectorPosition = new THREE.Vector2(projectorPosition.x, projectorPosition.z)
    this.isFront = isFront
    this.depth = depth
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
    if (this.isFront) return []
    if (isProjector) {
      return U.repeat(ELLIPSE_POINT_COUNT + 1, this.vec2ProjectorPosition)
    }
    const ellipse = new Ellipse(0, this.depth, R, R)
    return ellipse.getPoints(0, C.TWO_PI, ELLIPSE_POINT_COUNT)
  }

  createTravellingWave(isProjector) {
    if (!this.isFront) return []
    if (isProjector) {
      return U.repeat(TRAVELLING_WAVE_POINT_COUNT + 1, this.vec2ProjectorPosition)
    }
    const startAngle = 0
    const endAngle = C.TWO_PI
    const dy = 2 * R / TRAVELLING_WAVE_POINT_COUNT
    const deltaAngle = (endAngle - startAngle) / TRAVELLING_WAVE_POINT_COUNT
    return U.range(TRAVELLING_WAVE_POINT_COUNT + 1).map(n => {
      return new THREE.Vector2(R * Math.sin(startAngle - n * deltaAngle), this.depth - R + n * dy)
    })
  }

  createStraightLine(isProjector) {
    if (!this.isFront) return []
    if (isProjector) {
      return U.repeat(2, this.vec2ProjectorPosition)
    }
    const v = R * Math.sin(C.QUARTER_PI)
    const straightLine = new StraightLine(
      new THREE.Vector2(v, this.depth - v),
      new THREE.Vector2(-v, this.depth + v))
    return straightLine.getPoints()
  }

  getUpdatedPoints() {
    return this.pointsArray
  }
}
