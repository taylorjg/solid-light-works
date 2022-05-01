import * as THREE from 'three'
import { Line } from '../line'
import * as C from '../constants'
import * as U from '../utils'

const parametricEllipseX = rx =>
  t => rx * Math.cos(t)

const parametricEllipseY = ry =>
  t => ry * Math.sin(t)

const ELLIPSE_POINT_COUNT = 100

export class MeetingYouHalfwayForm {

  constructor(width, height) {
    this.width = width
    this.height = height
    this.rx1 = width / 2
    this.ry1 = height * 0.45
    this.rx2 = width / 2
    this.ry2 = height * 0.2
    this.swipeOffset = 0
    this.swipeRotationDegrees = 0
    this.tick = 0
  }

  getLines() {
    const parametricEllipse1XFn = parametricEllipseX(this.rx1)
    const parametricEllipse1YFn = parametricEllipseY(this.ry1)
    const parametricEllipse2XFn = parametricEllipseX(this.rx2)
    const parametricEllipse2YFn = parametricEllipseY(this.ry2)

    const getEllipse1Points = (θ1, θ2) => {
      const pointCount = ELLIPSE_POINT_COUNT
      const Δθ = (θ2 - θ1) / pointCount
      return U.range(pointCount + 1).map(n => {
        const t = θ1 + n * Δθ
        const x = parametricEllipse1XFn(t)
        const y = parametricEllipse1YFn(t)
        return new THREE.Vector2(x, y)
      })
    }

    const getEllipse2Points = (θ1, θ2) => {
      const pointCount = ELLIPSE_POINT_COUNT
      const Δθ = (θ2 - θ1) / pointCount
      return U.range(pointCount + 1).map(n => {
        const t = θ1 + n * Δθ
        const x = parametricEllipse2XFn(t)
        const y = parametricEllipse2YFn(t)
        return new THREE.Vector2(x, y)
      })
    }

    const ellipse1Points = getEllipse1Points(0, C.TWO_PI)
    const ellipse2Points = getEllipse2Points(0, C.TWO_PI)

    const swipeRotationRadians = THREE.MathUtils.degToRad(this.swipeRotationDegrees)
    const swipeRotationZ = new THREE.Matrix4().makeRotationZ(swipeRotationRadians)
    const planeNormal = new THREE.Vector3(1, 0, 0).applyMatrix4(swipeRotationZ)
    const plane1 = new THREE.Plane(planeNormal, this.swipeOffset)
    const plane2 = plane1.clone().negate()
    const line1 = new Line(ellipse1Points, { plane: plane1 })
    const line2 = new Line(ellipse2Points, { plane: plane2 })

    this.tick++
    const CYCLE_TICKS = 10000
    this.swipeOffset = this.width / 4 * Math.sin((this.tick % CYCLE_TICKS) / CYCLE_TICKS * C.TWO_PI)

    const lines = [line1, line2]
    return lines
  }
}
