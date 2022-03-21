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

// combinePoints(ellipsePoints, travellingWavePoints) {
//   const travellingWavePointsTail = travellingWavePoints.slice(1)
//   return this.growing
//     ? ellipsePoints.concat(travellingWavePointsTail)
//     : travellingWavePointsTail.reverse().concat(ellipsePoints)
// }

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

    // The points where the travelling wave intersects with the ellipse are changing
    // all the time which makes it difficult to decide what the initial guesses should
    // be when invoking Newton's Method. Therefore, I'm using a scattergun approach
    // i.e. 45 degree intervals covering the whole perimeter of the ellipse. I then need
    // to de-dup the results and then sort them in left-to-right order.
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

    const getEllipseSegmentPoints = (angle1, angle2) => {
      const normaliseAngle = angle => {
        if (angle < 0) return C.TWO_PI + angle
        if (angle > C.TWO_PI) return angle - C.TWO_PI
        return angle
      }
      const normalisedAngles = [angle1, angle2].map(normaliseAngle)
      const minAngle = Math.min(...normalisedAngles)
      const maxAngle = Math.max(...normalisedAngles)
      const pointCount = ELLIPSE_POINT_COUNT / 2
      const deltaAngle = (maxAngle - minAngle) / pointCount
      return U.range(pointCount + 1).map(n => {
        const t = minAngle + n * deltaAngle
        const x = parametricEllipseXFn(t)
        const y = parametricEllipseYFn(t)
        return new THREE.Vector2(x, y)
      })
    }

    const getTravellingWaveSegmentPoints = (startX, endX) => {
      const pointCount = TRAVELLING_WAVE_POINT_COUNT / 2
      const deltaX = (endX - startX) / pointCount
      return U.range(pointCount + 1).map(n => {
        const t = startX + n * deltaX
        const x = parametricTravellingWaveXFn(t)
        const y = parametricTravellingWaveYFn(t)
        return new THREE.Vector2(x, y)
      })
    }

    if (finalIntersections.length === 1) {
      // ???
    }

    if (finalIntersections.length === 2) {

      const ellipsePoints1 = getEllipseSegmentPoints(finalIntersections[0].t1, finalIntersections[1].t1)

      const travellingWavePoints1 = getTravellingWaveSegmentPoints(0, finalIntersections[0].t2)
      const travellingWavePoints2 = getTravellingWaveSegmentPoints(finalIntersections[1].t2, this.width)

      const lines = [
        travellingWavePoints1, ellipsePoints1, travellingWavePoints2 // TODO: combine => line 1
      ].map(points => new Line(points))
      this.tick++
      return lines
    }

    if (finalIntersections.length === 3) {
      // ???
    }

    if (finalIntersections.length === 4) {

      const ellipsePoints1 = getEllipseSegmentPoints(finalIntersections[0].t1, finalIntersections[3].t1)
      const ellipsePoints2 = getEllipseSegmentPoints(finalIntersections[1].t1, finalIntersections[2].t1)

      const travellingWavePoints1 = getTravellingWaveSegmentPoints(0, finalIntersections[0].t2)
      const travellingWavePoints2 = getTravellingWaveSegmentPoints(finalIntersections[1].t2, finalIntersections[2].t2)
      const travellingWavePoints3 = getTravellingWaveSegmentPoints(finalIntersections[3].t2, this.width)

      const lines = [
        travellingWavePoints1, ellipsePoints1, travellingWavePoints3, // TODO: combine => line 1
        ellipsePoints2, travellingWavePoints2 // TODO: combine => line 2
      ].map(points => new Line(points))
      this.tick++
      return lines
    }

    const ellipsePoints = getEllipseSegmentPoints(0, C.TWO_PI)
    const travellingWavePoints = getTravellingWaveSegmentPoints(0, this.width)

    const lines = [ellipsePoints, travellingWavePoints].map(points => new Line(points))
    this.tick++
    return lines
  }
}
