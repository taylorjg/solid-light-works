import * as THREE from "three";
import LineInitFn from "three-line-2d";
import BasicShaderInitFn from "three-line-2d/shaders/basic";
const Line = LineInitFn(THREE);
const BasicShader = BasicShaderInitFn(THREE);
import { MembraneBufferGeometry } from "./MembraneGeometry";
import * as C from "./constants";

const START_ANGLE = 1.5 * Math.PI;
const END_ANGLE = 3.5 * Math.PI;
const PROJECTED_IMAGE_RADIUS_X = 2.8;
const PROJECTED_IMAGE_RADIUS_Y = 2;
const PROJECTED_IMAGE_LINE_THICKNESS = 0.08;
const PROJECTOR_BULB_RADIUS = 0.08;
const CLOCKWISE = true;
const ELLIPSE_POINT_COUNT = 100;
const WIPE_POINT_COUNT = 50;
const MEMBRANE_SEGMENT_COUNT = 1;
const ROTATION_DELTA = Math.PI / (180 * 60);
const SWAP_AT_TICK = Math.floor(2 * Math.PI / ROTATION_DELTA);
const DELTA_ANGLE = 15 * Math.PI / 180;
const ANGLE_OFFSET_THRESHOLD = 45 * Math.PI / 180;

const lineMaterialQ = new THREE.ShaderMaterial(
  BasicShader({
    side: THREE.DoubleSide,
    diffuse: 0xffffff,
    thickness: PROJECTED_IMAGE_LINE_THICKNESS
  }));

const reverseNormals = bufferGeometry => {
  const normalAttribute = bufferGeometry.getAttribute("normal");
  const array = normalAttribute.array;
  for (let i = 0; i < array.length; i++) {
    array[i] *= -1;
  }
};

export const LEFT = Symbol("LEFT");
export const RIGHT = Symbol("RIGHT");
export const GROWING = Symbol("GROWING");
export const SHRINKING = Symbol("SHRINKING");

export class Form {

  constructor(scene, disposition, initialSide) {
    this.scene = scene;
    this.disposition = disposition;
    this.initialSide = initialSide;
    this.init();
  }

  init() {
    this.ellipseCurveP = new THREE.EllipseCurve(
      this.initialSide === LEFT ? C.LEFT_CENTRE_X : C.RIGHT_CENTRE_X,
      C.CENTRE_P_Y,
      PROJECTOR_BULB_RADIUS,
      PROJECTOR_BULB_RADIUS,
      START_ANGLE,
      END_ANGLE,
      CLOCKWISE);

    this.ellipseCurveQ = new THREE.EllipseCurve(
      this.initialSide === LEFT ? C.LEFT_CENTRE_X : C.RIGHT_CENTRE_X,
      C.CENTRE_Q_Y,
      PROJECTED_IMAGE_RADIUS_X,
      PROJECTED_IMAGE_RADIUS_Y,
      START_ANGLE,
      END_ANGLE,
      CLOCKWISE);

    this.wipeCurveP = new THREE.CubicBezierCurve();
    this.wipeCurveQ = new THREE.CubicBezierCurve();

    this.lineGeometryQ = Line();
    this.lineMeshQ = new THREE.Mesh(this.lineGeometryQ, lineMaterialQ);
    this.scene.add(this.lineMeshQ);

    this.membraneGeometryInner = new MembraneBufferGeometry();
    this.membraneGeometryOuter = new MembraneBufferGeometry();

    this.membraneMaterialInner = undefined;
    this.membraneMaterialOuter = undefined;

    this.membraneMeshInner = undefined;
    this.membraneMeshOuter = undefined;

    this.membraneMeshInnerHelper = undefined;
    this.membraneMeshOuterHelper = undefined;
  }

  onTextureLoaded(texture) {

    this.membraneMaterialInner = new THREE.MeshBasicMaterial({
      map: texture,
      side: THREE.FrontSide,
      color: 0xffffff,
      transparent: true,
      opacity: 0.4
    });

    this.membraneMaterialOuter = new THREE.MeshBasicMaterial({
      map: texture,
      side: THREE.BackSide,
      color: 0xffffff,
      transparent: true,
      opacity: 0.4
    });

    this.membraneMeshInner = new THREE.Mesh(
      this.membraneGeometryInner,
      this.membraneMaterialInner);

    this.membraneMeshOuter = new THREE.Mesh(
      this.membraneGeometryOuter,
      this.membraneMaterialOuter);

    this.scene.add(this.membraneMeshInner);
    this.scene.add(this.membraneMeshOuter);
  }

  toArrPoints(pointsVec2) {
    return pointsVec2.map(vec2 => vec2.toArray());
  }

  toVec3Points(pointsVec2, z) {
    return pointsVec2.map(vec2 => new THREE.Vector3(vec2.x, vec2.y, z));
  }

  reverseIfShrinking(xs) {
    return this.disposition === SHRINKING ? xs.slice().reverse() : xs;
  }

  getWipePoints(e, w, currentAngle, deltaAngle1, deltaAngle2, alpha) {

    const calculateEllipsePoint = theta => new THREE.Vector2(
      e.aX + e.xRadius * Math.cos(theta),
      e.aY + e.yRadius * Math.sin(theta));

    const centrePoint = new THREE.Vector2(e.aX, e.aY);
    const deltaPoint1 = calculateEllipsePoint(deltaAngle1);
    const deltaPoint2 = calculateEllipsePoint(deltaAngle2);

    const startingPoint = calculateEllipsePoint(currentAngle);
    const endingPoint = startingPoint.clone().lerp(centrePoint, alpha);
    const controlPoint1 = deltaPoint1.lerp(endingPoint, 0.25);
    const controlPoint2 = deltaPoint2.lerp(endingPoint, 0.75);

    w.v0.copy(startingPoint);
    w.v1.copy(controlPoint1);
    w.v2.copy(controlPoint2);
    w.v3.copy(endingPoint);

    return w.getPoints(WIPE_POINT_COUNT);
  }

  updateCurrentAngle() {

    if (this.disposition === GROWING) {
      this.ellipseCurveP.aEndAngle -= ROTATION_DELTA;
      this.ellipseCurveQ.aEndAngle -= ROTATION_DELTA;
      return this.ellipseCurveQ.aEndAngle;
    }

    this.ellipseCurveP.aStartAngle -= ROTATION_DELTA;
    this.ellipseCurveQ.aStartAngle -= ROTATION_DELTA;
    return this.ellipseCurveQ.aStartAngle;
  }

  update() {

    const initialAngle = this.disposition === GROWING ? END_ANGLE : START_ANGLE;
    const currentAngle = this.updateCurrentAngle();
    const angleOffset = Math.abs(currentAngle - initialAngle);
    const angleOffset2 = angleOffset < Math.PI ? angleOffset : 2 * Math.PI - angleOffset;
    const normalisingFactor = 1 / ANGLE_OFFSET_THRESHOLD;
    const alpha = angleOffset2 > ANGLE_OFFSET_THRESHOLD ? 1.0 : (angleOffset2 * normalisingFactor);
    const deltaAngle1 = currentAngle + DELTA_ANGLE * alpha;
    const deltaAngle2 = currentAngle - DELTA_ANGLE * alpha;

    const ellipsePointsPVec2 = this.ellipseCurveP.getPoints(ELLIPSE_POINT_COUNT);
    const ellipsePointsQVec2 = this.ellipseCurveQ.getPoints(ELLIPSE_POINT_COUNT);

    let wipePointsPVec2 = this.getWipePoints(
      this.ellipseCurveP,
      this.wipeCurveP,
      currentAngle,
      deltaAngle1,
      deltaAngle2,
      alpha);

    let wipePointsQVec2 = this.getWipePoints(
      this.ellipseCurveQ,
      this.wipeCurveQ,
      currentAngle,
      deltaAngle1,
      deltaAngle2,
      alpha);

    const ellipsePointsQArr = this.toArrPoints(ellipsePointsQVec2);
    const wipePointsQArr = this.toArrPoints(wipePointsQVec2);
    const combinedLinePointsQArr = this.reverseIfShrinking(ellipsePointsQArr).concat(wipePointsQArr.slice(1));
    this.lineGeometryQ.update(combinedLinePointsQArr);

    const psEllipse = this.toVec3Points(ellipsePointsPVec2, C.MEMBRANE_LENGTH);
    const qsEllipse = this.toVec3Points(ellipsePointsQVec2, 0);
    const psWipe = this.toVec3Points(wipePointsPVec2, C.MEMBRANE_LENGTH);
    const qsWipe = this.toVec3Points(wipePointsQVec2, 0);
    const ps = this.reverseIfShrinking(this.reverseIfShrinking(psEllipse).concat(psWipe.slice(1)));
    const qs = this.reverseIfShrinking(this.reverseIfShrinking(qsEllipse).concat(qsWipe.slice(1)));

    const tempMembraneGeometry = new MembraneBufferGeometry(ps, qs, MEMBRANE_SEGMENT_COUNT);
    tempMembraneGeometry.computeVertexNormals(); // NOT NEEDED ?
    this.membraneGeometryInner.copy(tempMembraneGeometry);
    reverseNormals(tempMembraneGeometry); // NOT NEEDED ?
    this.membraneGeometryOuter.copy(tempMembraneGeometry);
    tempMembraneGeometry.dispose();

    if (this.membraneMeshInnerHelper) {
      this.membraneMeshInnerHelper.update();
      this.membraneMeshOuterHelper.update();
    }
  }

  swapSides() {
    this.ellipseCurveP.aX = this.ellipseCurveP.aX === C.RIGHT_CENTRE_X ? C.LEFT_CENTRE_X : C.RIGHT_CENTRE_X;
    this.ellipseCurveQ.aX = this.ellipseCurveQ.aX === C.RIGHT_CENTRE_X ? C.LEFT_CENTRE_X : C.RIGHT_CENTRE_X;
    this.ellipseCurveP.aStartAngle = START_ANGLE;
    this.ellipseCurveQ.aStartAngle = START_ANGLE;
    this.ellipseCurveP.aEndAngle = END_ANGLE;
    this.ellipseCurveQ.aEndAngle = END_ANGLE;
  }

  toggleHelpers() {
    if (this.membraneMeshInnerHelper) {
      this.scene.remove(this.membraneMeshInnerHelper);
      this.scene.remove(this.membraneMeshOuterHelper);
      this.membraneMeshInnerHelper = undefined;
      this.membraneMeshOuterHelper = undefined;
    }
    else {
      this.membraneMeshInnerHelper = new THREE.VertexNormalsHelper(this.membraneMeshInner, 0.1, 0x00ff00);
      this.membraneMeshOuterHelper = new THREE.VertexNormalsHelper(this.membraneMeshOuter, 0.1, 0x0000ff);
      this.scene.add(this.membraneMeshInnerHelper);
      this.scene.add(this.membraneMeshOuterHelper);
    }
  }
}

export const swapSidesTest = tick =>
  tick === SWAP_AT_TICK;
