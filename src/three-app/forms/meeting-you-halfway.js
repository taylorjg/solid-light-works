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

export class MeetingYouHalfwayForm {

  constructor(width, height) {
    this.width = width
    this.height = height
    this.tick = 0

    const swipeOffsetMax = width * 0.4
    const swipeOffsetMin = -swipeOffsetMax
    const ryMax = height / 2
    const ryMin = height / 4

    this.SWIPE_OFFSET_BLOCKS = [
      { span: CYCLE_TICKS * 0.25, from: 0, to: swipeOffsetMax },
      { span: CYCLE_TICKS * 0.5, from: swipeOffsetMax, to: swipeOffsetMin },
      { span: CYCLE_TICKS * 0.25, from: swipeOffsetMin, to: 0 }
    ]

    this.SWIPE_ROTATION_BLOCKS = [
      { span: CYCLE_TICKS * 0.125, from: 0, to: -20 },
      { span: CYCLE_TICKS * 0.125, from: -20, to: 0 },
      { span: CYCLE_TICKS * 0.25, from: 0, to: 60 },
      { span: CYCLE_TICKS * 0.25, from: 60, to: 0 },
      { span: CYCLE_TICKS * 0.125, from: 0, to: -20 },
      { span: CYCLE_TICKS * 0.125, from: -20, to: 0 }
    ]

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
    const swipeOffset = linearRamps(this.SWIPE_OFFSET_BLOCKS, this.tick)
    const swipeRotationDegrees = linearRamps(this.SWIPE_ROTATION_BLOCKS, this.tick)
    const swipeRotationRadians = THREE.MathUtils.degToRad(swipeRotationDegrees)

    const rx = this.width / 2
    const ry1 = linearRamps(this.RY1_BLOCKS, this.tick)
    const ry2 = linearRamps(this.RY2_BLOCKS, this.tick)

    const getEllipsePoints = ry => {
      const Δθ = C.TWO_PI / ELLIPSE_POINT_COUNT
      return U.range(ELLIPSE_POINT_COUNT + 1).map(n => {
        const t = n * Δθ
        const x = parametricEllipseX(rx)(t)
        const y = parametricEllipseY(ry)(t)
        return new THREE.Vector2(x, y)
      })
    }

    const ellipse1Points = getEllipsePoints(ry1)
    const ellipse2Points = getEllipsePoints(ry2)

    const rotationZ = new THREE.Matrix4().makeRotationZ(swipeRotationRadians)
    const normal = new THREE.Vector3(1, 0, 0).applyMatrix4(rotationZ)
    const constant = swipeOffset
    const wipeClippingPlane1 = new THREE.Plane(normal, constant)
    const wipeClippingPlane2 = wipeClippingPlane1.clone().negate()
    const line1 = new Line(ellipse1Points, { clippingPlanes: [wipeClippingPlane1] })
    const line2 = new Line(ellipse2Points, { clippingPlanes: [wipeClippingPlane2] })
    const lines = [line1, line2]

    this.tick++

    return lines
  }
}
