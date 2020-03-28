import * as THREE from 'three'
import { Ellipse } from '../syntax/ellipse'
import * as U from '../utils'
import * as C from '../constants'

const MAX_TICKS = 10000
const ELLIPSE_POINT_COUNT = 100
const TRAVELLING_WAVE_POINT_COUNT = 50

export const setSpeed = (/* multiplier */) => {
}

export class LeavingForm {

  constructor(projectorPosition, isProjector, cx, cy, rx, ry, isInitiallyGrowing) {
    this.projectorPosition = projectorPosition
    this.isProjector = isProjector
    this.cx = cx
    this.cy = cy
    this.rx = rx
    this.ry = ry
    this.ellipse = new Ellipse(cx, cy, rx, ry)
    this.reset(isInitiallyGrowing)
  }

  get shapeCount() {
    return 1
  }

  combineEllipseAndTravellingWavePoints(ellipsePoints, travellingWavePoints) {
    const travellingWavePointsTail = travellingWavePoints.slice(1)
    return this.growing
      ? ellipsePoints.concat(travellingWavePointsTail)
      : travellingWavePointsTail.reverse().concat(ellipsePoints)
  }

  getUpdatedPoints() {

    if (this.isProjector) {
      return [U.repeat(ELLIPSE_POINT_COUNT + TRAVELLING_WAVE_POINT_COUNT + 1, this.projectorPosition)]
    }

    const deltaAngle = C.TWO_PI / MAX_TICKS
    this.tick++

    let theta
    if (this.growing) {
      this.endAngle -= deltaAngle
      theta = this.endAngle
    } else {
      this.startAngle -= deltaAngle
      theta = this.startAngle
    }

    const sinPiFactor = Math.sin(C.PI * this.tick / MAX_TICKS)
    const sinTwoPiFactor = Math.sin(C.TWO_PI * this.tick / MAX_TICKS)

    const movingPoint = this.ellipse.getPoint(theta)
    const centrePoint = new THREE.Vector2(this.cx, this.cy)
    const r = movingPoint.distanceTo(centrePoint)
    const rVarying = r * sinPiFactor

    // http://labman.phys.utk.edu/phys221core/modules/m11/traveling_waves.html
    // y(x,t) = A sin(kx - ωt + φ)
    // Here k is the wave number, k = 2π/λ,
    // and ω = 2π/T = 2πf is the angular frequency of the wave.
    // φ is called the phase constant.

    // const A = 0.2 * Math.abs(sinTwoPiFactor)
    const A = 0.25 * sinTwoPiFactor * sinTwoPiFactor
    // const lambda = rVarying * (4 - 3 * Math.abs(Math.sin(C.TWO_PI * this.tick / MAX_TICKS)))
    // const lambda = rVarying * (4 - 3 * Math.abs(sinTwoPiFactor))
    // const lambda = 2 // rVarying * (4 - 3.2 * sinTwoPiFactor * sinTwoPiFactor)
    // const lambda = this.ry * 0.9 // rVarying * (4 - 3.2 * sinTwoPiFactor * sinTwoPiFactor)
    // const lambda = this.r - this.r * 0.1 * sinTwoPiFactor * sinTwoPiFactor
    const lambda = this.ry - 0.5 * sinTwoPiFactor * sinTwoPiFactor
    const k = C.TWO_PI / lambda
    const f = 10
    const omega = C.TWO_PI * f
    const t = this.tick / MAX_TICKS
    const dx = rVarying / TRAVELLING_WAVE_POINT_COUNT
    const travellingWavePoints = U.range(TRAVELLING_WAVE_POINT_COUNT + 1).map(n => {
      const x = n * dx
      const y = A * Math.sin(k * x + omega * t)
      return new THREE.Vector2(x, y)
    })

    const translationToMovingPoint = new THREE.Vector2().subVectors(movingPoint, travellingWavePoints[0])
    const transformedTravellingWavePoints = travellingWavePoints.map(pt =>
      pt.add(translationToMovingPoint).rotateAround(movingPoint, C.PI + theta))

    const ellipsePoints = this.ellipse.getPoints(this.startAngle, this.endAngle, ELLIPSE_POINT_COUNT)

    const combinedPoints = this.combineEllipseAndTravellingWavePoints(
      ellipsePoints,
      transformedTravellingWavePoints
    )

    // growing: this.endAngle goes from -90 to -450
    // shrinking: this.startAngle goes from 270 to -90
    const cycleComplete = this.growing
      ? this.endAngle < THREE.MathUtils.degToRad(-450)
      : this.startAngle < THREE.MathUtils.degToRad(-90)

    if (cycleComplete) {
      this.reset(!this.growing)
    }

    return [combinedPoints]
  }

  reset(growing) {
    this.growing = growing
    if (this.growing) {
      this.startAngle = THREE.MathUtils.degToRad(-90)
      this.endAngle = THREE.MathUtils.degToRad(-90)
    } else {
      this.startAngle = THREE.MathUtils.degToRad(270)
      this.endAngle = THREE.MathUtils.degToRad(-90)
    }
    this.tick = 0
  }
}
