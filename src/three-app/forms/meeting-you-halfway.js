import * as THREE from 'three'
import { Line } from '../line'
import { parametricEllipseX, parametricEllipseY } from '../syntax/parametric-ellipse'
import { linearRamps } from "../ramps"
import * as C from '../constants'
import * as U from '../utils'

const MAX_TICKS = 25000
const CYCLE_DURATION_MS = C.TICK_DURATION_MS * MAX_TICKS
const ELLIPSE_POINT_COUNT = 100

export class MeetingYouHalfwayForm {

  constructor(width, height) {
    this.width = width
    this.height = height
    this.accumulatedDurationMs = 0

    const wipeOffsetMax = width * 0.4
    const wipeOffsetMin = -wipeOffsetMax
    const ryMax = height / 2 - C.LINE_THICKNESS / 2
    const ryMin = height / 4

    this.WIPE_OFFSET_BLOCKS = [
      { span: MAX_TICKS * 0.25, from: 0, to: wipeOffsetMax },
      { span: MAX_TICKS * 0.5, from: wipeOffsetMax, to: wipeOffsetMin },
      { span: MAX_TICKS * 0.25, from: wipeOffsetMin, to: 0 }
    ]

    this.WIPE_ROTATION_BLOCKS = [
      { span: MAX_TICKS * 0.125, from: 0, to: -20 },
      { span: MAX_TICKS * 0.125, from: -20, to: 0 },
      { span: MAX_TICKS * 0.25, from: 0, to: 60 },
      { span: MAX_TICKS * 0.25, from: 60, to: 0 },
      { span: MAX_TICKS * 0.125, from: 0, to: -20 },
      { span: MAX_TICKS * 0.125, from: -20, to: 0 }
    ]

    // B: slow expansion, fast contraction
    this.RY1_BLOCKS = [
      { span: MAX_TICKS * 0.22, from: ryMin, to: ryMax },
      { span: MAX_TICKS * 0.11, from: ryMax, to: ryMin },
      { span: MAX_TICKS * 0.22, from: ryMin, to: ryMax },
      { span: MAX_TICKS * 0.11, from: ryMax, to: ryMin },
      { span: MAX_TICKS * 0.22, from: ryMin, to: ryMax },
      { span: MAX_TICKS * 0.12, from: ryMax, to: ryMin }
    ]

    // A: slow contraction, fast expansion
    this.RY2_BLOCKS = [
      { span: MAX_TICKS * 0.22, from: ryMax, to: ryMin },
      { span: MAX_TICKS * 0.11, from: ryMin, to: ryMax },
      { span: MAX_TICKS * 0.22, from: ryMax, to: ryMin },
      { span: MAX_TICKS * 0.11, from: ryMin, to: ryMax },
      { span: MAX_TICKS * 0.22, from: ryMax, to: ryMin },
      { span: MAX_TICKS * 0.12, from: ryMin, to: ryMax }
    ]
  }

  getFootprintData(deltaMs) {
    this.accumulatedDurationMs += deltaMs
    const tick = this.accumulatedDurationMs / C.TICK_DURATION_MS

    const wipeOffset = linearRamps(this.WIPE_OFFSET_BLOCKS, tick)
    const wipeRotationDegrees = linearRamps(this.WIPE_ROTATION_BLOCKS, tick)
    const wipeRotationRadians = THREE.MathUtils.degToRad(wipeRotationDegrees)

    const rx = this.width / 2 - C.LINE_THICKNESS / 2
    const ry1 = linearRamps(this.RY1_BLOCKS, tick)
    const ry2 = linearRamps(this.RY2_BLOCKS, tick)

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

    const rotationZ = new THREE.Matrix4().makeRotationZ(wipeRotationRadians)
    const normal = new THREE.Vector3(1, 0, 0).applyMatrix4(rotationZ)
    const constant = wipeOffset
    const wipeClippingPlane1 = new THREE.Plane(normal, constant)
    const wipeClippingPlane2 = wipeClippingPlane1.clone().negate()

    const line1 = new Line(ellipse1Points, { clippingPlanes: [wipeClippingPlane1] })
    const line2 = new Line(ellipse2Points, { clippingPlanes: [wipeClippingPlane2] })
    const lines = [line1, line2]

    const footprintData = { lines }

    if (this.accumulatedDurationMs > CYCLE_DURATION_MS) {
      this.accumulatedDurationMs = 0
    }

    return footprintData
  }
}
