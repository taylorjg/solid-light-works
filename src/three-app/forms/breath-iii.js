import * as THREE from 'three'
import { Line } from '../line'
import {
  parametricEllipseX,
  parametricEllipseY,
  parametricEllipseXDerivative,
  parametricEllipseYDerivative
} from '../syntax/parametric-ellipse'
import {
  parametricTravellingWaveX,
  parametricTravellingWaveY,
  parametricTravellingWaveXDerivative,
  parametricTravellingWaveYDerivative
} from '../syntax/parametric-travelling-wave'
import { newtonsMethod } from '../newtons-method'
import * as C from '../constants'
import * as U from '../utils'

const ELLIPSE_POINT_COUNT = 100
const TRAVELLING_WAVE_POINT_COUNT = 100

const MAX_NUM_POINTS = 3 * TRAVELLING_WAVE_POINT_COUNT + 2 * ELLIPSE_POINT_COUNT + 1 + 2

export class BreathIIIForm {

  constructor(width, height) {
    this.width = width
    this.height = height
    this.waveLength = width * 3 / 4
    this.ry = width / 5
    this.tick = 8500
  }

  getFootprintData() {
    const BREATH_CYCLE_TICKS = 2000
    const rx = this.ry + 0.25 * Math.sin(C.PI / BREATH_CYCLE_TICKS * (this.tick % BREATH_CYCLE_TICKS))

    const parametricEllipseXFn = parametricEllipseX(rx)
    const parametricEllipseYFn = parametricEllipseY(this.ry)
    const parametricEllipseXDerivativeFn = parametricEllipseXDerivative(rx)
    const parametricEllipseYDerivativeFn = parametricEllipseYDerivative(this.ry)

    const xoffset = -this.width / 2
    const A = this.height / 2 - C.LINE_THICKNESS / 2
    const k = C.TWO_PI / this.waveLength
    const f = 1
    const ω = C.TWO_PI * f
    const speed = 0.0001
    const ωt = ω * this.tick * speed
    const φ = THREE.MathUtils.degToRad(30)

    const parametricTravellingWaveXFn = parametricTravellingWaveX(xoffset)
    const parametricTravellingWaveYFn = parametricTravellingWaveY(A, k, ωt, φ)
    const parametricTravellingWaveXDerivativeFn = parametricTravellingWaveXDerivative(xoffset)
    const parametricTravellingWaveYDerivativeFn = parametricTravellingWaveYDerivative(A, k, ωt, φ)

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
      const duplicateIndex = intersections.findIndex(({ t2 }) => U.isClose(intersection.t2, t2))
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

    const intersectionPoints = intersections.map(({ t1 }) => {
      const x = parametricEllipseXFn(t1)
      const y = parametricEllipseYFn(t1)
      return new THREE.Vector2(x, y)
    })

    const getEllipseSegmentPoints = (θ1, θ2) => {
      const pointCount = ELLIPSE_POINT_COUNT
      const Δθ = (θ2 - θ1) / pointCount
      return U.range(pointCount + 1).map(n => {
        const t = θ1 + n * Δθ
        const x = parametricEllipseXFn(t)
        const y = parametricEllipseYFn(t)
        return new THREE.Vector2(x, y)
      })
    }

    const getTravellingWaveSegmentPoints = (x1, x2) => {
      const pointCount = TRAVELLING_WAVE_POINT_COUNT
      const Δx = (x2 - x1) / pointCount
      return U.range(pointCount + 1).map(n => {
        const t = x1 + n * Δx
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

    const isTroughBelowEllipse = () => {
      const leftBound = -rx - xoffset
      const rightBound = +rx - xoffset
      const points = getTravellingWaveSegmentPoints(leftBound, rightBound)
      const minPoint = U.minBy(points, pt => pt.y)
      const maxPoint = U.maxBy(points, pt => pt.y)
      const absMinY = Math.abs(minPoint.y)
      const absMaxY = Math.abs(maxPoint.y)
      const troughBelowEllipse = absMinY > absMaxY
      return troughBelowEllipse
    }

    const commonLineOptions = { maxNumPoints: MAX_NUM_POINTS }

    if (intersections.length === 2 || intersections.length === 3) {

      let intersection1
      let intersection2

      if (intersections.length === 3) {
        const intersectionsLeft = []
        const intersectionsRight = []

        for (const intersection of intersections) {
          const normalisedAngle = normaliseAngle(intersection.t1)
          if (normalisedAngle > C.HALF_PI && normalisedAngle <= C.HALF_PI + C.PI) {
            intersectionsLeft.push(intersection)
          } else {
            intersectionsRight.push(intersection)
          }
        }

        if (intersectionsLeft.length === 2) {
          intersection1 = intersectionsLeft[0]
          intersection2 = intersectionsLeft[1]
        } else {
          intersection1 = intersectionsRight[0]
          intersection2 = intersectionsRight[1]
        }
      } else {
        intersection1 = intersections[0]
        intersection2 = intersections[1]
      }

      const ellipsePoints = isDownSlope(intersection1, intersection2)
        ? cwCurve(intersection1.t1, intersection2.t1)
        : ccwCurve(intersection1.t1, intersection2.t1)

      const travellingWavePoints1 = getTravellingWaveSegmentPoints(0, intersection1.t2)
      const travellingWavePoints2 = getTravellingWaveSegmentPoints(intersection2.t2, this.width)

      const linePoints = U.combinePoints(travellingWavePoints1, ellipsePoints, travellingWavePoints2)
      const line = new Line(linePoints, { ...commonLineOptions, clipToFormBoundary: true })
      const lines = [line]

      this.tick++

      const footprintData = { lines, intersectionPoints }
      return footprintData
    }

    if (intersections.length === 4) {
      const [intersection1, intersection2, intersection3, intersection4] = intersections

      const travellingWavePointsStart = getTravellingWaveSegmentPoints(0, intersection1.t2)
      const travellingWavePointsMiddle = getTravellingWaveSegmentPoints(intersection2.t2, intersection3.t2)
      const travellingWavePointsEnd = getTravellingWaveSegmentPoints(intersection4.t2, this.width)

      if (isTroughBelowEllipse()) {
        const ellipsePointsTop = ccwCurve(intersection1.t1, intersection4.t1)
        const ellipsePointsBottom = ccwCurve(intersection2.t1, intersection3.t1)

        const linePoints1 = U.combinePoints(travellingWavePointsStart, ellipsePointsTop, travellingWavePointsEnd)
        const line1 = new Line(linePoints1, { ...commonLineOptions, clipToFormBoundary: true })
        const linePoints2 = U.combinePoints(travellingWavePointsMiddle, ellipsePointsBottom)
        const line2 = new Line(linePoints2, { ...commonLineOptions, closed: true })
        const lines = [line1, line2]

        this.tick++

        const footprintData = { lines, intersectionPoints }
        return footprintData
      } else {
        const ellipsePointsLeft = smallCurve(intersection1.t1, intersection2.t1)
        const ellipsePointsRight = smallCurve(intersection3.t1, intersection4.t1)

        const linePoints = U.combinePoints(
          travellingWavePointsStart,
          ellipsePointsLeft,
          travellingWavePointsMiddle,
          ellipsePointsRight,
          travellingWavePointsEnd,
        )
        const line = new Line(linePoints, { ...commonLineOptions, clipToFormBoundary: true })
        const lines = [line]

        this.tick++

        const footprintData = { lines, intersectionPoints }
        return footprintData
      }
    }

    const ellipsePoints = getEllipseSegmentPoints(0, C.TWO_PI)
    const travellingWavePoints = getTravellingWaveSegmentPoints(0, this.width)

    const line1 = new Line(ellipsePoints, commonLineOptions)
    const line2 = new Line(travellingWavePoints, { ...commonLineOptions, clipToFormBoundary: true })
    const lines = [line1, line2]

    this.tick++

    const footprintData = { lines, intersectionPoints }
    return footprintData
  }
}
