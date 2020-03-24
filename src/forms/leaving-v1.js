import * as THREE from 'three'
import { Ellipse } from '../syntax/ellipse'
import * as U from '../utils'
import * as C from '../constants'

const MAX_TICKS = 10000
const ELLIPSE_POINT_COUNT = 100
const TRAVELLING_WAVE_POINT_COUNT = 50
const REVOLUTION_START = -C.HALF_PI
const REVOLUTION_END = REVOLUTION_START + C.TWO_PI

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

  // TODO:
  // * add a rotating radial line 
  // * add travelling wave
  // * combine travelling wave points with radial line points
  // - add ellipse
  // - start tinkering with the variable:
  //  - radial line: length
  //  - radial line: speed of rotation
  //  - travelling wave: A / amplitude
  //  - travelling wave: lambla / wavelength
  //  - travelling wave: omega / wave speed

  getUpdatedPoints() {

    if (this.isProjector) {
      return [U.repeat(TRAVELLING_WAVE_POINT_COUNT + 1, this.projectorPosition)]
    }

    const deltaAngle = C.TWO_PI / MAX_TICKS
    this.tick++

    let theta
    if (this.growing) {
      this.endAngle += deltaAngle
      theta = this.endAngle
    } else {
      this.startAngle += deltaAngle
      theta = this.startAngle
    }

    // const x = this.cx - this.rx * Math.cos(theta)
    // const y = this.cy + this.ry * Math.sin(theta)

    // const radialLineStartPoint = new THREE.Vector2(x, y)
    // const radialLineEndPoint = new THREE.Vector2(this.cx, this.cy)

    // const radialLinePoints = U.range(TRAVELLING_WAVE_POINT_COUNT + 1).map(n => {
    //   const alpha = n / TRAVELLING_WAVE_POINT_COUNT
    //   return new THREE.Vector2().lerpVectors(radialLineStartPoint, radialLineEndPoint, alpha)
    // })

    // const rxLocal = this.rx / 2
    // const ryLocal = this.ry / 2
    const rxLocal = this.rx * Math.sin(C.PI * this.tick / MAX_TICKS)
    const ryLocal = this.ry * Math.sin(C.PI * this.tick / MAX_TICKS)

    const drx = rxLocal / TRAVELLING_WAVE_POINT_COUNT
    const dry = ryLocal / TRAVELLING_WAVE_POINT_COUNT
    const radialLinePoints2 = U.range(TRAVELLING_WAVE_POINT_COUNT + 1).map(n => {
      const x = -(this.rx - n * drx) * Math.cos(theta)
      const y = (this.ry - n * dry) * Math.sin(theta)
      return new THREE.Vector2(x, y)
    })

    // http://labman.phys.utk.edu/phys221core/modules/m11/traveling_waves.html
    // y(x,t) = A sin(kx - ωt + φ)
    // Here k is the wave number, k = 2π/λ,
    // and ω = 2π/T = 2πf is the angular frequency of the wave.
    // φ is called the phase constant.

    // 0:   x4    0
    // 90:  x.5   3.5
    // 180: x1    3
    // 270: x.5   3.5
    // 360: x4    0

    // const A = 0.02
    const A = 0.25 * Math.abs(Math.sin(C.TWO_PI * this.tick / MAX_TICKS))
    // const lambda = rxLocal / 1.5
    // const lambda = rxLocal * 4 - (2 * rxLocal * Math.abs(Math.sin(C.TWO_PI * this.tick / MAX_TICKS)))
    const lambda = rxLocal * (4 - 3 * Math.abs(Math.sin(C.TWO_PI * this.tick / MAX_TICKS)))
    const k = C.TWO_PI / lambda
    const f = 1
    const omega = C.TWO_PI * f
    const phi = 0
    const t = this.tick / MAX_TICKS
    const dx = rxLocal / TRAVELLING_WAVE_POINT_COUNT
    const travellingWavePoints = U.range(TRAVELLING_WAVE_POINT_COUNT + 1).map(n => {
      const x = n * dx
      const y = A * Math.sin(k * x + omega * t + phi)
      return new THREE.Vector2(x, y)
    })

    const revolutionComplete = (this.growing ? this.endAngle : this.startAngle) > REVOLUTION_END
    if (revolutionComplete) {
      this.reset(!this.growing)
    }

    const points = travellingWavePoints.map((twp, index) => {
      // const rlp = radialLinePoints[index]
      const rlp = radialLinePoints2[index]
      // return new THREE.Vector2(rlp.x, rlp.y + twp.y)
      return new THREE.Vector2(this.cx + rlp.x, this.cy + rlp.y + twp.y)
      // return new THREE.Vector2(this.cx + rlp.x, this.cy + rlp.y)
    })

    // const px = radialLinePoints2[0].x
    // const py = radialLinePoints2[0].y + travellingWavePoints[0].y
    // // const x = -(this.rx - n * drx) * Math.cos(theta)
    // // const y = (this.ry - n * dry) * Math.sin(theta)
    // const ax = Math.acos(px/this.rx)
    // const ay = Math.acos(py/this.ry)
    // console.log(`ax: ${ax}; ay: ${ay}`)

    const ellipsePoints = this.ellipse.getPoints(this.startAngle, this.endAngle, ELLIPSE_POINT_COUNT)
    const combinedPoints = this.combineEllipseAndTravellingWavePoints(
      ellipsePoints,
      points
    )

    return [combinedPoints]
    // return [radialLinePoints]
    // return [travellingWavePoints]
    // return [points]
  }

  reset(growing) {
    this.growing = growing
    if (this.growing) {
      this.startAngle = REVOLUTION_START
      this.endAngle = REVOLUTION_START
    } else {
      this.startAngle = REVOLUTION_START
      this.endAngle = REVOLUTION_END
    }
    this.tick = 0
  }
}
