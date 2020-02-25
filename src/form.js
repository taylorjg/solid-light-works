import * as THREE from 'three'
import { VertexNormalsHelper } from 'three/examples/jsm/helpers/VertexNormalsHelper.js'
import Line2dInit from 'three-line-2d'
import Line2dBasicShaderInit from 'three-line-2d/shaders/basic'
const Line2d = Line2dInit(THREE)
const Line2dBasicShader = Line2dBasicShaderInit(THREE)
import { MembraneBufferGeometry } from './membrane-geometry'
import vertexShader from './shaders/vertex-shader.glsl'
import fragmentShader from './shaders/fragment-shader.glsl'
import { addProjectorCasing } from './projector-casing'
import * as U from './utils'
import * as C from './constants'

const PROJECTED_IMAGE_RADIUS_X = 2.8
const PROJECTED_IMAGE_RADIUS_Y = 2
const PROJECTED_IMAGE_LINE_THICKNESS = 0.04
const ELLIPSE_POINT_COUNT = 100
const WIPE_POINT_COUNT = 50
const MEMBRANE_SEGMENT_COUNT = 1
const ROTATION_DELTA = Math.PI / (180 * 60)
const DELTA_ANGLE = 15 * Math.PI / 180
const ANGLE_OFFSET_THRESHOLD = 45 * Math.PI / 180

const TWO_PI = Math.PI * 2
const HALF_PI = Math.PI / 2
const REVOLUTION_START = -HALF_PI
const REVOLUTION_END = REVOLUTION_START + TWO_PI

let currentRotationDelta = ROTATION_DELTA

export const setSpeed = multiplier => {
  currentRotationDelta = ROTATION_DELTA * multiplier
}

// Use our own code to calculate points on an elliptical curve because
// THREE.EllipseCurve seems to interfere with negative start/end angles.
class EllipseCurve {

  constructor(cx, cy, rx, ry) {
    this.cx = cx
    this.cy = cy
    this.rx = rx
    this.ry = ry
  }

  getPoint(angle) {
    const x = this.cx - this.rx * Math.cos(angle)
    const y = this.cy + this.ry * Math.sin(angle)
    return new THREE.Vector2(x, y)
  }

  getPoints(startAngle, endAngle, divisions) {
    const deltaAngle = endAngle - startAngle
    return U.range(divisions + 1).map(index => {
      const t = index / divisions
      const angle = startAngle + t * deltaAngle
      return this.getPoint(angle)
    })
  }
}

class FormPoints {

  constructor(cx, cy, rx, ry, isInitiallyGrowing) {
    this.cx = cx
    this.cy = cy
    this.rx = rx
    this.ry = ry
    this.reset(isInitiallyGrowing)
    this.ellipseCurve = new EllipseCurve(cx, cy, rx, ry)
    this.wipeCurve = new THREE.CubicBezierCurve()
  }

  calculateSinusoidalDampingFactor(angle) {
    const dampingFactor = Math.pow(3 + (1 - Math.sin(angle % Math.PI)) * 5, 2)
    // console.log(`angle: ${angle}; dampingFactor: ${dampingFactor}`)
    return dampingFactor
  }

  getCurrentAngle() {
    const offsetFromStartAngle = currentRotationDelta * this.tick
    const baseAngle = REVOLUTION_START + offsetFromStartAngle
    const totalTicks = TWO_PI / currentRotationDelta
    const sinWaveTicks = totalTicks / 48
    const x = TWO_PI * (this.tick % sinWaveTicks) / sinWaveTicks
    const sinx = Math.sin(x)
    const sinusoidalDampingFactor = this.calculateSinusoidalDampingFactor(offsetFromStartAngle)
    const sinusoidalOffset = sinx / sinusoidalDampingFactor
    const finalAngle = baseAngle - sinusoidalOffset
    // console.log(`tick: ${this.tick}; offsetFromStartAngle: ${offsetFromStartAngle}; totalTicks: ${totalTicks}; sinWaveTicks: ${sinWaveTicks}; x: ${x}; sinx: ${sinx}; sinusoidalDampingFactor: ${sinusoidalDampingFactor}; sinusoidalOffset: ${sinusoidalOffset}; baseAngle: ${baseAngle}; finalAngle: ${finalAngle}`)
    return finalAngle
  }

  getWipeControlPoints(currentAngle) {
    const startAngle = REVOLUTION_START
    const angleOffset = Math.abs(currentAngle - startAngle)
    const angleOffset2 = angleOffset < Math.PI ? angleOffset : TWO_PI - angleOffset
    const normalisingFactor = 1 / ANGLE_OFFSET_THRESHOLD
    const alpha = angleOffset2 > ANGLE_OFFSET_THRESHOLD ? 1.0 : (angleOffset2 * normalisingFactor)
    const deltaAngle1 = currentAngle - DELTA_ANGLE * alpha
    const deltaAngle2 = currentAngle + DELTA_ANGLE * alpha
    const centrePoint = new THREE.Vector2(this.cx, this.cy)
    const deltaPoint1 = this.ellipseCurve.getPoint(deltaAngle1)
    const deltaPoint2 = this.ellipseCurve.getPoint(deltaAngle2)
    const startingPoint = this.ellipseCurve.getPoint(currentAngle)
    const endingPoint = startingPoint.clone().lerp(centrePoint, alpha)
    const controlPoint1 = deltaPoint1.lerp(endingPoint, 0.25)
    const controlPoint2 = deltaPoint2.lerp(endingPoint, 0.75)
    return {
      startingPoint,
      controlPoint1,
      controlPoint2,
      endingPoint
    }
  }

  combineEllipseAndWipe(ellipsePoints, wipePoints) {
    const wipePointsTail = wipePoints.slice(1)
    return this.growing
      ? ellipsePoints.concat(wipePointsTail)
      : wipePointsTail.reverse().concat(ellipsePoints)
  }

  getWipePoints(currentAngle) {
    const {
      startingPoint,
      controlPoint1,
      controlPoint2,
      endingPoint
    } = this.getWipeControlPoints(currentAngle)
    if (controlPoint1.equals(controlPoint2)) {
      return U.repeat(WIPE_POINT_COUNT + 1, startingPoint)
    }
    this.wipeCurve.v0.copy(startingPoint)
    this.wipeCurve.v1.copy(controlPoint1)
    this.wipeCurve.v2.copy(controlPoint2)
    this.wipeCurve.v3.copy(endingPoint)
    return this.wipeCurve.getPoints(WIPE_POINT_COUNT)
  }

  getUpdatedPoints() {
    const currentAngle = this.getCurrentAngle()
    this.tick++
    if (this.growing) {
      this.endAngle = currentAngle
    } else {
      this.startAngle = currentAngle
    }
    const revolutionComplete = (this.growing ? this.endAngle : this.startAngle) > REVOLUTION_END
    if (revolutionComplete) {
      this.reset(!this.growing)
    }
    const ellipsePoints = this.ellipseCurve.getPoints(this.startAngle, this.endAngle, ELLIPSE_POINT_COUNT)
    const wipePoints = this.getWipePoints(currentAngle)
    return this.combineEllipseAndWipe(ellipsePoints, wipePoints)
  }

  reset(growing) {
    this.growing = growing
    if (this.growing) {
      this.startAngle = REVOLUTION_START
      this.endAngle = REVOLUTION_START
    } else {
      this.startAngle = REVOLUTION_START
      this.endAngle = REVOLUTION_END
    }
    this.tick = 0
  }
}

class ScreenImage {

  constructor(scene) {
    this.lineGeometry = Line2d()
    const lineMaterial = new THREE.ShaderMaterial(
      Line2dBasicShader({
        side: THREE.DoubleSide,
        diffuse: 0xffffff,
        thickness: PROJECTED_IMAGE_LINE_THICKNESS
      }))
    this.lineMesh = new THREE.Mesh(this.lineGeometry, lineMaterial)
    scene.add(this.lineMesh)
  }

  update(points) {
    const path = U.vectorsAsArrays(points)
    this.lineGeometry.update(path)
  }
}

class ProjectionEffect {

  constructor(scene, hazeTexture) {
    this.scene = scene
    this.membraneGeometry = new MembraneBufferGeometry()
    const membraneMaterial = new THREE.ShaderMaterial({
      uniforms: {
        hazeTexture: {
          value: hazeTexture
        }
      },
      vertexShader,
      fragmentShader,
      side: THREE.DoubleSide,
      blending: THREE.AdditiveBlending
    })
    this.membraneMesh = new THREE.Mesh(this.membraneGeometry, membraneMaterial)
    scene.add(this.membraneMesh)
  }

  update(vec2ProjectorPoints, vec2ScreenImagePoints) {

    const projectorPoints = U.vec2sToVec3s(vec2ProjectorPoints, C.MEMBRANE_LENGTH)
    const screenImagePoints = U.vec2sToVec3s(vec2ScreenImagePoints)

    const tempMembraneGeometry = new MembraneBufferGeometry(projectorPoints, screenImagePoints, MEMBRANE_SEGMENT_COUNT)
    tempMembraneGeometry.computeFaceNormals()
    tempMembraneGeometry.computeVertexNormals()
    const normalAttribute = tempMembraneGeometry.getAttribute('normal')
    const array = normalAttribute.array
    array.forEach((_, index) => array[index] *= -1)
    this.membraneGeometry.copy(tempMembraneGeometry)
    tempMembraneGeometry.dispose()

    if (this.membraneMeshHelper) {
      this.membraneMeshHelper.update()
    }
  }

  toggleHelpers() {
    if (this.membraneMeshHelper) {
      this.scene.remove(this.membraneMeshHelper)
      this.membraneMeshHelper = undefined
    }
    else {
      this.membraneMeshHelper = new VertexNormalsHelper(this.membraneMesh, 0.2, 0xffffff)
      this.scene.add(this.membraneMeshHelper)
    }
  }
}

export class Form {

  constructor(side, scene, hazeTexture, projectorLensTexture) {
    const isInitiallyGrowing = side === C.LEFT
    const cx = side === C.LEFT ? C.LEFT_FORM_CENTRE_X : C.RIGHT_FORM_CENTRE_X
    const pcy = C.CENTRE_P_Y
    const prx = C.PROJECTOR_BULB_RADIUS
    const pry = C.PROJECTOR_BULB_RADIUS
    const qcy = C.CENTRE_Q_Y
    const qrx = PROJECTED_IMAGE_RADIUS_X
    const qry = PROJECTED_IMAGE_RADIUS_Y
    this.projectorForm = new FormPoints(cx, pcy, prx, pry, isInitiallyGrowing)
    this.screenImageForm = new FormPoints(cx, qcy, qrx, qry, isInitiallyGrowing)
    this.screenImage = new ScreenImage(scene)
    this.projectionEffect = new ProjectionEffect(scene, hazeTexture)
    const projectorPosition = new THREE.Vector3(cx, pcy, C.MEMBRANE_LENGTH)
    addProjectorCasing(scene, projectorLensTexture, projectorPosition)
  }

  update() {
    const screenImagePoints = this.screenImageForm.getUpdatedPoints()
    const projectorPoints = this.projectorForm.getUpdatedPoints()
    this.screenImage.update(screenImagePoints)
    this.projectionEffect.update(projectorPoints, screenImagePoints)
  }

  toggleHelpers() {
    this.projectionEffect.toggleHelpers()
  }
}
