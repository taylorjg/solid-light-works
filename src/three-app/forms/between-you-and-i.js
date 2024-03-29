import * as THREE from 'three'
import { Line } from '../line'
import { parametricEllipseX, parametricEllipseY } from '../syntax/parametric-ellipse'
import { parametricTravellingWaveX, parametricTravellingWaveY } from '../syntax/parametric-travelling-wave'
import * as C from '../constants'
import * as U from '../utils'

const MAX_TICKS = 20000
const CYCLE_DURATION_MS = C.TICK_DURATION_MS * MAX_TICKS
const ELLIPSE_POINT_COUNT = 200
const TRAVELLING_WAVE_POINT_COUNT = 200

export class BetweenYouAndIForm {

  constructor(width, height, initiallyWipingInEllipse) {
    this.width = width
    this.height = height
    this.rx = width / 2 - C.LINE_THICKNESS / 2
    this.ry = height / 2 - C.LINE_THICKNESS / 2
    this.accumulatedDurationMs = 0
    this.wipingInEllipse = initiallyWipingInEllipse
  }

  getEllipsePoints(cycleRatio) {
    const ry = this.ry * 0.9 - this.ry * 0.7 * Math.sin(C.PI * cycleRatio)
    const Δθ = C.TWO_PI / ELLIPSE_POINT_COUNT
    return U.range(ELLIPSE_POINT_COUNT + 1).map(n => {
      const t = n * Δθ
      const x = parametricEllipseX(this.rx)(t)
      const y = parametricEllipseY(ry)(t)
      return new THREE.Vector2(x, y)
    })
  }

  getTravellingWavePoints(cycleRatio) {
    const λ = this.width
    const k = C.TWO_PI / λ
    const f = 1
    const ω = C.TWO_PI * f
    const ωt = ω * cycleRatio
    const xoffset = -this.width / 2
    const Δx = this.width / TRAVELLING_WAVE_POINT_COUNT
    return U.range(TRAVELLING_WAVE_POINT_COUNT + 1).map(n => {
      const t = n * Δx
      const x = parametricTravellingWaveX(xoffset)(t)
      const y = parametricTravellingWaveY(this.ry * 0.9, k, -ωt, 0)(t)
      return new THREE.Vector2(x, -y)
    })
  }

  getStraightLinePoints(cycleRatio) {
    const θ = THREE.MathUtils.degToRad(120) - C.PI * cycleRatio
    const px = this.width * Math.cos(θ)
    const py = this.height * Math.sin(θ)
    return [
      new THREE.Vector2(px, py),
      new THREE.Vector2(-px, -py)
    ]
  }

  getFootprintData(deltaMs) {
    this.accumulatedDurationMs += deltaMs
    const cycleRatio = this.accumulatedDurationMs / CYCLE_DURATION_MS

    const normal = new THREE.Vector3(1, 0, 0)
    const constant = this.width / 2 - cycleRatio * this.width
    const wipingOutClippingPlane = new THREE.Plane(normal, constant)
    const wipingInClippingPlane = wipingOutClippingPlane.clone().negate()
    const scene1WipeClippingPlane = this.wipingInEllipse ? wipingInClippingPlane : wipingOutClippingPlane
    const scene2WipeClippingPlane = this.wipingInEllipse ? wipingOutClippingPlane : wipingInClippingPlane
    const ellipsePoints = this.getEllipsePoints(cycleRatio)
    const travellingWavePoints = this.getTravellingWavePoints(cycleRatio)
    const straightLinePoints = this.getStraightLinePoints(cycleRatio)

    const ellipseLine = new Line(ellipsePoints, {
      clippingPlanes: [scene1WipeClippingPlane]
    })
    const travellingWaveLine = new Line(travellingWavePoints, {
      clippingPlanes: [scene2WipeClippingPlane],
      clipToFormBoundary: true
    })
    const straightLine = new Line(straightLinePoints, {
      clippingPlanes: [scene2WipeClippingPlane],
      clipToFormBoundary: true
    })

    const lines = [ellipseLine, travellingWaveLine, straightLine]

    const footprintData = { lines }

    if (this.accumulatedDurationMs > CYCLE_DURATION_MS) {
      this.toggleWipeMode()
    }

    return footprintData
  }

  toggleWipeMode() {
    this.accumulatedDurationMs = 0
    this.wipingInEllipse = !this.wipingInEllipse
  }
}
