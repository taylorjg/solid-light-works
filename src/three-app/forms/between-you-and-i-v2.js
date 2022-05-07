import * as THREE from 'three'
import { Line } from '../line'
import * as C from '../constants'
import * as U from '../utils'

const parametricEllipseX = rx =>
  t => rx * Math.cos(t)

const parametricEllipseY = ry =>
  t => ry * Math.sin(t)

const parametricTravellingWaveX = xoffset =>
  t => t + xoffset

const parametricTravellingWaveY = (A, k, ωt, φ) =>
  t => A * Math.sin(k * t - ωt + φ)

// const parametricLineX = (x0, a) =>
//   t => x0 + a * t

// const parametricLineY = (y0, b) =>
//   t => y0 + b * t

const ELLIPSE_POINT_COUNT = 100
const TRAVELLING_WAVE_POINT_COUNT = 100
const MAX_TICKS = 10000

export class BetweenYouAndIFormV2 {

  constructor(width, height, initiallyWipingInEllipse) {
    this.width = width
    this.height = height
    this.rx = width / 2
    this.ry = height / 2
    this.tick = 0
    this.wipingInEllipse = initiallyWipingInEllipse
  }

  getEllipsePoints(tickRatio) {
    const ry = this.ry - this.ry * 0.9 * Math.sin(C.PI * tickRatio)
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
    const xoffset = -this.width / 2 - C.SCREEN_IMAGE_LINE_THICKNESS
    const Δx = (this.width + C.SCREEN_IMAGE_LINE_THICKNESS * 2) / TRAVELLING_WAVE_POINT_COUNT
    return U.range(TRAVELLING_WAVE_POINT_COUNT + 1).map(n => {
      const t = n * Δx
      const x = parametricTravellingWaveX(xoffset)(t)
      const y = -parametricTravellingWaveY(this.ry * 0.9, k, -ωt, 0)(t)
      return new THREE.Vector2(x, y)
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
    const constant = this.width / 2 + C.SCREEN_IMAGE_LINE_THICKNESS - tickRatio * this.width
    const wipeClippingPlane1 = new THREE.Plane(normal, constant)
    const wipeClippingPlane2 = wipeClippingPlane1.clone().negate()
    const topClippingPlane = new THREE.Plane(new THREE.Vector3(0, -1, 0), this.height / 2)
    const bottomClippingPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), this.height / 2)
    const leftClippingPlane = new THREE.Plane(new THREE.Vector3(1, 0, 0), this.width / 2)
    const rightClippingPlane = new THREE.Plane(new THREE.Vector3(-1, 0, 0), this.width / 2)
    const ellipsePoints = this.getEllipsePoints(tickRatio)
    const travellingWavePoints = this.getTravellingWavePoints(tickRatio)
    const straightLinePoints = this.getStraightLinePoints(tickRatio)
    const ellipseLine = new Line(ellipsePoints, { clippingPlanes: [this.wipingInEllipse ? wipeClippingPlane1 : wipeClippingPlane2] })
    const travellingWaveLine = new Line(travellingWavePoints, { clippingPlanes: [this.wipingInEllipse ? wipeClippingPlane2 : wipeClippingPlane1, leftClippingPlane, rightClippingPlane] })
    const straightLine = new Line(straightLinePoints, { clippingPlanes: [this.wipingInEllipse ? wipeClippingPlane2 : wipeClippingPlane1, topClippingPlane, bottomClippingPlane, leftClippingPlane, rightClippingPlane] })
    const lines = [ellipseLine, travellingWaveLine, straightLine]
    this.tick++
    if (this.tick > MAX_TICKS) {
      this.toggleWipeMode()
    }
    return lines
  }

  toggleWipeMode() {
    this.tick = 0
    this.wipingInEllipse = !this.wipingInEllipse
  }
}
