import * as THREE from 'three'
import { Line } from '../line'
import { parametricEllipseX, parametricEllipseY } from '../syntax/parametric-ellipse'
import { parametricTravellingWaveX, parametricTravellingWaveY } from '../syntax/parametric-travelling-wave'
import * as C from '../constants'
import * as U from '../utils'

const ELLIPSE_POINT_COUNT = 200
const TRAVELLING_WAVE_POINT_COUNT = 200
const MAX_TICKS = 20000

export class BetweenYouAndIForm {

  constructor(width, height, initiallyWipingInEllipse) {
    this.width = width
    this.height = height
    this.rx = width / 2 - C.LINE_THICKNESS / 2
    this.ry = height / 2 - C.LINE_THICKNESS / 2
    this.tick = 0
    this.wipingInEllipse = initiallyWipingInEllipse
  }

  getEllipsePoints(tickRatio) {
    const ry = this.ry * 0.9 - this.ry * 0.7 * Math.sin(C.PI * tickRatio)
    const Δθ = C.TWO_PI / ELLIPSE_POINT_COUNT
    return U.range(ELLIPSE_POINT_COUNT + 1).map(n => {
      const t = n * Δθ
      const x = parametricEllipseX(this.rx)(t)
      const y = parametricEllipseY(ry)(t)
      return new THREE.Vector2(x, y)
    })
  }

  getTravellingWavePoints(tickRatio) {
    const λ = this.width
    const k = C.TWO_PI / λ
    const f = 1
    const ω = C.TWO_PI * f
    const ωt = ω * tickRatio
    const xoffset = -this.width / 2
    const Δx = this.width / TRAVELLING_WAVE_POINT_COUNT
    return U.range(TRAVELLING_WAVE_POINT_COUNT + 1).map(n => {
      const t = n * Δx
      const x = parametricTravellingWaveX(xoffset)(t)
      const y = parametricTravellingWaveY(this.ry * 0.9, k, -ωt, 0)(t)
      return new THREE.Vector2(x, -y)
    })
  }

  getStraightLinePoints(tickRatio) {
    const θ = THREE.MathUtils.degToRad(120) - C.PI * tickRatio
    const px = this.width * Math.cos(θ)
    const py = this.height * Math.sin(θ)
    return [
      new THREE.Vector2(px, py),
      new THREE.Vector2(-px, -py)
    ]
  }

  getLines() {
    const tickRatio = this.tick / MAX_TICKS
    const normal = new THREE.Vector3(1, 0, 0)
    const constant = this.width / 2 - tickRatio * this.width
    const wipingOutClippingPlane = new THREE.Plane(normal, constant)
    const wipingInClippingPlane = wipingOutClippingPlane.clone().negate()
    const scene1WipeClippingPlane = this.wipingInEllipse ? wipingInClippingPlane : wipingOutClippingPlane
    const scene2WipeClippingPlane = this.wipingInEllipse ? wipingOutClippingPlane : wipingInClippingPlane
    const ellipsePoints = this.getEllipsePoints(tickRatio)
    const travellingWavePoints = this.getTravellingWavePoints(tickRatio)
    const straightLinePoints = this.getStraightLinePoints(tickRatio)

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

    this.tick++
    if (this.tick > MAX_TICKS) {
      this.toggleWipeMode()
    }
    const lines = [ellipseLine, travellingWaveLine, straightLine]
    return lines
  }

  toggleWipeMode() {
    this.tick = 0
    this.wipingInEllipse = !this.wipingInEllipse
  }
}
