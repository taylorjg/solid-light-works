import * as THREE from 'three'
import { Line } from '../line'
import { newtonsMethod } from '../newtons-method'
import * as U from '../utils'
import * as C from '../constants'

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
    this.ry = width / 6
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
    const BREATH_CYCLE_TICKS = 2000
    const rx = this.ry + 0.25 * Math.sin(C.PI / BREATH_CYCLE_TICKS * (this.tick % BREATH_CYCLE_TICKS))

    const parametricEllipseXFn = parametricEllipseX(rx)
    const parametricEllipseYFn = parametricEllipseY(this.ry)
    const parametricEllipseXDerivativeFn = parametricEllipseXDerivative(rx)
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

    const candidateIntersections = ellipseAngles.map(ellipseAngle => {
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

    const truthyIntersections = candidateIntersections.filter(Boolean)
    const intersections = []
    for (const intersection of truthyIntersections) {
      const duplicateIndex = intersections.findIndex(({ t2 }) => {
        const t2Diff = Math.abs(intersection.t2 - t2)
        return t2Diff < 0.01
      })
      if (duplicateIndex >= 0) {
        const duplicate = intersections[duplicateIndex]
        if (duplicate.t1 < 0 && intersection.t1 > 0) {
          intersections[duplicateIndex] = intersection
        }
      } else {
        intersections.push(intersection)
      }
    }
    intersections.sort((a, b) => a.t2 - b.t2)

    this.createPointMeshes(tempScene)
    for (const pointMesh of this.pointMeshes) {
      pointMesh.visible = false
    }

    intersections.forEach((intersection, index) => {
      const pointMesh = this.pointMeshes[index]
      if (intersection) {
        pointMesh.position.x = parametricEllipseXFn(intersection.t1)
        pointMesh.position.y = parametricEllipseYFn(intersection.t1)
        // pointMesh.visible = true
      }
    })

    const t1s = intersections.map(({ t1 }) => t1)
    console.log(`[${intersections.length}] tick: ${this.tick}, t1s: ${t1s.join(", ")}`)

    const getEllipseSegmentPoints = (angle1, angle2) => {
      const pointCount = ELLIPSE_POINT_COUNT
      const deltaAngle = (angle2 - angle1) / pointCount
      return U.range(pointCount + 1).map(n => {
        const t = angle1 + n * deltaAngle
        const x = parametricEllipseXFn(t)
        const y = parametricEllipseYFn(t)
        return new THREE.Vector2(x, y)
      })
    }

    const getTravellingWaveSegmentPoints = (startX, endX) => {
      const pointCount = TRAVELLING_WAVE_POINT_COUNT
      const deltaX = (endX - startX) / pointCount
      return U.range(pointCount + 1).map(n => {
        const t = startX + n * deltaX
        const x = parametricTravellingWaveXFn(t)
        const y = parametricTravellingWaveYFn(t)
        return new THREE.Vector2(x, y)
      })
    }

    const isDownSlope = (intersection1, intersection2) => {
      const y1 = parametricTravellingWaveYFn(intersection1.t2)
      const y2 = parametricTravellingWaveYFn(intersection2.t2)
      return y1 > y2
    }

    const normaliseAngle = angle => {
      return angle % C.TWO_PI
    }

    const negateAngle = angle => {
      return angle - C.TWO_PI
    }

    const smallCurve = (angle1, angle2) => {
      const diff = Math.abs(angle1 - angle2)
      return diff > C.PI
        ? getEllipseSegmentPoints(angle1, negateAngle(angle2))
        : getEllipseSegmentPoints(angle1, angle2)
    }

    const cwCurve = (angle1, angle2) => {
      const normalisedAngle1 = normaliseAngle(angle1)
      const normalisedAngle2 = normaliseAngle(angle2)
      return normalisedAngle1 > normalisedAngle2
        ? getEllipseSegmentPoints(negateAngle(normalisedAngle1), normalisedAngle2)
        : getEllipseSegmentPoints(normalisedAngle1, negateAngle(normalisedAngle2))
    }

    const ccwCurve = (angle1, angle2) => {
      const normalisedAngle1 = normaliseAngle(angle1)
      const normalisedAngle2 = normaliseAngle(angle2)
      return getEllipseSegmentPoints(normalisedAngle1, normalisedAngle2)
    }

    if (intersections.length === 2 || intersections.length === 3) {

      const ellipsePoints = isDownSlope(intersections[0], intersections[1])
        ? cwCurve(intersections[0].t1, intersections[1].t1)
        : ccwCurve(intersections[0].t1, intersections[1].t1)

      const travellingWavePoints1 = getTravellingWaveSegmentPoints(0, intersections[0].t2)
      const travellingWavePoints2 = getTravellingWaveSegmentPoints(intersections[1].t2, this.width)

      const line1 = U.combinePoints(travellingWavePoints1, ellipsePoints, travellingWavePoints2)
      const lines = [line1].map(points => new Line(points))
      this.tick++
      return lines
    }

    if (intersections.length === 4) {

      const ellipsePointsLeft = smallCurve(intersections[0].t1, intersections[1].t1)
      const ellipsePointsRight = smallCurve(intersections[2].t1, intersections[3].t1)

      const travellingWavePointsStart = getTravellingWaveSegmentPoints(0, intersections[0].t2)
      const travellingWavePointsMiddle = getTravellingWaveSegmentPoints(intersections[1].t2, intersections[2].t2)
      const travellingWavePointsEnd = getTravellingWaveSegmentPoints(intersections[3].t2, this.width)

      const linePoints1 = U.combinePoints(
        travellingWavePointsStart,
        ellipsePointsLeft,
        travellingWavePointsMiddle,
        ellipsePointsRight,
        travellingWavePointsEnd,
      )
      const line1 = new Line(linePoints1)
      const lines = [line1]

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
