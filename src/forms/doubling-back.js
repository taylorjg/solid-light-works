import { TravellingWave } from '../syntax/travelling-wave'

const TRAVELLING_WAVE_POINT_COUNT = 100

// https://paddle8.com/work/anthony-mccall/156781-doubling-back/
export class DoublingBackForm {

  constructor(width, height) {
    this.travellingWaveRight = new TravellingWave(width, height, false)
    this.travellingWaveUp = new TravellingWave(width, height, true)
    this.tick = 0
  }

  get shapeCount() {
    return 2
  }

  getUpdatedPoints() {
    const points = [
      this.travellingWaveRight.getPoints(TRAVELLING_WAVE_POINT_COUNT, this.tick),
      this.travellingWaveUp.getPoints(TRAVELLING_WAVE_POINT_COUNT, this.tick)
    ]
    this.tick++
    return points
  }
}
