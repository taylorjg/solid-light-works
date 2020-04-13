import { CircleWave } from '../syntax/circle-wave'
import * as C from '../constants'

// https://www.ericforman.com/anthony-mccall-solid-light#6
// https://www.ericforman.com/anthony-mccall-solid-light#7
// https://www.ericforman.com/blog/making-of-solid-light-for-anthony-mccall

const CIRCLE_WAVE_POINT_COUNT = 200

export class CouplingForm {

  constructor(outerRadius, innerRadius) {
    this.circleWaveOuter = new CircleWave(outerRadius, 0.4, 3.5, 0.001, 0.001, 0, 0)
    this.circleWaveInner = new CircleWave(innerRadius, 0.4, 3.5, 0.001, 0.001, C.HALF_PI, 0)
    this.tick = 0
  }

  get shapeCount() {
    return 2
  }

  getUpdatedPoints() {
    const points = [
      this.circleWaveOuter.getPoints(CIRCLE_WAVE_POINT_COUNT, this.tick),
      this.circleWaveInner.getPoints(CIRCLE_WAVE_POINT_COUNT, this.tick)
    ]
    this.tick++
    return points
  }
}
