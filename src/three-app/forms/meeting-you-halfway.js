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
    const normal = new THREE.Vector3(1, 0, 0).applyMatrix4(new THREE.Matrix4().makeRotationZ(C.QUARTER_PI))
    this.plane1 = new THREE.Plane(normal)
    this.plane2 = this.plane1.clone().negate()
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

    const line1 = new Line(ellipse1Points, { plane: this.plane1 })
    const line2 = new Line(ellipse2Points, { plane: this.plane2 })

    this.tick++
    this.plane1.set(this.plane1.normal, this.plane1.constant + 0.001)
    this.plane2.set(this.plane2.normal, this.plane2.constant - 0.001)

    const lines = [line1, line2]
    return lines
  }
}
