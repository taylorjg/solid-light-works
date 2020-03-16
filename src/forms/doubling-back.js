import { TravellingWave } from '../syntax/travelling-wave'
import * as U from '../utils'

const TRAVELLING_WAVE_POINT_COUNT = 100

// https://paddle8.com/work/anthony-mccall/156781-doubling-back/
export class DoublingBackForm {

  constructor(projectorPosition, isProjector) {
    this.isProjector = isProjector
    if (isProjector) {
      this.points = [
        U.repeat(TRAVELLING_WAVE_POINT_COUNT + 1, projectorPosition),
        U.repeat(TRAVELLING_WAVE_POINT_COUNT + 1, projectorPosition)
      ]
    } else {
      this.travellingWaveLeftToRight = new TravellingWave(0, 2, 6, 4, false)
      this.travellingWaveBottomToTop = new TravellingWave(0, 2, 6, 4, true)
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
      this.travellingWaveLeftToRight.getPoints(TRAVELLING_WAVE_POINT_COUNT, this.tick),
      this.travellingWaveBottomToTop.getPoints(TRAVELLING_WAVE_POINT_COUNT, this.tick)
    ]
    this.tick++
    return points
  }
}
