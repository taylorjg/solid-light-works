import * as THREE from "three"
import { VertexNormalsHelper } from "three/examples/jsm/helpers/VertexNormalsHelper.js"
import LineInitFn from "three-line-2d"
import BasicShaderInitFn from "three-line-2d/shaders/basic"
const Line = LineInitFn(THREE)
const BasicShader = BasicShaderInitFn(THREE)
import { MembraneBufferGeometry } from "./MembraneGeometry"
import vertexShader from './vertex-shader.glsl'
import fragmentShader from './fragment-shader.glsl'
import * as C from "./constants"

const PROJECTED_IMAGE_RADIUS_X = 2.8
const PROJECTED_IMAGE_RADIUS_Y = 2
const PROJECTED_IMAGE_LINE_THICKNESS = 0.08
const PROJECTOR_BULB_RADIUS = 0.08
const ELLIPSE_POINT_COUNT = 100
const WIPE_POINT_COUNT = 50
const MEMBRANE_SEGMENT_COUNT = 10
const ROTATION_DELTA = Math.PI / (180 * 60)
const DELTA_ANGLE = 15 * Math.PI / 180
const ANGLE_OFFSET_THRESHOLD = 45 * Math.PI / 180

let currentRotationDelta = ROTATION_DELTA

const lineMaterial = new THREE.ShaderMaterial(
  BasicShader({
    side: THREE.DoubleSide,
    diffuse: 0xffffff,
    thickness: PROJECTED_IMAGE_LINE_THICKNESS
  }))

const toArr2Points = pointsVec2 =>
  pointsVec2.map(vec2 => vec2.toArray())

const toVec3Points = (pointsVec2, z) =>
  pointsVec2.map(vec2 => new THREE.Vector3(vec2.x, vec2.y, z))

export const setSpeed = multiplier => {
  currentRotationDelta = ROTATION_DELTA * multiplier
}

class Form {

  constructor(scene, initialSide) {
    this.scene = scene
    this.initialSide = initialSide
    this.init()
  }

  init() {
    this.ellipseCurveP = new THREE.EllipseCurve(
      this.initialSide === C.LEFT ? C.LEFT_CENTRE_X : C.RIGHT_CENTRE_X,
      C.CENTRE_P_Y,
      PROJECTOR_BULB_RADIUS,
      PROJECTOR_BULB_RADIUS,
      this.getStartAngle(),
      this.getEndAngle(),
      this.getIsClockwise())

    this.ellipseCurveQ = new THREE.EllipseCurve(
      this.initialSide === C.LEFT ? C.LEFT_CENTRE_X : C.RIGHT_CENTRE_X,
      C.CENTRE_Q_Y,
      PROJECTED_IMAGE_RADIUS_X,
      PROJECTED_IMAGE_RADIUS_Y,
      this.getStartAngle(),
      this.getEndAngle(),
      this.getIsClockwise())

    this.wipeCurveP = new THREE.CubicBezierCurve()
    this.wipeCurveQ = new THREE.CubicBezierCurve()

    this.lineGeometry = Line()
    this.lineMeshQ = new THREE.Mesh(this.lineGeometry, lineMaterial)
    this.scene.add(this.lineMeshQ)

    this.membraneGeometry = new MembraneBufferGeometry()
    this.membraneMaterial = undefined
    this.membraneMesh = undefined
    this.membraneMeshHelper = undefined
  }

  onTextureLoaded(hazeTexture) {

    // this.membraneMaterial = new THREE.MeshBasicMaterial({
    //   map: texture,
    //   side: THREE.DoubleSide,
    //   color: 0xffffff,
    //   transparent: true,
    //   opacity: 0.3
    // })

    this.membraneMaterial = new THREE.ShaderMaterial({
      uniforms: {
        hazeTexture: { value: hazeTexture }
      },
      vertexShader,
      fragmentShader,
      side: THREE.DoubleSide,
      blending: THREE.AdditiveBlending
    })

    this.membraneMesh = new THREE.Mesh(
      this.membraneGeometry,
      this.membraneMaterial)

    this.scene.add(this.membraneMesh)
  }

  getStartAngle() {
    throw new Error("You have to implement the method getStartAngle!")
  }

  getEndAngle() {
    throw new Error("You have to implement the method getEndAngle!")
  }

  getIsClockwise() {
    throw new Error("You have to implement the method getIsClockwise!")
  }

  calculateSinusoidalDampingFactor(a) {
    const dampingFactor = Math.pow(3 + (1 - Math.sin(a % Math.PI)) * 5, 2)
    // console.log(`a: ${a}; dampingFactor: ${dampingFactor}`)
    return dampingFactor
  }

  getCurrentAngle(tick) {
    const baseAngle = this.getStartAngle() - (currentRotationDelta * tick)
    const offsetFromStartAngle = Math.abs(baseAngle - this.getStartAngle())
    const totalTicks = 2 * Math.PI / currentRotationDelta
    const sinWaveTicks = totalTicks / 48
    const x = 2 * Math.PI * ((tick - 1) % sinWaveTicks) / sinWaveTicks
    const sinx = Math.sin(x)
    const sinusoidalDampingFactor = this.calculateSinusoidalDampingFactor(offsetFromStartAngle)
    const sinusoidalOffset = sinx / sinusoidalDampingFactor
    const finalAngle = baseAngle - sinusoidalOffset
    // console.log(`tick: ${tick}; offsetFromStartAngle: ${offsetFromStartAngle}; totalTicks: ${totalTicks}; sinWaveTicks: ${sinWaveTicks}; x: ${x}; sinx: ${sinx}; sinusoidalDampingFactor: ${sinusoidalDampingFactor}; sinusoidalOffset: ${sinusoidalOffset}; baseAngle: ${baseAngle}; finalAngle: ${finalAngle}`)
    return finalAngle
  }

  getWipeControlPoints(e, currentAngle) {

    const calculateEllipsePoint = theta => new THREE.Vector2(
      e.aX + e.xRadius * Math.cos(theta),
      e.aY + e.yRadius * Math.sin(theta))

    const startAngle = this.getStartAngle()
    const angleOffset = Math.abs(currentAngle - startAngle)
    const angleOffset2 = angleOffset < Math.PI ? angleOffset : 2 * Math.PI - angleOffset
    const normalisingFactor = 1 / ANGLE_OFFSET_THRESHOLD
    const alpha = angleOffset2 > ANGLE_OFFSET_THRESHOLD ? 1.0 : (angleOffset2 * normalisingFactor)
    const deltaAngle1 = currentAngle + DELTA_ANGLE * alpha
    const deltaAngle2 = currentAngle - DELTA_ANGLE * alpha
    const centrePoint = new THREE.Vector2(e.aX, e.aY)

    const deltaPoint1 = calculateEllipsePoint(deltaAngle1)
    const deltaPoint2 = calculateEllipsePoint(deltaAngle2)

    const startingPoint = calculateEllipsePoint(currentAngle)
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
    return ellipsePoints.slice().reverse().concat(wipePoints.slice(1))
  }

  getWipePoints(e, w, currentAngle, deltaAngle1, deltaAngle2, alpha) {

    const {
      startingPoint,
      controlPoint1,
      controlPoint2,
      endingPoint
    } = this.getWipeControlPoints(e, currentAngle, deltaAngle1, deltaAngle2, alpha)

    w.v0.copy(startingPoint)
    w.v1.copy(controlPoint1)
    w.v2.copy(controlPoint2)
    w.v3.copy(endingPoint)

    return w.getPoints(WIPE_POINT_COUNT)
  }

  updatePoints(tick) {

    const currentAngle = this.getCurrentAngle(tick)
    this.ellipseCurveP.aStartAngle = currentAngle
    this.ellipseCurveQ.aStartAngle = currentAngle

    const psEllipseVec2 = this.ellipseCurveP.getPoints(ELLIPSE_POINT_COUNT)
    const qsEllipseVec2 = this.ellipseCurveQ.getPoints(ELLIPSE_POINT_COUNT)

    const psWipeVec2 = this.getWipePoints(this.ellipseCurveP, this.wipeCurveP, currentAngle)
    const qsWipeVec2 = this.getWipePoints(this.ellipseCurveQ, this.wipeCurveQ, currentAngle)

    const psCombinedVec2 = this.combineEllipseAndWipe(psEllipseVec2, psWipeVec2)
    const qsCombinedVec2 = this.combineEllipseAndWipe(qsEllipseVec2, qsWipeVec2)

    return {
      psVec2: psCombinedVec2,
      qsVec2: qsCombinedVec2
    }
  }

  updateProjectedImage({ qsVec2 }) {
    this.lineGeometry.update(toArr2Points(qsVec2))
  }

  updateMembrane({ psVec2, qsVec2 }) {

    const psVec3 = toVec3Points(psVec2, C.MEMBRANE_LENGTH)
    const qsVec3 = toVec3Points(qsVec2, 0)

    const tempMembraneGeometry = new MembraneBufferGeometry(psVec3, qsVec3, MEMBRANE_SEGMENT_COUNT)
    this.membraneGeometry.copy(tempMembraneGeometry)
    tempMembraneGeometry.dispose()

    if (this.membraneMeshHelper) {
      this.membraneMeshHelper.update()
    }
  }

  update(tick) {
    const updatedPoints = this.updatePoints(tick)
    this.updateProjectedImage(updatedPoints)
    this.updateMembrane(updatedPoints)
  }

  swapSidesTest() {
    const endAngleDelta = Math.abs(this.getEndAngle() - this.ellipseCurveQ.aStartAngle)
    // console.log(`endAngleDelta: ${endAngleDelta}; currentRotationDelta: ${currentRotationDelta}`)
    return endAngleDelta <= 2 * currentRotationDelta
  }

  swapSides() {
    this.ellipseCurveP.aX = this.ellipseCurveP.aX === C.RIGHT_CENTRE_X ? C.LEFT_CENTRE_X : C.RIGHT_CENTRE_X
    this.ellipseCurveQ.aX = this.ellipseCurveQ.aX === C.RIGHT_CENTRE_X ? C.LEFT_CENTRE_X : C.RIGHT_CENTRE_X
    this.ellipseCurveP.aStartAngle = this.getStartAngle()
    this.ellipseCurveQ.aStartAngle = this.getStartAngle()
  }

  reset() {
    this.ellipseCurveP.aX = this.initialSide === C.LEFT ? C.LEFT_CENTRE_X : C.RIGHT_CENTRE_X
    this.ellipseCurveQ.aX = this.initialSide === C.LEFT ? C.LEFT_CENTRE_X : C.RIGHT_CENTRE_X
    this.ellipseCurveP.aStartAngle = this.getStartAngle()
    this.ellipseCurveQ.aStartAngle = this.getStartAngle()
  }

  toggleHelpers() {
    if (this.membraneMeshHelper) {
      this.scene.remove(this.membraneMeshHelper)
      this.membraneMeshHelper = undefined
    }
    else {
      this.membraneMeshHelper = new VertexNormalsHelper(this.membraneMesh, 0.1, 0x00ff00)
      this.scene.add(this.membraneMeshHelper)
    }
  }
}

export class GrowingForm extends Form {

  constructor(scene, initialSide) {
    super(scene, initialSide)
  }

  getStartAngle() {
    return 1.5 * Math.PI
  }

  getEndAngle() {
    return -0.5 * Math.PI
  }

  getIsClockwise() {
    return false
  }
}

export class ShrinkingForm extends Form {

  constructor(scene, initialSide) {
    super(scene, initialSide)
  }

  getStartAngle() {
    return 3.5 * Math.PI
  }

  getEndAngle() {
    return 1.5 * Math.PI
  }

  getIsClockwise() {
    return true
  }
}
