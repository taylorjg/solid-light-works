import * as THREE from 'three'
import { CircleWave } from '../syntax/circle-wave'
import * as U from '../utils'
import * as C from '../constants'

// https://www.ericforman.com/anthony-mccall-solid-light#6
// https://www.ericforman.com/anthony-mccall-solid-light#7
// https://www.ericforman.com/blog/making-of-solid-light-for-anthony-mccall

const CIRCLE_WAVE_POINT_COUNT = 200

export class CouplingForm {

  constructor(projectorPosition, isProjector) {
    this.isProjector = isProjector
    if (isProjector) {
      const vec2ProjectorPosition = new THREE.Vector2(projectorPosition.x, projectorPosition.z)
      this.points = [
        U.repeat(CIRCLE_WAVE_POINT_COUNT + 1, vec2ProjectorPosition),
        U.repeat(CIRCLE_WAVE_POINT_COUNT + 1, vec2ProjectorPosition)
      ]
    } else {
      this.circleWaveOuter = new CircleWave(2, 0.4, 3.5, 0.001, 0.001, 0, 0)
      this.circleWaveInner = new CircleWave(1, 0.4, 3.5, 0.001, 0.001, C.HALF_PI, 0)
      this.tick = 0
    }
  }

  get shapeCount() {
    return 2
  }

  getUpdatedPoints() {
    if (this.isProjector) {
      return this.points
    }
    const points = [
      this.circleWaveOuter.getPoints(CIRCLE_WAVE_POINT_COUNT, this.tick),
      this.circleWaveInner.getPoints(CIRCLE_WAVE_POINT_COUNT, this.tick)
    ]
    this.tick++
    return points
  }
}
