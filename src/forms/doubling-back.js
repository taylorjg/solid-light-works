import * as THREE from 'three'
import { TravellingWave } from '../syntax/travelling-wave'
import * as U from '../utils'
import * as C from '../constants'

const TRAVELLING_WAVE_POINT_COUNT = 50

// https://paddle8.com/work/anthony-mccall/156781-doubling-back/
export class DoublingBackForm {

  constructor(isProjector) {
    this.isProjector = isProjector
    if (isProjector) {
      const projectorCentre = new THREE.Vector2(0, C.PROJECTOR_CY * 4)
      this.points = [
        U.repeat(TRAVELLING_WAVE_POINT_COUNT + 1, projectorCentre),
        U.repeat(TRAVELLING_WAVE_POINT_COUNT + 1, projectorCentre)
      ]
    } else {
      this.travellingWaveLeftToRight = new TravellingWave(0, 3, 4, 4, false)
      this.travellingWaveBottomToTop = new TravellingWave(0, 3, 4, 4, true)
      this.tick = 0
    }
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
