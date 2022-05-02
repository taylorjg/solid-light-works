import * as THREE from 'three'
import { Line } from '../line'
import { linearRamps } from "../ramps"
import * as C from '../constants'
import * as U from '../utils'

const parametricEllipseX = rx =>
  t => rx * Math.cos(t)

const parametricEllipseY = ry =>
  t => ry * Math.sin(t)

const ELLIPSE_POINT_COUNT = 100

const CYCLE_TICKS = 10000

const SWIPE_ROTATION_BLOCKS = [
  { span: CYCLE_TICKS * 0.125, from: 0, to: -20 },
  { span: CYCLE_TICKS * 0.125, from: -20, to: 0 },
  { span: CYCLE_TICKS * 0.25, from: 0, to: 60 },
  { span: CYCLE_TICKS * 0.25, from: 60, to: 0 },
  { span: CYCLE_TICKS * 0.125, from: 0, to: -20 },
  { span: CYCLE_TICKS * 0.125, from: -20, to: 0 }
]

export class MeetingYouHalfwayForm {

  constructor(width, height) {
    this.width = width
    this.height = height

    this.swipeOffset = 0
    this.swipeRotationDegrees = 0
    this.tick = 0

    const ryMax = height / 2
    const ryMin = height / 4

    // B: slow expansion, fast contraction
    this.RY1_BLOCKS = [
      { span: CYCLE_TICKS * 0.22, from: ryMin, to: ryMax },
      { span: CYCLE_TICKS * 0.11, from: ryMax, to: ryMin },
      { span: CYCLE_TICKS * 0.22, from: ryMin, to: ryMax },
      { span: CYCLE_TICKS * 0.11, from: ryMax, to: ryMin },
      { span: CYCLE_TICKS * 0.22, from: ryMin, to: ryMax },
      { span: CYCLE_TICKS * 0.12, from: ryMax, to: ryMin }
    ]

    // A: slow contraction, fast expansion
    this.RY2_BLOCKS = [
      { span: CYCLE_TICKS * 0.22, from: ryMax, to: ryMin },
      { span: CYCLE_TICKS * 0.11, from: ryMin, to: ryMax },
      { span: CYCLE_TICKS * 0.22, from: ryMax, to: ryMin },
      { span: CYCLE_TICKS * 0.11, from: ryMin, to: ryMax },
      { span: CYCLE_TICKS * 0.22, from: ryMax, to: ryMin },
      { span: CYCLE_TICKS * 0.12, from: ryMin, to: ryMax }
    ]
  }

  getLines() {
    const modTick = this.tick % CYCLE_TICKS
    const ratio = modTick / CYCLE_TICKS

    const rx = this.width / 2
    const ry1 = linearRamps(this.RY1_BLOCKS, modTick)
    const ry2 = linearRamps(this.RY2_BLOCKS, modTick)
    this.swipeOffset = this.width / 4 * Math.sin(ratio * C.TWO_PI)
    this.swipeRotationDegrees = linearRamps(SWIPE_ROTATION_BLOCKS, modTick)

    const parametricEllipse1XFn = parametricEllipseX(rx)
    const parametricEllipse1YFn = parametricEllipseY(ry1)
    const parametricEllipse2XFn = parametricEllipseX(rx)
    const parametricEllipse2YFn = parametricEllipseY(ry2)

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

    const normal = new THREE.Vector3(1, 0, 0)
      .applyMatrix4(new THREE.Matrix4().makeRotationZ(THREE.MathUtils.degToRad(this.swipeRotationDegrees)))
    const constant = this.swipeOffset
    const wipeClippingPlane1 = new THREE.Plane(normal, constant)
    const wipeClippingPlane2 = wipeClippingPlane1.clone().negate()
    const line1 = new Line(ellipse1Points, { clippingPlanes: [wipeClippingPlane1] })
    const line2 = new Line(ellipse2Points, { clippingPlanes: [wipeClippingPlane2] })

    this.tick++

    const lines = [line1, line2]
    return lines
  }
}
