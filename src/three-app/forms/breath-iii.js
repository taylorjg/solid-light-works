import * as THREE from 'three'
import { Line } from '../line'
import * as U from '../utils'
import * as C from '../constants'
import { newtonsMethod } from '../newtons-method'

// Parametric equation of an ellipse:
// x = a * cos(t)
// y = b * sin(t)

// Parametric equation of a travelling wave:
// x = t
// y = a * sin(k * t - wt + phi)

// Parametric equation of a travelling wave rotated ccw by theta:
// x = t * cos(theta) - a * sin(k * t - wt) * sin(theta)
// y = t * sin(theta) + a * sin(k * t - wt) * cos(theta)
// (see https://math.stackexchange.com/questions/245859/rotating-parametric-curve)

const parametricEllipseX = rx =>
  t => rx * Math.cos(t)

const parametricEllipseY = ry =>
  t => ry * Math.sin(t)

const parametricTravellingWaveX = xoffset =>
  t => t + xoffset

const parametricTravellingWaveY = (a, k, wt, phi) =>
  t => a * Math.sin(k * t - wt + phi)

// The following online tool was very useful for finding the derivatives:
// https://www.symbolab.com/solver/derivative-calculator

const parametricEllipseXDerivative = rx =>
  t => -rx * Math.sin(t)

const parametricEllipseYDerivative = ry =>
  t => ry * Math.cos(t)

const parametricTravellingWaveXDerivative = () =>
  t => 1

const parametricTravellingWaveYDerivative = (a, k, wt, phi) =>
  t => a * Math.cos(k * t - wt + phi) * k

const ELLIPSE_POINT_COUNT = 100
const TRAVELLING_WAVE_POINT_COUNT = 100

const POINT_MESH_COLOURS = [
  0xff0000,
  0x00ff00,
  0x0000ff,
  0xffff00
]

export class BreathIIIForm {

  constructor(width, height) {
    this.width = width
    this.height = height
    this.waveLength = width * 3 / 4
    // this.rx = width / 6
    // this.ry = width / 7
    this.rx = width / 4
    this.ry = width / 5
    this.tick = 0
    this.pointMeshes = undefined
  }

  createPointMeshes(tempScene) {
    if (!this.pointMeshes) {
      this.pointMeshes = U.range(4).map((_, index) => {
        const pointGeometry = new THREE.CircleBufferGeometry(C.SCREEN_IMAGE_LINE_THICKNESS, 32)
        const pointMaterial = new THREE.MeshBasicMaterial({ color: POINT_MESH_COLOURS[index] })
        const pointMesh = new THREE.Mesh(pointGeometry, pointMaterial)
        pointMesh.visible = false
        pointMesh.renderOrder = 1
        tempScene.add(pointMesh)
        return pointMesh
      })
    }
  }

  // getEllipsePoints() {
  //   const deltaAngle = C.TWO_PI / ELLIPSE_POINT_COUNT
  //   const ellipsePoints = U.range(ELLIPSE_POINT_COUNT + 1).map(n => {
  //     let t = n * deltaAngle
  //     let x = parametricEllipseX(this.rx)(t)
  //     let y = parametricEllipseY(this.ry)(t)
  //     return new THREE.Vector2(x, y)
  //   })
  //   return ellipsePoints
  // }

  // getTravellingWavePoints() {
  //   const a = this.height / 2
  //   const k = C.TWO_PI / this.waveLength
  //   const f = 1
  //   const omega = C.TWO_PI * f
  //   const speed = 0.0001
  //   const wt = omega * this.tick * speed
  //   const phi = 0
  //   const dx = this.width / TRAVELLING_WAVE_POINT_COUNT
  //   const travellingWavePoints = U.range(TRAVELLING_WAVE_POINT_COUNT + 1).map(n => {
  //     const t = n * dx
  //     const x = parametricTravellingWaveX()(t)
  //     const y = parametricTravellingWaveY(a, k, wt, phi)(t)
  //     return new THREE.Vector2(x - this.width / 2, y)
  //   })
  //   return travellingWavePoints
  // }

  getLines(tempScene) {
    // const ellipsePoints = this.getEllipsePoints()
    // const travellingWavePoints = this.getTravellingWavePoints()

    const xoffset = -this.width / 2

    const deltaAngle = C.TWO_PI / ELLIPSE_POINT_COUNT
    const ellipsePoints = U.range(ELLIPSE_POINT_COUNT + 1).map(n => {
      let t = n * deltaAngle
      let x = parametricEllipseX(this.rx)(t)
      let y = parametricEllipseY(this.ry)(t)
      return new THREE.Vector2(x, y)
    })

    const a = this.height / 2
    const k = C.TWO_PI / this.waveLength
    const f = 1
    const omega = C.TWO_PI * f
    const speed = 0.0001
    const wt = omega * this.tick * speed
    const phi = 0 // THREE.MathUtils.degToRad(30)
    const dx = this.width / TRAVELLING_WAVE_POINT_COUNT
    const travellingWavePoints = U.range(TRAVELLING_WAVE_POINT_COUNT + 1).map(n => {
      const t = n * dx
      const x = parametricTravellingWaveX(xoffset)(t)
      const y = parametricTravellingWaveY(a, k, wt, phi)(t)
      return new THREE.Vector2(x, y)
    })

    // const ellipseAngles = U.range(4).map(n => n * C.HALF_PI + C.QUARTER_PI)
    const ellipseAngles = [
      THREE.MathUtils.degToRad(0 + 45),
      THREE.MathUtils.degToRad(90 + 45),
      THREE.MathUtils.degToRad(180 + 45),
      THREE.MathUtils.degToRad(270 + 45)
    ]

    const intersections = ellipseAngles.map(ellipseAngle => {
      const t1e = ellipseAngle
      const t2e = parametricEllipseX(this.rx)(t1e) - xoffset
      try {
        return newtonsMethod(
          parametricEllipseX(this.rx),
          parametricEllipseY(this.ry),
          parametricTravellingWaveX(xoffset),
          parametricTravellingWaveY(a, k, wt, phi),
          parametricEllipseXDerivative(this.rx),
          parametricEllipseYDerivative(this.ry),
          parametricTravellingWaveXDerivative(),
          parametricTravellingWaveYDerivative(a, k, wt, phi),
          t1e,
          t2e)
      } catch {
        return undefined
      }
    })
    this.createPointMeshes(tempScene)
    intersections.forEach((intersection, index) => {
      const pointMesh = this.pointMeshes[index]
      if (intersection) {
        pointMesh.position.x = parametricEllipseX(this.rx)(intersection.t1)
        pointMesh.position.y = parametricEllipseY(this.ry)(intersection.t1)
        pointMesh.visible = true
      } else {
        pointMesh.visible = false
      }
    })

    const lines = [ellipsePoints, travellingWavePoints].map(points => new Line(points))
    this.tick++
    return lines
  }
}
