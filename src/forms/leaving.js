import * as THREE from 'three'
import { Ellipse } from '../syntax/ellipse'
import * as U from '../utils'
import * as C from '../constants'

const ELLIPSE_POINT_COUNT = 100
const TRAVELLING_WAVE_POINT_COUNT = 50
const ROTATION_DELTA = C.PI / (180 * 60)
const DELTA_ANGLE = 15 * C.PI / 180
const ANGLE_OFFSET_THRESHOLD = 45 * C.PI / 180
const REVOLUTION_START = -C.HALF_PI
const REVOLUTION_END = REVOLUTION_START + C.TWO_PI

let currentRotationDelta = ROTATION_DELTA

export const setSpeed = multiplier => {
  currentRotationDelta = ROTATION_DELTA * multiplier
}

export class LeavingForm {

  constructor(projectorPosition, cx, cy, rx, ry, isInitiallyGrowing) {
    this.cx = cx
    this.cy = cy
    this.rx = rx
    this.ry = ry
    this.reset(isInitiallyGrowing)
    this.ellipse = new Ellipse(cx, cy, rx, ry)
    this.travellingWave = new THREE.CubicBezierCurve()
  }

  get shapeCount() {
    return 1
  }

  calculateSinusoidalDampingFactor(angle) {
    const dampingFactor = Math.pow(3 + (1 - Math.sin(angle % C.PI)) * 5, 2)
    // console.log(`angle: ${angle}; dampingFactor: ${dampingFactor}`)
    return dampingFactor
  }

  getCurrentAngle() {
    const offsetFromStartAngle = currentRotationDelta * this.tick
    const baseAngle = REVOLUTION_START + offsetFromStartAngle
    const totalTicks = C.TWO_PI / currentRotationDelta
    const sinWaveTicks = totalTicks / 48
    const x = C.TWO_PI * (this.tick % sinWaveTicks) / sinWaveTicks
    const sinx = Math.sin(x)
    const sinusoidalDampingFactor = this.calculateSinusoidalDampingFactor(offsetFromStartAngle)
    const sinusoidalOffset = sinx / sinusoidalDampingFactor
    const finalAngle = baseAngle - sinusoidalOffset
    // console.log(`tick: ${this.tick}; offsetFromStartAngle: ${offsetFromStartAngle}; totalTicks: ${totalTicks}; sinWaveTicks: ${sinWaveTicks}; x: ${x}; sinx: ${sinx}; sinusoidalDampingFactor: ${sinusoidalDampingFactor}; sinusoidalOffset: ${sinusoidalOffset}; baseAngle: ${baseAngle}; finalAngle: ${finalAngle}`)
    return finalAngle
  }

  getTravellingWaveControlPoints(currentAngle) {
    const startAngle = REVOLUTION_START
    const angleOffset = Math.abs(currentAngle - startAngle)
    const angleOffset2 = angleOffset < C.PI ? angleOffset : C.TWO_PI - angleOffset
    const normalisingFactor = 1 / ANGLE_OFFSET_THRESHOLD
    const alpha = angleOffset2 > ANGLE_OFFSET_THRESHOLD ? 1.0 : (angleOffset2 * normalisingFactor)
    const deltaAngle1 = currentAngle - DELTA_ANGLE * alpha
    const deltaAngle2 = currentAngle + DELTA_ANGLE * alpha
    const centrePoint = new THREE.Vector2(this.cx, this.cy)
    const deltaPoint1 = this.ellipse.getPoint(deltaAngle1)
    const deltaPoint2 = this.ellipse.getPoint(deltaAngle2)
    const startingPoint = this.ellipse.getPoint(currentAngle)
    const endingPoint = startingPoint.clone().lerp(centrePoint, alpha)
    const controlPoint1 = deltaPoint1.lerp(endingPoint, 0.25)
    const controlPoint2 = deltaPoint2.lerp(endingPoint, 0.75)
    return {
      startingPoint,
      controlPoint1,
      controlPoint2,
      endingPoint
    }
  }

  combineEllipseAndTravellingWave(ellipsePoints, travellingWavePoints) {
    const travellingWavePointsTail = travellingWavePoints.slice(1)
    return this.growing
      ? ellipsePoints.concat(travellingWavePointsTail)
      : travellingWavePointsTail.reverse().concat(ellipsePoints)
  }

  getTravellingWavePoints(currentAngle) {
    const {
      startingPoint,
      controlPoint1,
      controlPoint2,
      endingPoint
    } = this.getTravellingWaveControlPoints(currentAngle)
    if (controlPoint1.equals(controlPoint2)) {
      return U.repeat(TRAVELLING_WAVE_POINT_COUNT + 1, startingPoint)
    }
    this.travellingWave.v0.copy(startingPoint)
    this.travellingWave.v1.copy(controlPoint1)
    this.travellingWave.v2.copy(controlPoint2)
    this.travellingWave.v3.copy(endingPoint)
    return this.travellingWave.getPoints(TRAVELLING_WAVE_POINT_COUNT)
  }

  getUpdatedPoints() {
    const currentAngle = this.getCurrentAngle()
    this.tick++
    if (this.growing) {
      this.endAngle = currentAngle
    } else {
      this.startAngle = currentAngle
    }
    const revolutionComplete = (this.growing ? this.endAngle : this.startAngle) > REVOLUTION_END
    if (revolutionComplete) {
      this.reset(!this.growing)
    }
    const ellipsePoints = this.ellipse.getPoints(this.startAngle, this.endAngle, ELLIPSE_POINT_COUNT)
    const travellingWavePoints = this.getTravellingWavePoints(currentAngle)
    return [this.combineEllipseAndTravellingWave(ellipsePoints, travellingWavePoints)]
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
