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
    cameraPosition: new THREE.Vector3(-21.88, 9.81, 14.97),
    controlsTarget: new THREE.Vector3(1.85, 2.00, 9.08)
  },
  {
    cameraPosition: new THREE.Vector3(5.90, 3.09, -7.70),
    controlsTarget: new THREE.Vector3(-2.58, 2.00, 8.05)
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

const LEFT_START_ANGLE = 1.5 * Math.PI;
const LEFT_END_ANGLE = 3.5 * Math.PI;
const LEFT_CENTRE_X = -3.5;
const LEFT_CENTRE_P_Y = 1;
const LEFT_CENTRE_Q_Y = 2.6;

const RIGHT_START_ANGLE = 1.5 * Math.PI;
const RIGHT_END_ANGLE = 3.5 * Math.PI;
const RIGHT_CENTRE_X = -LEFT_CENTRE_X;
const RIGHT_CENTRE_P_Y = LEFT_CENTRE_P_Y;
const RIGHT_CENTRE_Q_Y = LEFT_CENTRE_Q_Y;

const ELLIPSE_RADIUS_Q_X = 2.8;
const ELLIPSE_RADIUS_Q_Y = 2;
const ELLIPSE_RADIUS_P = ELLIPSE_RADIUS_Q_Y / 20;
const ELLIPSE_THICKNESS = 0.08;
const ELLIPSE_CLOCKWISE = true;
const ELLIPSE_POINT_COUNT = 100; // 500;
const ELLIPSE_ROTATION_DELTA = Math.PI / (180 * 10);

const MEMBRANE_LENGTH = 20;
const MEMBRANE_SEGMENT_COUNT = 10; // 50;

const ellipseMaterial = new THREE.ShaderMaterial(
  BasicShader({
    side: THREE.DoubleSide,
    diffuse: 0xffffff,
    thickness: ELLIPSE_THICKNESS
  }));

const forms = [
  // initially left & growing
  {
    ellipseCurveP: undefined,
    ellipseCurveQ: undefined,
    ellipseLineGeometryQ: undefined,
    membraneGeometryInner: undefined,
    membraneGeometryOuter: undefined,
    ellipseLineMeshQ: undefined,
    membraneMeshInner: undefined,
    membraneMeshOuter: undefined
  },
  // initially right & shrinking
  {
    ellipseCurveP: undefined,
    ellipseCurveQ: undefined,
    ellipseLineGeometryQ: undefined,
    membraneGeometryInner: undefined,
    membraneGeometryOuter: undefined,
    ellipseLineMeshQ: undefined,
    membraneMeshInner: undefined,
    membraneMeshOuter: undefined
  }
];

let axesHelper = undefined;
let membraneMeshLInnerVNH = undefined;
let membraneMeshLOuterVNH = undefined;
let membraneMeshRInnerVNH = undefined;
let membraneMeshROuterVNH = undefined;
// let spotLightLHelper = undefined;
// let spotLightRHelper = undefined;
// let spotLightRH1Helper = undefined;

// ------------------------------------
// Left ellipse (nothing => everything)
// ------------------------------------

forms[0].ellipseCurveP = new THREE.EllipseCurve(
  LEFT_CENTRE_X,
  LEFT_CENTRE_P_Y,
  ELLIPSE_RADIUS_P,
  ELLIPSE_RADIUS_P,
  LEFT_START_ANGLE,
  LEFT_END_ANGLE,
  ELLIPSE_CLOCKWISE);

forms[0].ellipseCurveQ = new THREE.EllipseCurve(
  LEFT_CENTRE_X,
  LEFT_CENTRE_Q_Y,
  ELLIPSE_RADIUS_Q_X,
  ELLIPSE_RADIUS_Q_Y,
  LEFT_START_ANGLE,
  LEFT_END_ANGLE,
  ELLIPSE_CLOCKWISE);

forms[0].ellipseLineGeometryQ = Line();
forms[0].ellipseLineMeshQ = new THREE.Mesh(forms[0].ellipseLineGeometryQ, ellipseMaterial);
scene.add(forms[0].ellipseLineMeshQ);

// -------------------------------------
// Right ellipse (everything => nothing)
// -------------------------------------

forms[1].ellipseCurveP = new THREE.EllipseCurve(
  RIGHT_CENTRE_X,
  RIGHT_CENTRE_P_Y,
  ELLIPSE_RADIUS_P,
  ELLIPSE_RADIUS_P,
  RIGHT_START_ANGLE,
  RIGHT_END_ANGLE,
  ELLIPSE_CLOCKWISE);

forms[1].ellipseCurveQ = new THREE.EllipseCurve(
  RIGHT_CENTRE_X,
  RIGHT_CENTRE_Q_Y,
  ELLIPSE_RADIUS_Q_X,
  ELLIPSE_RADIUS_Q_Y,
  RIGHT_START_ANGLE,
  RIGHT_END_ANGLE,
  ELLIPSE_CLOCKWISE);

forms[1].ellipseLineGeometryQ = Line();
forms[1].ellipseLineMeshQ = new THREE.Mesh(forms[1].ellipseLineGeometryQ, ellipseMaterial);
scene.add(forms[1].ellipseLineMeshQ);

// --------------------------------
// Membrane spotlights (projectors)
// --------------------------------

const spotLightTargetL = new THREE.Object3D();
spotLightTargetL.position.set(LEFT_CENTRE_X, LEFT_CENTRE_Q_Y, 0);
scene.add(spotLightTargetL);
const spotLightL = new THREE.SpotLight(0xffffff, 200, MEMBRANE_LENGTH * 2, 19 * Math.PI / 180, 0);
spotLightL.position.set(LEFT_CENTRE_X, LEFT_CENTRE_P_Y, MEMBRANE_LENGTH);
spotLightL.target = spotLightTargetL;
scene.add(spotLightL);

const spotLightTargetR = new THREE.Object3D();
spotLightTargetR.position.set(RIGHT_CENTRE_X, RIGHT_CENTRE_Q_Y, 0);
scene.add(spotLightTargetR);
const spotLightR = new THREE.SpotLight(0xffffff, 200, MEMBRANE_LENGTH * 1.02, 19 * Math.PI / 180, 0);
spotLightR.position.set(RIGHT_CENTRE_X, RIGHT_CENTRE_P_Y, MEMBRANE_LENGTH);
spotLightR.target = spotLightTargetR;
scene.add(spotLightR);

// const spotLightTargetRH1 = new THREE.Object3D();
// spotLightTargetRH1.position.set(RIGHT_CENTRE_X, RIGHT_CENTRE_Q_Y + ELLIPSE_RADIUS_Q_Y, 0);
// scene.add(spotLightTargetRH1);
// const spotLightRH1 = new THREE.SpotLight(0xffffff, 1000, MEMBRANE_LENGTH * 2, 0.5 * Math.PI / 180);
// spotLightRH1.position.set(RIGHT_CENTRE_X, RIGHT_CENTRE_P_Y, MEMBRANE_LENGTH);
// spotLightRH1.target = spotLightTargetRH1;
// scene.add(spotLightRH1);

const onTextureLoaded = hazeTexture => {

  const membraneTextureMaterialOuter = new THREE.MeshLambertMaterial({
    map: hazeTexture,
    side: THREE.BackSide,
    color: 0xffffff,
    transparent: false,
    opacity: 0.8
  });

  const membraneTextureMaterialInner = new THREE.MeshLambertMaterial({
    map: hazeTexture,
    side: THREE.FrontSide,
    color: 0xffffff,
    transparent: false,
    opacity: 0.8
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

const updateGrowingForm = formIndex => {

  const form = forms[formIndex];

  form.ellipseCurveP.aEndAngle -= ELLIPSE_ROTATION_DELTA;
  form.ellipseCurveQ.aEndAngle -= ELLIPSE_ROTATION_DELTA;

  const ellipsePointsLPVec2 = form.ellipseCurveP.getPoints(ELLIPSE_POINT_COUNT);
  const ellipsePointsLQVec2 = form.ellipseCurveQ.getPoints(ELLIPSE_POINT_COUNT);

  const ellipsePointsLQArr = ellipsePointsLQVec2.map(vec2 => vec2.toArray());
  form.ellipseLineGeometryQ.update(ellipsePointsLQArr);

  const ps = ellipsePointsLPVec2.map(vec2 => new THREE.Vector3(vec2.x, vec2.y, MEMBRANE_LENGTH));
  const qs = ellipsePointsLQVec2.map(vec2 => new THREE.Vector3(vec2.x, vec2.y, 0));

  const tempGeometry = new MembraneBufferGeometry(ps, qs, MEMBRANE_SEGMENT_COUNT);
  tempGeometry.computeVertexNormals();
  form.membraneGeometryInner.copy(tempGeometry);
  reverseNormals(tempGeometry);
  form.membraneGeometryOuter.copy(tempGeometry);
  tempGeometry.dispose();
};

const updateShrinkingForm = formIndex => {

  const form = forms[formIndex];

  form.ellipseCurveP.aStartAngle -= ELLIPSE_ROTATION_DELTA;
  form.ellipseCurveQ.aStartAngle -= ELLIPSE_ROTATION_DELTA;

  const ellipsePointsPVec2 = form.ellipseCurveP.getPoints(ELLIPSE_POINT_COUNT);
  const ellipsePointsQVec2 = form.ellipseCurveQ.getPoints(ELLIPSE_POINT_COUNT);

  const ellipsePointsQArr = ellipsePointsQVec2.map(vec2 => vec2.toArray());
  form.ellipseLineGeometryQ.update(ellipsePointsQArr);

  const ps = ellipsePointsPVec2.map(vec2 => new THREE.Vector3(vec2.x, vec2.y, MEMBRANE_LENGTH));
  const qs = ellipsePointsQVec2.map(vec2 => new THREE.Vector3(vec2.x, vec2.y, 0));

  const tempGeometry = new MembraneBufferGeometry(ps, qs, MEMBRANE_SEGMENT_COUNT);
  tempGeometry.computeVertexNormals();
  form.membraneGeometryInner.copy(tempGeometry);
  reverseNormals(tempGeometry);
  form.membraneGeometryOuter.copy(tempGeometry);
  tempGeometry.dispose();

  // spotLightTargetRH1.position.set(qs[0].x, qs[0].y, 0);
  // spotLightTargetRH1.updateMatrixWorld();
};

window.addEventListener("resize", () => {
  renderer.setSize(container.offsetWidth, container.offsetHeight);
  camera.aspect = container.offsetWidth / container.offsetHeight;
  camera.updateProjectionMatrix();
});

const onDocumentKeyDownHandler = ev => {

  if (ev.key === 'c') {
    console.log(`camera.position: ${JSON.stringify(camera.position)}`);
    console.log(`controls.target: ${JSON.stringify(controls.target)}`);
  }

  if (ev.key === 'a') {
    if (axesHelper) {
      scene.remove(axesHelper);
      axesHelper = undefined;
    } else {
      axesHelper = new THREE.AxesHelper(5);
      scene.add(axesHelper);
    }
  }

  // if (ev.key === 's') {
  //   if (spotLightRH1Helper) {
  //     scene.remove(spotLightLHelper);
  //     scene.remove(spotLightRHelper);
  //     scene.remove(spotLightRH1Helper);
  //     spotLightLHelper = undefined;
  //     spotLightRHelper = undefined;
  //     spotLightRH1Helper = undefined;
  //   }
  //   else {
  //     spotLightLHelper = new THREE.SpotLightHelper(spotLightL);
  //     spotLightRHelper = new THREE.SpotLightHelper(spotLightR);
  //     spotLightRH1Helper = new THREE.SpotLightHelper(spotLightRH1);
  //     scene.add(spotLightLHelper);
  //     scene.add(spotLightRHelper);
  //     scene.add(spotLightRH1Helper);
  //   }
  // }

  if (ev.key === 'r') {
    controls.autoRotate = !controls.autoRotate;
  }

  if (ev.key === 'p') {
    currentFavouritePositionIndex++;
    currentFavouritePositionIndex %= FAVOURITE_POSITIONS.length;
    camera.position.copy(FAVOURITE_POSITIONS[currentFavouritePositionIndex].cameraPosition);
    controls.target.copy(FAVOURITE_POSITIONS[currentFavouritePositionIndex].controlsTarget);
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
  updateGrowingForm(0);
  updateShrinkingForm(1);
  controls.update();
  renderer.render(scene, camera);
  renderLoopCount++;
  if (renderLoopCount === swapAtCount) {
    renderLoopCount = 0;
    forms[0].ellipseCurveP.aX = forms[0].ellipseCurveP.aX === RIGHT_CENTRE_X ? LEFT_CENTRE_X : RIGHT_CENTRE_X;
    forms[0].ellipseCurveQ.aX = forms[0].ellipseCurveQ.aX === RIGHT_CENTRE_X ? LEFT_CENTRE_X : RIGHT_CENTRE_X;
    forms[1].ellipseCurveP.aX = forms[1].ellipseCurveP.aX === RIGHT_CENTRE_X ? LEFT_CENTRE_X : RIGHT_CENTRE_X;
    forms[1].ellipseCurveQ.aX = forms[1].ellipseCurveQ.aX === RIGHT_CENTRE_X ? LEFT_CENTRE_X : RIGHT_CENTRE_X;
    forms[0].ellipseCurveP.aEndAngle = LEFT_END_ANGLE;
    forms[0].ellipseCurveQ.aEndAngle = LEFT_END_ANGLE;
    forms[1].ellipseCurveP.aStartAngle = RIGHT_START_ANGLE;
    forms[1].ellipseCurveQ.aStartAngle = RIGHT_START_ANGLE;
  }
  if (membraneMeshLInnerVNH) {
    membraneMeshLInnerVNH.update();
    membraneMeshLOuterVNH.update();
    membraneMeshRInnerVNH.update();
    membraneMeshROuterVNH.update();
  }
};
