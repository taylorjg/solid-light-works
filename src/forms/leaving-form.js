import * as THREE from 'three'
import { EllipseCurve } from '../ellipse-curve'
import * as U from '../utils'

const ELLIPSE_POINT_COUNT = 100
const WIPE_POINT_COUNT = 50
const ROTATION_DELTA = Math.PI / (180 * 60)
const DELTA_ANGLE = 15 * Math.PI / 180
const ANGLE_OFFSET_THRESHOLD = 45 * Math.PI / 180

const TWO_PI = Math.PI * 2
const HALF_PI = Math.PI / 2
const REVOLUTION_START = -HALF_PI
const REVOLUTION_END = REVOLUTION_START + TWO_PI

let currentRotationDelta = ROTATION_DELTA

export const setSpeed = multiplier => {
  currentRotationDelta = ROTATION_DELTA * multiplier
}

export class LeavingForm {

  constructor(cx, cy, rx, ry, isInitiallyGrowing) {
    this.cx = cx
    this.cy = cy
    this.rx = rx
    this.ry = ry
    this.reset(isInitiallyGrowing)
    this.ellipseCurve = new EllipseCurve(cx, cy, rx, ry)
    this.wipeCurve = new THREE.CubicBezierCurve()
  }

  calculateSinusoidalDampingFactor(angle) {
    const dampingFactor = Math.pow(3 + (1 - Math.sin(angle % Math.PI)) * 5, 2)
    // console.log(`angle: ${angle}; dampingFactor: ${dampingFactor}`)
    return dampingFactor
  }

  getCurrentAngle() {
    const offsetFromStartAngle = currentRotationDelta * this.tick
    const baseAngle = REVOLUTION_START + offsetFromStartAngle
    const totalTicks = TWO_PI / currentRotationDelta
    const sinWaveTicks = totalTicks / 48
    const x = TWO_PI * (this.tick % sinWaveTicks) / sinWaveTicks
    const sinx = Math.sin(x)
    const sinusoidalDampingFactor = this.calculateSinusoidalDampingFactor(offsetFromStartAngle)
    const sinusoidalOffset = sinx / sinusoidalDampingFactor
    const finalAngle = baseAngle - sinusoidalOffset
    // console.log(`tick: ${this.tick}; offsetFromStartAngle: ${offsetFromStartAngle}; totalTicks: ${totalTicks}; sinWaveTicks: ${sinWaveTicks}; x: ${x}; sinx: ${sinx}; sinusoidalDampingFactor: ${sinusoidalDampingFactor}; sinusoidalOffset: ${sinusoidalOffset}; baseAngle: ${baseAngle}; finalAngle: ${finalAngle}`)
    return finalAngle
  }

  getWipeControlPoints(currentAngle) {
    const startAngle = REVOLUTION_START
    const angleOffset = Math.abs(currentAngle - startAngle)
    const angleOffset2 = angleOffset < Math.PI ? angleOffset : TWO_PI - angleOffset
    const normalisingFactor = 1 / ANGLE_OFFSET_THRESHOLD
    const alpha = angleOffset2 > ANGLE_OFFSET_THRESHOLD ? 1.0 : (angleOffset2 * normalisingFactor)
    const deltaAngle1 = currentAngle - DELTA_ANGLE * alpha
    const deltaAngle2 = currentAngle + DELTA_ANGLE * alpha
    const centrePoint = new THREE.Vector2(this.cx, this.cy)
    const deltaPoint1 = this.ellipseCurve.getPoint(deltaAngle1)
    const deltaPoint2 = this.ellipseCurve.getPoint(deltaAngle2)
    const startingPoint = this.ellipseCurve.getPoint(currentAngle)
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

  combineEllipseAndWipe(ellipsePoints, wipePoints) {
    const wipePointsTail = wipePoints.slice(1)
    return this.growing
      ? ellipsePoints.concat(wipePointsTail)
      : wipePointsTail.reverse().concat(ellipsePoints)
  }

  getWipePoints(currentAngle) {
    const {
      startingPoint,
      controlPoint1,
      controlPoint2,
      endingPoint
    } = this.getWipeControlPoints(currentAngle)
    if (controlPoint1.equals(controlPoint2)) {
      return U.repeat(WIPE_POINT_COUNT + 1, startingPoint)
    }
    this.wipeCurve.v0.copy(startingPoint)
    this.wipeCurve.v1.copy(controlPoint1)
    this.wipeCurve.v2.copy(controlPoint2)
    this.wipeCurve.v3.copy(endingPoint)
    return this.wipeCurve.getPoints(WIPE_POINT_COUNT)
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
    const ellipsePoints = this.ellipseCurve.getPoints(this.startAngle, this.endAngle, ELLIPSE_POINT_COUNT)
    const wipePoints = this.getWipePoints(currentAngle)
    return [this.combineEllipseAndWipe(ellipsePoints, wipePoints)]
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
