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

const parametricTravellingWaveXDerivative = xoffset =>
  t => 1

const parametricTravellingWaveYDerivative = (a, k, wt, phi) =>
  t => a * Math.cos(k * t - wt + phi) * k

const ELLIPSE_POINT_COUNT = 100
const TRAVELLING_WAVE_POINT_COUNT = 100

const POINT_MESH_COLOURS = [
  new THREE.Color("red").getHex(),
  new THREE.Color("green").getHex(),
  new THREE.Color("blue").getHex(),
  new THREE.Color("yellow").getHex(),
  new THREE.Color("cyan").getHex(),
  new THREE.Color("purple").getHex(),
  new THREE.Color("orange").getHex(),
  new THREE.Color("pink").getHex()
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
      this.pointMeshes = POINT_MESH_COLOURS.map(color => {
        const pointGeometry = new THREE.CircleBufferGeometry(C.SCREEN_IMAGE_LINE_THICKNESS, 16)
        const pointMaterial = new THREE.MeshBasicMaterial({ color })
        const pointMesh = new THREE.Mesh(pointGeometry, pointMaterial)
        pointMesh.visible = false
        pointMesh.renderOrder = 1
        tempScene.add(pointMesh)
        return pointMesh
      })
    }
  }

  getLines(tempScene) {
    const parametricEllipseXFn = parametricEllipseX(this.rx)
    const parametricEllipseYFn = parametricEllipseY(this.ry)
    const parametricEllipseXDerivativeFn = parametricEllipseXDerivative(this.rx)
    const parametricEllipseYDerivativeFn = parametricEllipseYDerivative(this.ry)

    const deltaAngle = C.TWO_PI / ELLIPSE_POINT_COUNT
    const ellipsePoints = U.range(ELLIPSE_POINT_COUNT + 1).map(n => {
      const t = n * deltaAngle
      const x = parametricEllipseXFn(t)
      const y = parametricEllipseYFn(t)
      return new THREE.Vector2(x, y)
    })

    const xoffset = -this.width / 2
    const a = this.height / 2
    const k = C.TWO_PI / this.waveLength
    const f = 1
    const omega = C.TWO_PI * f
    const speed = 0.0001
    const wt = omega * this.tick * speed
    const phi = THREE.MathUtils.degToRad(30)

    const parametricTravellingWaveXFn = parametricTravellingWaveX(xoffset)
    const parametricTravellingWaveYFn = parametricTravellingWaveY(a, k, wt, phi)
    const parametricTravellingWaveXDerivativeFn = parametricTravellingWaveXDerivative(xoffset)
    const parametricTravellingWaveYDerivativeFn = parametricTravellingWaveYDerivative(a, k, wt, phi)

    const dt = this.width / TRAVELLING_WAVE_POINT_COUNT
    const travellingWavePoints = U.range(TRAVELLING_WAVE_POINT_COUNT + 1).map(n => {
      const t = n * dt
      const x = parametricTravellingWaveXFn(t)
      const y = parametricTravellingWaveYFn(t)
      return new THREE.Vector2(x, y)
    })

    // I'm not really sure how to come up with good initial guesses for finding
    // the intersections so I'm using a scattergun approach. We'll use these angles
    // to help calculate initial guesses for several invocations of Newton's Method
    // and then de-dup the results.
    const ellipseAngles = U.range(8).map(n => n * C.QUARTER_PI)

    const intersections = ellipseAngles.map(ellipseAngle => {
      const t1Guess = ellipseAngle
      const t2Guess = parametricEllipseXFn(t1Guess) - xoffset
      try {
        return newtonsMethod(
          parametricEllipseXFn,
          parametricEllipseYFn,
          parametricTravellingWaveXFn,
          parametricTravellingWaveYFn,
          parametricEllipseXDerivativeFn,
          parametricEllipseYDerivativeFn,
          parametricTravellingWaveXDerivativeFn,
          parametricTravellingWaveYDerivativeFn,
          t1Guess,
          t2Guess)
      } catch {
        return undefined
      }
    })

    const truthyIntersections = intersections.filter(Boolean)
    const finalIntersections = []
    for (const intersection1 of truthyIntersections) {
      const isDuplicate = finalIntersections.some(intersection2 => {
        const t2Diff = Math.abs(intersection1.t2 - intersection2.t2)
        return t2Diff < 0.01
      })
      if (!isDuplicate) {
        finalIntersections.push(intersection1)
      }
    }
    finalIntersections.sort((a, b) => a.t2 - b.t2)
    this.createPointMeshes(tempScene)
    for (const pointMesh of this.pointMeshes) {
      pointMesh.visible = false
    }

    finalIntersections.forEach((intersection, index) => {
      const pointMesh = this.pointMeshes[index]
      if (intersection) {
        pointMesh.position.x = parametricEllipseXFn(intersection.t1)
        pointMesh.position.y = parametricEllipseYFn(intersection.t1)
        pointMesh.visible = true
      }
    })

    const lines = [ellipsePoints, travellingWavePoints].map(points => new Line(points))
    this.tick++
    return lines
  }
}
