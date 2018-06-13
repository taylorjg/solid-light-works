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

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(45, w / h, 0.1, 50);
camera.position.set(0.75, 6.46, 18.73);
// camera.position.set(-11.30, 5.74, 14.44);
scene.add(camera);

// const axesHelper = new THREE.AxesHelper(5);
// scene.add(axesHelper);

const controls = new OrbitControls(camera, renderer.domElement);
controls.target = new THREE.Vector3(-0.14, 2.00, 2.85);
controls.minDistance = 0;
controls.maxDistance = 50;
controls.enableDamping = true;
controls.dampingFactor = 0.9;
controls.autoRotate = false;

const projectionScreenGeometry = new THREE.PlaneGeometry(16, 6, 100, 100);
projectionScreenGeometry.translate(0, 3, 0);
const projectionScreenMaterial = new THREE.MeshBasicMaterial({
  color: 0xA0A0A0,
  // side: THREE.DoubleSide,
  transparent: true,
  opacity: 0.2
});
const screen = new THREE.Mesh(projectionScreenGeometry, projectionScreenMaterial);
scene.add(screen);

// -------------------
// Sizes and positions
// -------------------

const FUDGE_FACTOR = Math.PI / 180;
const LEFT_START_ANGLE = 1.5 * Math.PI + FUDGE_FACTOR;
const LEFT_END_ANGLE = 3.5 * Math.PI;
const LEFT_CENTRE_X = -4;
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

// ------------
// Left ellipse
// ------------

const ellipseCurveLP = new THREE.EllipseCurve(
  LEFT_CENTRE_X,
  LEFT_CENTRE_P_Y,
  ELLIPSE_RADIUS_P,
  ELLIPSE_RADIUS_P,
  LEFT_START_ANGLE,
  LEFT_END_ANGLE,
  ELLIPSE_CLOCKWISE);

const ellipseCurveLQ = new THREE.EllipseCurve(
  LEFT_CENTRE_X,
  LEFT_CENTRE_Q_Y,
  ELLIPSE_RADIUS_Q_X,
  ELLIPSE_RADIUS_Q_Y,
  LEFT_START_ANGLE,
  LEFT_END_ANGLE,
  ELLIPSE_CLOCKWISE);

const ellipseLineGeometryLP = Line();
const ellipseLineGeometryLQ = Line();
const ellipseMeshL = new THREE.Mesh(ellipseLineGeometryLQ, ellipseMaterial);

// -------------
// Right ellipse
// -------------

const ellipseCurveRP = new THREE.EllipseCurve(
  RIGHT_CENTRE_X,
  RIGHT_CENTRE_P_Y,
  ELLIPSE_RADIUS_P,
  ELLIPSE_RADIUS_P,
  RIGHT_START_ANGLE,
  RIGHT_END_ANGLE,
  ELLIPSE_CLOCKWISE);

const ellipseCurveRQ = new THREE.EllipseCurve(
  RIGHT_CENTRE_X,
  RIGHT_CENTRE_Q_Y,
  ELLIPSE_RADIUS_Q_X,
  ELLIPSE_RADIUS_Q_Y,
  RIGHT_START_ANGLE,
  RIGHT_END_ANGLE,
  ELLIPSE_CLOCKWISE);

const ellipseLineGeometryRP = Line();
const ellipseLineGeometryRQ = Line();
const ellipseMeshR = new THREE.Mesh(ellipseLineGeometryRQ, ellipseMaterial);

// --------------------------------
// Membrane spotlights (projectors)
// --------------------------------

const spotLightTargetL = new THREE.Object3D();
spotLightTargetL.position.set(LEFT_CENTRE_X, LEFT_CENTRE_Q_Y, 0);
scene.add(spotLightTargetL);
const spotLightL = new THREE.SpotLight(0xffffff, 200, MEMBRANE_LENGTH * 3, 22 * Math.PI / 180, 0);
spotLightL.position.set(LEFT_CENTRE_X, LEFT_CENTRE_P_Y, MEMBRANE_LENGTH);
spotLightL.target = spotLightTargetL;
scene.add(spotLightL);

const spotLightTargetR = new THREE.Object3D();
spotLightTargetR.position.set(RIGHT_CENTRE_X, RIGHT_CENTRE_Q_Y, 0);
scene.add(spotLightTargetR);
const spotLightR = new THREE.SpotLight(0xffffff, 200, MEMBRANE_LENGTH * 3, 22 * Math.PI / 180, 0);
spotLightR.position.set(RIGHT_CENTRE_X, RIGHT_CENTRE_P_Y, MEMBRANE_LENGTH);
spotLightR.target = spotLightTargetR;
scene.add(spotLightR);

// const sideSpotTarget = new THREE.Object3D();
// sideSpotTarget.position.set(0, 0, MEMBRANE_LENGTH / 2);
// scene.add(sideSpotTarget);
// const sideSpot = new THREE.SpotLight(0xffffff, 200);
// sideSpot.position.set(0, 10, MEMBRANE_LENGTH / 2);
// sideSpot.target = sideSpotTarget;
// scene.add(sideSpot);

let leftMembraneMesh;
let rightMembraneMesh;
let leftVertexNormalsHelper;
let rightVertexNormalsHelper;

const onTextureLoaded = hazeTexture => {

  scene.add(ellipseMeshL);
  scene.add(ellipseMeshR);

  const hazeTextureMaterial = new THREE.MeshLambertMaterial({
    map: hazeTexture,
    // side: THREE.DoubleSide,
    // color: 0x00dddd,
    color: 0xffffff,
    transparent: true,
    opacity: 0.8
  });

  // -------------
  // Left membrane
  // -------------

  const leftMembraneGeometry = new MembraneBufferGeometry();
  leftMembraneMesh = new THREE.Mesh(leftMembraneGeometry, hazeTextureMaterial);
  scene.add(leftMembraneMesh);

  // --------------
  // Right membrane
  // --------------

  const rightMembraneGeometry = new MembraneBufferGeometry();
  rightMembraneMesh = new THREE.Mesh(rightMembraneGeometry, hazeTextureMaterial);
  scene.add(rightMembraneMesh);

  animate();
};

const textureLoader = new THREE.TextureLoader();
textureLoader.load("haze.jpg", onTextureLoaded);

// ---------
// Animation
// ---------

let doOnceDone = false;

const getPointsFromLineGeometry = (lineGeometry, z) => {
  const positionAttribute = lineGeometry.getAttribute("position");
  const array = positionAttribute.array;
  const points = [];
  for (let i = 0; i < array.length; i += positionAttribute.itemSize) {
    const x = array[i];
    const y = array[i + 1];
    points.push(new THREE.Vector3(x, y, z));
  }
  return points;
};

const updateLeftForm = () => {

  ellipseCurveLP.aEndAngle -= ELLIPSE_ROTATION_DELTA;
  ellipseCurveLQ.aEndAngle -= ELLIPSE_ROTATION_DELTA;

  const ellipsePointsLPVec2 = ellipseCurveLP.getPoints(ELLIPSE_POINT_COUNT);
  const ellipsePointsLQVec2 = ellipseCurveLQ.getPoints(ELLIPSE_POINT_COUNT);

  const ellipsePointsLPArr = ellipsePointsLPVec2.map(vec2 => vec2.toArray());
  const ellipsePointsLQArr = ellipsePointsLQVec2.map(vec2 => vec2.toArray());

  ellipseLineGeometryLP.update(ellipsePointsLPArr);
  ellipseLineGeometryLQ.update(ellipsePointsLQArr);

  const ps = ellipsePointsLPVec2.map(vec2 => new THREE.Vector3(vec2.x, vec2.y, MEMBRANE_LENGTH));
  const qs = ellipsePointsLQVec2.map(vec2 => new THREE.Vector3(vec2.x, vec2.y, 0));
  // const ps = getPointsFromLineGeometry(ellipseLineGeometryLP, MEMBRANE_LENGTH);
  // const qs = getPointsFromLineGeometry(ellipseLineGeometryLQ, 0);
  const tempGeometry = new MembraneBufferGeometry(ps, qs, MEMBRANE_SEGMENT_COUNT);
  tempGeometry.computeVertexNormals();
  leftMembraneMesh.geometry.copy(tempGeometry);
  tempGeometry.dispose();
};

const updateRightForm = () => {

  ellipseCurveRP.aStartAngle -= ELLIPSE_ROTATION_DELTA;
  ellipseCurveRQ.aStartAngle -= ELLIPSE_ROTATION_DELTA;

  const ellipsePointsRPVec2 = ellipseCurveRP.getPoints(ELLIPSE_POINT_COUNT);
  const ellipsePointsRQVec2 = ellipseCurveRQ.getPoints(ELLIPSE_POINT_COUNT);

  const ellipsePointsRPArr = ellipsePointsRPVec2.map(vec2 => vec2.toArray());
  const ellipsePointsRQArr = ellipsePointsRQVec2.map(vec2 => vec2.toArray());

  ellipseLineGeometryRP.update(ellipsePointsRPArr);
  ellipseLineGeometryRQ.update(ellipsePointsRQArr);

  const ps = ellipsePointsRPVec2.map(vec2 => new THREE.Vector3(vec2.x, vec2.y, MEMBRANE_LENGTH));
  const qs = ellipsePointsRQVec2.map(vec2 => new THREE.Vector3(vec2.x, vec2.y, 0));
  // const ps = getPointsFromLineGeometry(ellipseLineGeometryRP, MEMBRANE_LENGTH);
  // const qs = getPointsFromLineGeometry(ellipseLineGeometryRQ, 0);
  const tempGeometry = new MembraneBufferGeometry(ps, qs, MEMBRANE_SEGMENT_COUNT);
  tempGeometry.computeVertexNormals();
  rightMembraneMesh.geometry.copy(tempGeometry);
  tempGeometry.dispose();
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
};

document.addEventListener('keydown', onDocumentKeyDownHandler);

const animate = () => {
  window.requestAnimationFrame(animate);
  updateLeftForm();
  updateRightForm();
  controls.update();
  if (!doOnceDone) {
    doOnceDone = true;
    leftVertexNormalsHelper = new THREE.VertexNormalsHelper(leftMembraneMesh, 0.1, 0x00ff00);
    rightVertexNormalsHelper = new THREE.VertexNormalsHelper(rightMembraneMesh, 0.1, 0x00ff00);
    scene.add(leftVertexNormalsHelper);
    scene.add(rightVertexNormalsHelper);
  }
  if (leftVertexNormalsHelper) {
    leftVertexNormalsHelper.update();
  }
  if (rightVertexNormalsHelper) {
    rightVertexNormalsHelper.update();
  }
  renderer.render(scene, camera);
};
