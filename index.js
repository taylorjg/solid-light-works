import * as THREE from "three";
import OrbitControls from "three-orbitcontrols";
import LineInitFn from "three-line-2d";
import BasicShaderInitFn from "three-line-2d/shaders/basic";
const Line = LineInitFn(THREE);
const BasicShader = BasicShaderInitFn(THREE);
import { MembraneBufferGeometry } from "./MembraneGeometry";

const container = document.getElementById("container");
const w = container.offsetWidth;
const h = container.offsetHeight;
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(w, h);
container.appendChild(renderer.domElement);

const FAVOURITE_POSITIONS = [
  {
    cameraPosition: new THREE.Vector3(0.95, 2.12, 12.46),
    controlsTarget: new THREE.Vector3(0.95, 2.00, 9.63)
  },
  {
    cameraPosition: new THREE.Vector3(2.15, 4.05, -8.75),
    controlsTarget: new THREE.Vector3(-0.93, 2.00, 8.79)
  },
  {
    cameraPosition: new THREE.Vector3(-21.88, 9.81, 14.97),
    controlsTarget: new THREE.Vector3(1.85, 2.00, 9.08)
  },
  {
    cameraPosition: new THREE.Vector3(0.94, 3.05, 27.52),
    controlsTarget: new THREE.Vector3(0.95, 2.00, 9.63)
  }
];
let currentFavouritePositionIndex = 0;

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(45, w / h, 0.1, 50);
camera.position.copy(FAVOURITE_POSITIONS[currentFavouritePositionIndex].cameraPosition);
scene.add(camera);

const controls = new OrbitControls(camera, renderer.domElement);
controls.target.copy(FAVOURITE_POSITIONS[currentFavouritePositionIndex].controlsTarget);
controls.minDistance = 0;
controls.maxDistance = 50;
controls.enableDamping = true;
controls.dampingFactor = 0.9;
controls.autoRotate = false;

// -----------------
// Projection screen
// -----------------

const projectionScreenGeometry = new THREE.PlaneGeometry(16, 6);
projectionScreenGeometry.translate(0, 3, 0);
const projectionScreenMaterial = new THREE.MeshBasicMaterial({
  color: 0xA0A0A0,
  transparent: true,
  opacity: 0.2
});
const screen = new THREE.Mesh(projectionScreenGeometry, projectionScreenMaterial);
scene.add(screen);

// -------------------
// Sizes and positions
// -------------------

const START_ANGLE = 1.5 * Math.PI;
const END_ANGLE = 3.5 * Math.PI;

const LEFT_CENTRE_X = -3.5;
const RIGHT_CENTRE_X = -LEFT_CENTRE_X;

const CENTRE_P_Y = 1;
const CENTRE_Q_Y = 2.6;

const ELLIPSE_RADIUS_Q_X = 2.8;
const ELLIPSE_RADIUS_Q_Y = 2;
const ELLIPSE_RADIUS_P = ELLIPSE_RADIUS_Q_Y / 20;
const ELLIPSE_THICKNESS = 0.08;
const ELLIPSE_CLOCKWISE = true;
const ELLIPSE_POINT_COUNT = 100;
const ELLIPSE_ROTATION_DELTA = Math.PI / (180 * 60);

const WIPE_POINT_COUNT = 50;

const MEMBRANE_LENGTH = 18;
const MEMBRANE_SEGMENT_COUNT = 1;

const lineMaterialQ = new THREE.ShaderMaterial(
  BasicShader({
    side: THREE.DoubleSide,
    diffuse: 0xffffff,
    thickness: ELLIPSE_THICKNESS
  }));

const forms = [
  // Nothing => everything then reset and swap sides
  {
    ellipseCurveP: undefined,
    ellipseCurveQ: undefined,
    wipeCurveP: undefined,
    wipeCurveQ: undefined,
    lineGeometryQ: undefined,
    lineMeshQ: undefined,
    membraneGeometryInner: undefined,
    membraneGeometryOuter: undefined,
    membraneMeshInner: undefined,
    membraneMeshOuter: undefined
  },
  // Everything => nothing then reset and swap sides
  {
    ellipseCurveP: undefined,
    ellipseCurveQ: undefined,
    wipeCurveP: undefined,
    wipeCurveQ: undefined,
    lineGeometryQ: undefined,
    lineMeshQ: undefined,
    membraneGeometryInner: undefined,
    membraneGeometryOuter: undefined,
    membraneMeshInner: undefined,
    membraneMeshOuter: undefined
  }
];

let axesHelper = undefined;
let membraneMeshLInnerVNH = undefined;
let membraneMeshLOuterVNH = undefined;
let membraneMeshRInnerVNH = undefined;
let membraneMeshROuterVNH = undefined;
let spotLightLHelper = undefined;
let spotLightRHelper = undefined;

// --------------------------------------
// Nothing => everything ellipse and wipe
// --------------------------------------

forms[0].ellipseCurveP = new THREE.EllipseCurve(
  LEFT_CENTRE_X,
  CENTRE_P_Y,
  ELLIPSE_RADIUS_P,
  ELLIPSE_RADIUS_P,
  START_ANGLE,
  END_ANGLE,
  ELLIPSE_CLOCKWISE);

forms[0].ellipseCurveQ = new THREE.EllipseCurve(
  LEFT_CENTRE_X,
  CENTRE_Q_Y,
  ELLIPSE_RADIUS_Q_X,
  ELLIPSE_RADIUS_Q_Y,
  START_ANGLE,
  END_ANGLE,
  ELLIPSE_CLOCKWISE);

forms[0].lineGeometryQ = Line();
forms[0].lineMeshQ = new THREE.Mesh(forms[0].lineGeometryQ, lineMaterialQ);
scene.add(forms[0].lineMeshQ);

forms[0].wipeCurveP = new THREE.CubicBezierCurve();
forms[0].wipeCurveQ = new THREE.CubicBezierCurve();

// --------------------------------------
// Everything => nothing ellipse and wipe
// --------------------------------------

forms[1].ellipseCurveP = new THREE.EllipseCurve(
  RIGHT_CENTRE_X,
  CENTRE_P_Y,
  ELLIPSE_RADIUS_P,
  ELLIPSE_RADIUS_P,
  START_ANGLE,
  END_ANGLE,
  ELLIPSE_CLOCKWISE);

forms[1].ellipseCurveQ = new THREE.EllipseCurve(
  RIGHT_CENTRE_X,
  CENTRE_Q_Y,
  ELLIPSE_RADIUS_Q_X,
  ELLIPSE_RADIUS_Q_Y,
  START_ANGLE,
  END_ANGLE,
  ELLIPSE_CLOCKWISE);

forms[1].lineGeometryQ = Line();
forms[1].lineMeshQ = new THREE.Mesh(forms[1].lineGeometryQ, lineMaterialQ);
scene.add(forms[1].lineMeshQ);

forms[1].wipeCurveP = new THREE.CubicBezierCurve();
forms[1].wipeCurveQ = new THREE.CubicBezierCurve();

// --------------------------------
// Membrane spotlights (projectors)
// --------------------------------

const SPOTLIGHT_COLOUR = 0xffffff;
const SPOTLIGHT_HIGH_INTENSITY = 100;
const SPOTLIGHT_LOW_INTENSITY = 50;
const SPOTLIGHT_DISTANCE = MEMBRANE_LENGTH * 2;
const SPOTLIGHT_ANGLE = 14 * Math.PI / 180;

const spotLightTargetL = new THREE.Object3D();
spotLightTargetL.position.set(LEFT_CENTRE_X, CENTRE_Q_Y, 0);
scene.add(spotLightTargetL);
const spotLightL = new THREE.SpotLight(
  SPOTLIGHT_COLOUR,
  SPOTLIGHT_HIGH_INTENSITY,
  SPOTLIGHT_DISTANCE,
  SPOTLIGHT_ANGLE);
spotLightL.position.set(LEFT_CENTRE_X, CENTRE_P_Y, MEMBRANE_LENGTH);
spotLightL.target = spotLightTargetL;
scene.add(spotLightL);

{
  const spotLightTarget = new THREE.Object3D();
  spotLightTarget.position.set(LEFT_CENTRE_X, CENTRE_Q_Y, 0);
  scene.add(spotLightTarget);
  const spotLight = new THREE.SpotLight(
    SPOTLIGHT_COLOUR,
    SPOTLIGHT_LOW_INTENSITY,
    SPOTLIGHT_DISTANCE,
    SPOTLIGHT_ANGLE);
  spotLight.position.set(LEFT_CENTRE_X, 0, MEMBRANE_LENGTH);
  spotLight.target = spotLightTarget;
  scene.add(spotLight);
}

{
  const spotLightTarget = new THREE.Object3D();
  spotLightTarget.position.set(LEFT_CENTRE_X, CENTRE_Q_Y, 0);
  scene.add(spotLightTarget);
  const spotLight = new THREE.SpotLight(
    SPOTLIGHT_COLOUR,
    SPOTLIGHT_LOW_INTENSITY,
    SPOTLIGHT_DISTANCE,
    SPOTLIGHT_ANGLE);
  spotLight.position.set(LEFT_CENTRE_X, CENTRE_P_Y * 2, MEMBRANE_LENGTH);
  spotLight.target = spotLightTarget;
  scene.add(spotLight);
}

const spotLightTargetR = new THREE.Object3D();
spotLightTargetR.position.set(RIGHT_CENTRE_X, CENTRE_Q_Y, 0);
scene.add(spotLightTargetR);
const spotLightR = new THREE.SpotLight(
  SPOTLIGHT_COLOUR,
  SPOTLIGHT_HIGH_INTENSITY,
  SPOTLIGHT_DISTANCE,
  SPOTLIGHT_ANGLE);
spotLightR.position.set(RIGHT_CENTRE_X, CENTRE_P_Y, MEMBRANE_LENGTH);
spotLightR.target = spotLightTargetR;
scene.add(spotLightR);

{
  const spotLightTarget = new THREE.Object3D();
  spotLightTarget.position.set(RIGHT_CENTRE_X, CENTRE_P_Y, 0);
  scene.add(spotLightTarget);
  const spotLight = new THREE.SpotLight(
    SPOTLIGHT_COLOUR,
    SPOTLIGHT_LOW_INTENSITY,
    SPOTLIGHT_DISTANCE,
    SPOTLIGHT_ANGLE);
  spotLight.position.set(RIGHT_CENTRE_X, 0, MEMBRANE_LENGTH);
  spotLight.target = spotLightTarget;
  scene.add(spotLight);
}

{
  const spotLightTarget = new THREE.Object3D();
  spotLightTarget.position.set(RIGHT_CENTRE_X, CENTRE_P_Y, 0);
  scene.add(spotLightTarget);
  const spotLight = new THREE.SpotLight(
    SPOTLIGHT_COLOUR,
    SPOTLIGHT_LOW_INTENSITY,
    SPOTLIGHT_DISTANCE,
    SPOTLIGHT_ANGLE);
  spotLight.position.set(RIGHT_CENTRE_X, CENTRE_P_Y * 2, MEMBRANE_LENGTH);
  spotLight.target = spotLightTarget;
  scene.add(spotLight);
}

const onTextureLoaded = hazeTexture => {

  const membraneTextureMaterialInner = new THREE.MeshLambertMaterial({
    map: hazeTexture,
    side: THREE.FrontSide,
    color: 0xffffff,
    transparent: true,
    opacity: 0.4
  });

  const membraneTextureMaterialOuter = new THREE.MeshLambertMaterial({
    map: hazeTexture,
    side: THREE.BackSide,
    color: 0xffffff,
    transparent: true,
    opacity: 0.4
  });

  // -------------
  // Left membrane
  // -------------

  forms[0].membraneGeometryInner = new MembraneBufferGeometry();
  forms[0].membraneMeshInner = new THREE.Mesh(forms[0].membraneGeometryInner, membraneTextureMaterialInner);
  scene.add(forms[0].membraneMeshInner);

  forms[0].membraneGeometryOuter = new MembraneBufferGeometry();
  forms[0].membraneMeshOuter = new THREE.Mesh(forms[0].membraneGeometryOuter, membraneTextureMaterialOuter);
  scene.add(forms[0].membraneMeshOuter);

  // --------------
  // Right membrane
  // --------------

  forms[1].membraneGeometryInner = new MembraneBufferGeometry();
  forms[1].membraneMeshInner = new THREE.Mesh(forms[1].membraneGeometryInner, membraneTextureMaterialInner);
  scene.add(forms[1].membraneMeshInner);

  forms[1].membraneGeometryOuter = new MembraneBufferGeometry();
  forms[1].membraneMeshOuter = new THREE.Mesh(forms[1].membraneGeometryOuter, membraneTextureMaterialOuter);
  scene.add(forms[1].membraneMeshOuter);

  animate();
};

const textureLoader = new THREE.TextureLoader();
textureLoader.load("haze.jpg", onTextureLoaded);

// ---------
// Animation
// ---------

const reverseNormals = bufferGeometry => {
  const normalAttribute = bufferGeometry.getAttribute("normal");
  const array = normalAttribute.array;
  for (let i = 0; i < array.length; i++) {
    array[i] *= -1;
  }
};

const DELTA_ANGLE = 15 * Math.PI / 180;
const ANGLE_OFFSET_THRESHOLD = 45 * Math.PI / 180;

const updateGrowingForm = form => {

  form.ellipseCurveP.aEndAngle -= ELLIPSE_ROTATION_DELTA;
  form.ellipseCurveQ.aEndAngle -= ELLIPSE_ROTATION_DELTA;

  const ellipsePointsPVec2 = form.ellipseCurveP.getPoints(ELLIPSE_POINT_COUNT);
  const ellipsePointsQVec2 = form.ellipseCurveQ.getPoints(ELLIPSE_POINT_COUNT);

  const currentAngle = form.ellipseCurveQ.aEndAngle;
  const angleOffset = Math.abs(currentAngle - END_ANGLE);
  const angleOffset2 = angleOffset < Math.PI ? angleOffset : 2 * Math.PI - angleOffset;
  const normalisingFactor = 1 / ANGLE_OFFSET_THRESHOLD;
  const alpha = angleOffset2 > ANGLE_OFFSET_THRESHOLD ? 1.0 : (angleOffset2 * normalisingFactor);
  const angle1 = currentAngle + DELTA_ANGLE * alpha;
  const angle2 = currentAngle - DELTA_ANGLE * alpha;

  let wipePointsPVec2;
  let wipePointsQVec2;

  {
    const e = form.ellipseCurveP;
    const w = form.wipeCurveP;
    const startingPoint = new THREE.Vector2(e.aX + e.xRadius * Math.cos(e.aEndAngle), e.aY + e.yRadius * Math.sin(e.aEndAngle));
    const centrePoint = new THREE.Vector2(e.aX, e.aY);
    const endingPoint = startingPoint.clone().lerp(centrePoint, alpha);
    const pt1 = new THREE.Vector2(e.aX + e.xRadius * Math.cos(angle1), e.aY + e.yRadius * Math.sin(angle1));
    const pt2 = new THREE.Vector2(e.aX + e.xRadius * Math.cos(angle2), e.aY + e.yRadius * Math.sin(angle2));
    const controlPoint1 = pt1.lerp(endingPoint, 0.25);
    const controlPoint2 = pt2.lerp(endingPoint, 0.75);
    w.v0.copy(startingPoint);
    w.v1.copy(controlPoint1);
    w.v2.copy(controlPoint2);
    w.v3.copy(endingPoint);
    wipePointsPVec2 = w.getPoints(WIPE_POINT_COUNT);
  }

  {
    const e = form.ellipseCurveQ;
    const w = form.wipeCurveQ;
    const startingPoint = new THREE.Vector2(e.aX + e.xRadius * Math.cos(e.aEndAngle), e.aY + e.yRadius * Math.sin(e.aEndAngle));
    const centrePoint = new THREE.Vector2(e.aX, e.aY);
    const endingPoint = startingPoint.clone().lerp(centrePoint, alpha);
    const pt1 = new THREE.Vector2(e.aX + e.xRadius * Math.cos(angle1), e.aY + e.yRadius * Math.sin(angle1));
    const pt2 = new THREE.Vector2(e.aX + e.xRadius * Math.cos(angle2), e.aY + e.yRadius * Math.sin(angle2));
    const controlPoint1 = pt1.lerp(endingPoint, 0.25);
    const controlPoint2 = pt2.lerp(endingPoint, 0.75);
    w.v0.copy(startingPoint);
    w.v1.copy(controlPoint1);
    w.v2.copy(controlPoint2);
    w.v3.copy(endingPoint);
    wipePointsQVec2 = w.getPoints(WIPE_POINT_COUNT);
    const wipePointsQArr = wipePointsQVec2.map(vec2 => vec2.toArray());
    const ellipsePointsQArr = ellipsePointsQVec2.map(vec2 => vec2.toArray());
    const combinedLinePointsQArr = ellipsePointsQArr.concat(wipePointsQArr.slice(1));
    form.lineGeometryQ.update(combinedLinePointsQArr);
  }

  const psEllipse = ellipsePointsPVec2.map(vec2 => new THREE.Vector3(vec2.x, vec2.y, MEMBRANE_LENGTH));
  const qsEllipse = ellipsePointsQVec2.map(vec2 => new THREE.Vector3(vec2.x, vec2.y, 0));
  const psWipe = wipePointsPVec2.map(vec2 => new THREE.Vector3(vec2.x, vec2.y, MEMBRANE_LENGTH));
  const qsWipe = wipePointsQVec2.map(vec2 => new THREE.Vector3(vec2.x, vec2.y, 0));
  const ps = psEllipse.concat(psWipe.slice(1));
  const qs = qsEllipse.concat(qsWipe.slice(1));

  const tempGeometry = new MembraneBufferGeometry(ps, qs, MEMBRANE_SEGMENT_COUNT);
  tempGeometry.computeVertexNormals();
  form.membraneGeometryInner.copy(tempGeometry);
  reverseNormals(tempGeometry);
  form.membraneGeometryOuter.copy(tempGeometry);
  tempGeometry.dispose();
};

const updateShrinkingForm = form => {

  form.ellipseCurveP.aStartAngle -= ELLIPSE_ROTATION_DELTA;
  form.ellipseCurveQ.aStartAngle -= ELLIPSE_ROTATION_DELTA;

  const ellipsePointsPVec2 = form.ellipseCurveP.getPoints(ELLIPSE_POINT_COUNT);
  const ellipsePointsQVec2 = form.ellipseCurveQ.getPoints(ELLIPSE_POINT_COUNT);

  const currentAngle = form.ellipseCurveQ.aStartAngle;

  const angleOffset = Math.abs(currentAngle - START_ANGLE);
  const angleOffset2 = angleOffset < Math.PI ? angleOffset : 2 * Math.PI - angleOffset;
  const normalisingFactor = 1 / ANGLE_OFFSET_THRESHOLD;
  const alpha = angleOffset2 > ANGLE_OFFSET_THRESHOLD ? 1.0 : (angleOffset2 * normalisingFactor);
  const angle1 = currentAngle + DELTA_ANGLE * alpha;
  const angle2 = currentAngle - DELTA_ANGLE * alpha;

  let wipePointsPVec2;
  let wipePointsQVec2;

  {
    const e = form.ellipseCurveP;
    const w = form.wipeCurveP;
    const startingPoint = new THREE.Vector2(e.aX + e.xRadius * Math.cos(e.aStartAngle), e.aY + e.yRadius * Math.sin(e.aStartAngle));
    const centrePoint = new THREE.Vector2(e.aX, e.aY);
    const endingPoint = startingPoint.clone().lerp(centrePoint, alpha);
    const pt1 = new THREE.Vector2(e.aX + e.xRadius * Math.cos(angle1), e.aY + e.yRadius * Math.sin(angle1));
    const pt2 = new THREE.Vector2(e.aX + e.xRadius * Math.cos(angle2), e.aY + e.yRadius * Math.sin(angle2));
    const controlPoint1 = pt1.lerp(endingPoint, 0.25);
    const controlPoint2 = pt2.lerp(endingPoint, 0.75);
    w.v0.copy(startingPoint);
    w.v1.copy(controlPoint1);
    w.v2.copy(controlPoint2);
    w.v3.copy(endingPoint);
    wipePointsPVec2 = w.getPoints(WIPE_POINT_COUNT);
  }

  {
    const e = form.ellipseCurveQ;
    const w = form.wipeCurveQ;
    const startingPoint = new THREE.Vector2(e.aX + e.xRadius * Math.cos(e.aStartAngle), e.aY + e.yRadius * Math.sin(e.aStartAngle));
    const centrePoint = new THREE.Vector2(e.aX, e.aY);
    const endingPoint = startingPoint.clone().lerp(centrePoint, alpha);
    const pt1 = new THREE.Vector2(e.aX + e.xRadius * Math.cos(angle1), e.aY + e.yRadius * Math.sin(angle1));
    const pt2 = new THREE.Vector2(e.aX + e.xRadius * Math.cos(angle2), e.aY + e.yRadius * Math.sin(angle2));
    const controlPoint1 = pt1.lerp(endingPoint, 0.25);
    const controlPoint2 = pt2.lerp(endingPoint, 0.75);
    w.v0.copy(startingPoint);
    w.v1.copy(controlPoint1);
    w.v2.copy(controlPoint2);
    w.v3.copy(endingPoint);
    wipePointsQVec2 = w.getPoints(WIPE_POINT_COUNT);
    const wipePointsQArr = wipePointsQVec2.map(vec2 => vec2.toArray());
    const ellipsePointsQArr = ellipsePointsQVec2.map(vec2 => vec2.toArray());
    const combinedLinePointsQArr = ellipsePointsQArr.reverse().concat(wipePointsQArr.slice(1));
    form.lineGeometryQ.update(combinedLinePointsQArr);
  }

  const psEllipse = ellipsePointsPVec2.map(vec2 => new THREE.Vector3(vec2.x, vec2.y, MEMBRANE_LENGTH));
  const qsEllipse = ellipsePointsQVec2.map(vec2 => new THREE.Vector3(vec2.x, vec2.y, 0));
  const psWipe = wipePointsPVec2.map(vec2 => new THREE.Vector3(vec2.x, vec2.y, MEMBRANE_LENGTH));
  const qsWipe = wipePointsQVec2.map(vec2 => new THREE.Vector3(vec2.x, vec2.y, 0));
  const ps = psEllipse.reverse().concat(psWipe.slice(1)).reverse();
  const qs = qsEllipse.reverse().concat(qsWipe.slice(1)).reverse();

  const tempGeometry = new MembraneBufferGeometry(ps, qs, MEMBRANE_SEGMENT_COUNT);
  tempGeometry.computeVertexNormals();
  form.membraneGeometryInner.copy(tempGeometry);
  reverseNormals(tempGeometry);
  form.membraneGeometryOuter.copy(tempGeometry);
  tempGeometry.dispose();
};

window.addEventListener("resize", () => {
  renderer.setSize(container.offsetWidth, container.offsetHeight);
  camera.aspect = container.offsetWidth / container.offsetHeight;
  camera.updateProjectionMatrix();
});

const onDocumentKeyDownHandler = ev => {

  if (ev.key === 'a') {
    if (axesHelper) {
      scene.remove(axesHelper);
      axesHelper = undefined;
    } else {
      axesHelper = new THREE.AxesHelper(5);
      scene.add(axesHelper);
    }
  }

  if (ev.key === 'c') {
    console.log(`camera.position: ${JSON.stringify(camera.position)}`);
    console.log(`controls.target: ${JSON.stringify(controls.target)}`);
  }

  if (ev.key === 'p') {
    currentFavouritePositionIndex++;
    currentFavouritePositionIndex %= FAVOURITE_POSITIONS.length;
    camera.position.copy(FAVOURITE_POSITIONS[currentFavouritePositionIndex].cameraPosition);
    controls.target.copy(FAVOURITE_POSITIONS[currentFavouritePositionIndex].controlsTarget);
  }

  if (ev.key === 'r') {
    controls.autoRotate = !controls.autoRotate;
  }

  if (ev.key === 's') {
    if (spotLightLHelper) {
      scene.remove(spotLightLHelper);
      scene.remove(spotLightRHelper);
      spotLightLHelper = undefined;
      spotLightRHelper = undefined;
    }
    else {
      spotLightLHelper = new THREE.SpotLightHelper(spotLightL);
      spotLightRHelper = new THREE.SpotLightHelper(spotLightR);
      scene.add(spotLightLHelper);
      scene.add(spotLightRHelper);
    }
  }

  if (ev.key === 'v') {
    if (membraneMeshLInnerVNH) {
      scene.remove(membraneMeshLInnerVNH);
      scene.remove(membraneMeshLOuterVNH);
      scene.remove(membraneMeshRInnerVNH);
      scene.remove(membraneMeshROuterVNH);
      membraneMeshLInnerVNH = undefined;
      membraneMeshLOuterVNH = undefined;
      membraneMeshRInnerVNH = undefined;
      membraneMeshROuterVNH = undefined;
    }
    else {
      membraneMeshLInnerVNH = new THREE.VertexNormalsHelper(forms[0].membraneMeshInner, 0.1, 0x00ff00);
      membraneMeshLOuterVNH = new THREE.VertexNormalsHelper(forms[0].membraneMeshOuter, 0.1, 0x0000ff);
      membraneMeshRInnerVNH = new THREE.VertexNormalsHelper(forms[1].membraneMeshInner, 0.1, 0x00ff00);
      membraneMeshROuterVNH = new THREE.VertexNormalsHelper(forms[1].membraneMeshOuter, 0.1, 0x0000ff);
      scene.add(membraneMeshLInnerVNH);
      scene.add(membraneMeshLOuterVNH);
      scene.add(membraneMeshRInnerVNH);
      scene.add(membraneMeshROuterVNH);
    }
  }
};

document.addEventListener('keydown', onDocumentKeyDownHandler);

let renderLoopCount = 0;
let swapAtCount = Math.floor(2 * Math.PI / ELLIPSE_ROTATION_DELTA);

const animate = () => {
  window.requestAnimationFrame(animate);
  updateGrowingForm(forms[0]);
  updateShrinkingForm(forms[1]);
  controls.update();
  renderer.render(scene, camera);
  renderLoopCount++;
  if (renderLoopCount === swapAtCount) {
    renderLoopCount = 0;
    forms[0].ellipseCurveP.aX = forms[0].ellipseCurveP.aX === RIGHT_CENTRE_X ? LEFT_CENTRE_X : RIGHT_CENTRE_X;
    forms[0].ellipseCurveQ.aX = forms[0].ellipseCurveQ.aX === RIGHT_CENTRE_X ? LEFT_CENTRE_X : RIGHT_CENTRE_X;
    forms[1].ellipseCurveP.aX = forms[1].ellipseCurveP.aX === RIGHT_CENTRE_X ? LEFT_CENTRE_X : RIGHT_CENTRE_X;
    forms[1].ellipseCurveQ.aX = forms[1].ellipseCurveQ.aX === RIGHT_CENTRE_X ? LEFT_CENTRE_X : RIGHT_CENTRE_X;
    forms[0].ellipseCurveP.aEndAngle = END_ANGLE;
    forms[0].ellipseCurveQ.aEndAngle = END_ANGLE;
    forms[1].ellipseCurveP.aStartAngle = START_ANGLE;
    forms[1].ellipseCurveQ.aStartAngle = START_ANGLE;
  }
  if (membraneMeshLInnerVNH) {
    membraneMeshLInnerVNH.update();
    membraneMeshLOuterVNH.update();
    membraneMeshRInnerVNH.update();
    membraneMeshROuterVNH.update();
  }
};
