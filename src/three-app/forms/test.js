import * as THREE from 'three'
import { Line } from '../line'
import { parametricEllipseX, parametricEllipseY } from '../syntax/parametric-ellipse'
import { parametricTravellingWaveX, parametricTravellingWaveY } from '../syntax/parametric-travelling-wave'
import * as C from '../constants'
import * as U from '../utils'

const MY_LINE_THICKNESS = 0.2

const ELLIPSE_POINT_COUNT = 100
const TRAVELLING_WAVE_POINT_COUNT = 100

export class TestForm {

  constructor(width, height) {
    // These are needed by 'clipToFormBoundary'
    this.width = width
    this.height = height

    const includeBoundary = 1
    const includeStraightLine = 1
    const includeEllipse = 0
    const includeTravellingWave = 1

    const rx = width / 2 - MY_LINE_THICKNESS / 2
    const ry = height / 2 - MY_LINE_THICKNESS / 2

    const straightLinePoints = [
      new THREE.Vector2(-width / 3, -height / 2),
      new THREE.Vector2(width / 3, height / 2)
    ]
    const straightLine = new Line(straightLinePoints, {
      lineThickness: MY_LINE_THICKNESS,
      clipToFormBoundary: true
    })

    const Δθ = C.TWO_PI / ELLIPSE_POINT_COUNT
    const ellipsePoints = U.range(ELLIPSE_POINT_COUNT + 1).map(n => {
      const t = n * Δθ
      const x = parametricEllipseX(rx)(t)
      const y = parametricEllipseY(ry)(t)
      return new THREE.Vector2(x, y)
    })
    const ellipseLine = new Line(ellipsePoints, {
      lineThickness: MY_LINE_THICKNESS,
      clipToFormBoundary: true
    })

    const λ = width
    const k = C.TWO_PI / λ
    const xoffset = -width / 2
    const Δx = width / TRAVELLING_WAVE_POINT_COUNT
    const travellingWavePoints = U.range(TRAVELLING_WAVE_POINT_COUNT + 1).map(n => {
      const t = n * Δx
      const x = parametricTravellingWaveX(xoffset)(t)
      const y = parametricTravellingWaveY(ry, k, 0, 0)(t)
      return new THREE.Vector2(x, y)
    })
    const travellingWaveLine = new Line(travellingWavePoints, {
      lineThickness: MY_LINE_THICKNESS,
      clipToFormBoundary: true
    })

    const boundaryPoints = [
      new THREE.Vector3(-width / 2, -height / 2),
      new THREE.Vector3(-width / 2, height / 2),
      new THREE.Vector3(width / 2, height / 2),
      new THREE.Vector3(width / 2, -height / 2),
    ]
    const boundaryLine = new Line(boundaryPoints, {
      lineThickness: 0.01,
      closed: true
    })

    const maybeLine = (flag, line) => flag ? [line] : []

    this.lines = [
      ...maybeLine(includeBoundary, boundaryLine),
      ...maybeLine(includeStraightLine, straightLine),
      ...maybeLine(includeEllipse, ellipseLine),
      ...maybeLine(includeTravellingWave, travellingWaveLine),
    ]
  }

  getLines() {
    return this.lines
  }
}
