import * as THREE from 'three'
import { parametricEllipseX, parametricEllipseY } from '../syntax/parametric-ellipse'
import { CycleTiming } from '../cycle-timing'
import { Line } from '../line'
import * as U from '../utils'

const MAX_TICKS = 1000 / 16 * 20
const ELLIPSE_POINT_COUNT = 100

export class LineDescribingAConeForm {

  constructor(width, height) {
    this.cycleTiming = new CycleTiming(MAX_TICKS)
    this.width = width
    this.height = height
    this.r = Math.min(width, height) / 2
  }

  getEllipsePoints(parametricEllipseXFn, parametricEllipseYFn, t1, t2) {
    const Δt = (t2 - t1) / ELLIPSE_POINT_COUNT
    return U.range(ELLIPSE_POINT_COUNT + 1).map(n => {
      const t = t1 + n * Δt
      const x = parametricEllipseXFn(t)
      const y = parametricEllipseYFn(t)
      return new THREE.Vector2(x, y)
    })
  }

  getFootprintData(deltaMs, absoluteMs) {
    const { cycleRatio } = this.cycleTiming.update(deltaMs, absoluteMs)

    const circleXFn = parametricEllipseX(this.r)
    const circleYFn = parametricEllipseY(this.r)

    const t1 = THREE.MathUtils.degToRad(-90)
    const t2 = THREE.MathUtils.degToRad(-90 - 360 * cycleRatio)

    const circlePoints = this.getEllipsePoints(circleXFn, circleYFn, t1, t2)

    const circleLine = new Line(circlePoints)
    const lines = [circleLine]

    // TODO: add a dot to the end of the circle line

    const intersectionPoints = []

    const footprintData = { lines, intersectionPoints }

    return footprintData
  }
}
