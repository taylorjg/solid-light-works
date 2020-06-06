import { TravellingWave } from '../syntax/travelling-wave'
import { Line } from '../projector'

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

  getLines() {
    const pointss = [
      this.travellingWaveRight.getPoints(TRAVELLING_WAVE_POINT_COUNT, this.tick),
      this.travellingWaveUp.getPoints(TRAVELLING_WAVE_POINT_COUNT, this.tick)
    ]
    const lines = pointss.map(points => new Line(points))
    this.tick++
    return lines
  }
}
