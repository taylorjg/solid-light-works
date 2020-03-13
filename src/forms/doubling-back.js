import * as THREE from 'three'
import { TravellingWave } from '../syntax/travelling-wave'
import * as U from '../utils'
import * as C from '../constants'

const TRAVELLING_WAVE_POINT_COUNT = 50

export class DoublingBackForm {

  constructor(isProjector) {
    this.isProjector = isProjector
    if (isProjector) {
      const projectorCentre = new THREE.Vector2(0, C.PROJECTOR_CY * 4)
      this.points = [
        U.repeat(TRAVELLING_WAVE_POINT_COUNT + 1, projectorCentre)
        // U.repeat(TRAVELLING_WAVE_POINT_COUNT + 1, projectorCentre)
      ]
    } else {
      this.travellingWave1 = new TravellingWave(0, 2, 4, 1)
      // this.travellingWave2 = new TravellingWave()
      this.tick = 0
    }
  }

  getUpdatedPoints() {
    if (this.isProjector) {
      return this.points
    }
    const points = [
      this.travellingWave1.getPoints(TRAVELLING_WAVE_POINT_COUNT, this.tick)
      // this.travellingWave2.getPoints(TRAVELLING_WAVE_POINT_COUNT, this.tick)
    ]
    this.tick++
    return points
  }
}
