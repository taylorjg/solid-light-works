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
const camera = new THREE.PerspectiveCamera(40, w / h, 0.1, 1000);
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

const screenGeometry = new THREE.PlaneGeometry(16, 6);
screenGeometry.translate(0, 3, 0);
const screenMaterial = new THREE.MeshBasicMaterial({
  color: 0xA0A0A0,
  side: THREE.DoubleSide,
  transparent: true,
  opacity: 0.2
});
const screen = new THREE.Mesh(screenGeometry, screenMaterial);
scene.add(screen);

const textureLoader = new THREE.TextureLoader();
const hazeTexture = textureLoader.load("haze.jpg");

const hazeTextureMaterial = new THREE.MeshBasicMaterial({
  map: hazeTexture,
  color: 0x00dddd,
  transparent: true,
  opacity: 0.6
});

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
const ELLIPSE_POINT_COUNT = 500;
const ELLIPSE_ROTATION_DELTA = Math.PI / (180 * 20);

const MEMBRANE_LENGTH = 10;
const MEMBRANE_SEGMENT_COUNT = 50;

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
const ellipsePointsLPVec2 = ellipseCurveLP.getPoints(ELLIPSE_POINT_COUNT);

const ellipseCurveLQ = new THREE.EllipseCurve(
  LEFT_CENTRE_X,
  LEFT_CENTRE_Q_Y,
  ELLIPSE_RADIUS_Q_X,
  ELLIPSE_RADIUS_Q_Y,
  LEFT_START_ANGLE,
  LEFT_END_ANGLE,
  ELLIPSE_CLOCKWISE);
const ellipsePointsLQVec2 = ellipseCurveLQ.getPoints(ELLIPSE_POINT_COUNT);
const ellipsePointsLQArr = ellipsePointsLQVec2.map(vec2 => vec2.toArray());

const ellipseGemoetryL = Line(ellipsePointsLQArr);
const ellipseMaterialL = new THREE.ShaderMaterial(
  BasicShader({
    side: THREE.DoubleSide,
    diffuse: 0xffffff,
    thickness: ELLIPSE_THICKNESS
  }));
const ellipseMeshL = new THREE.Mesh(ellipseGemoetryL, ellipseMaterialL);
scene.add(ellipseMeshL);

const lps = ellipsePointsLPVec2.map(vec2 => new THREE.Vector3(vec2.x, vec2.y, MEMBRANE_LENGTH));
const lqs = ellipsePointsLQVec2.map(vec2 => new THREE.Vector3(vec2.x, vec2.y, 0));

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
const ellipsePointsRPVec2 = ellipseCurveRP.getPoints(ELLIPSE_POINT_COUNT);

const ellipseCurveRQ = new THREE.EllipseCurve(
  RIGHT_CENTRE_X,
  RIGHT_CENTRE_Q_Y,
  ELLIPSE_RADIUS_Q_X,
  ELLIPSE_RADIUS_Q_Y,
  RIGHT_START_ANGLE,
  RIGHT_END_ANGLE,
  ELLIPSE_CLOCKWISE);
const ellipsePointsRQVec2 = ellipseCurveRQ.getPoints(ELLIPSE_POINT_COUNT);
const ellipsePointsRQArr = ellipsePointsRQVec2.map(vec2 => vec2.toArray());

const ellipseGemoetryR = Line(ellipsePointsRQArr);
const ellipseMaterialR = new THREE.ShaderMaterial(
  BasicShader({
    side: THREE.DoubleSide,
    diffuse: 0xffffff,
    thickness: ELLIPSE_THICKNESS
  }));

const ellipseMeshR = new THREE.Mesh(ellipseGemoetryR, ellipseMaterialR);
scene.add(ellipseMeshR);

const rps = ellipsePointsRPVec2.map(vec2 => new THREE.Vector3(vec2.x, vec2.y, MEMBRANE_LENGTH));
const rqs = ellipsePointsRQVec2.map(vec2 => new THREE.Vector3(vec2.x, vec2.y, 0));

// -------------
// Left membrane
// -------------

const leftMembraneGeometry = new MembraneBufferGeometry(lps, lqs, MEMBRANE_SEGMENT_COUNT);
const leftMembraneMesh = new THREE.Mesh(leftMembraneGeometry, hazeTextureMaterial);
scene.add(leftMembraneMesh);

// --------------
// Right membrane
// -------------=

const rightMembraneGeometry = new MembraneBufferGeometry(rps, rqs, MEMBRANE_SEGMENT_COUNT);
const rightMembraneMesh = new THREE.Mesh(rightMembraneGeometry, hazeTextureMaterial);
scene.add(rightMembraneMesh);

// ---------
// Animation
// ---------

const updateLeftForm = () => {

  ellipseCurveLP.aEndAngle -= ELLIPSE_ROTATION_DELTA;
  ellipseCurveLQ.aEndAngle -= ELLIPSE_ROTATION_DELTA;

  const ellipsePointsLPVec2 = ellipseCurveLP.getPoints(ELLIPSE_POINT_COUNT);
  const ellipsePointsLQVec2 = ellipseCurveLQ.getPoints(ELLIPSE_POINT_COUNT);

  const ellipsePointsLQArr = ellipsePointsLQVec2.map(vec2 => vec2.toArray());
  ellipseGemoetryL.update(ellipsePointsLQArr);

  const lps = ellipsePointsLPVec2.map(vec2 => new THREE.Vector3(vec2.x, vec2.y, MEMBRANE_LENGTH));
  const lqs = ellipsePointsLQVec2.map(vec2 => new THREE.Vector3(vec2.x, vec2.y, 0));
  const tempGeometry = new MembraneBufferGeometry(lps, lqs, MEMBRANE_SEGMENT_COUNT);
  leftMembraneMesh.geometry.copy(tempGeometry);
  tempGeometry.dispose();
};

const updateRightForm = () => {

  ellipseCurveRP.aStartAngle -= ELLIPSE_ROTATION_DELTA;
  ellipseCurveRQ.aStartAngle -= ELLIPSE_ROTATION_DELTA;

  const ellipsePointsRPVec2 = ellipseCurveRP.getPoints(ELLIPSE_POINT_COUNT);
  const ellipsePointsRQVec2 = ellipseCurveRQ.getPoints(ELLIPSE_POINT_COUNT);

  const ellipsePointsRQArr = ellipsePointsRQVec2.map(vec2 => vec2.toArray());
  ellipseGemoetryR.update(ellipsePointsRQArr);

  const rps = ellipsePointsRPVec2.map(vec2 => new THREE.Vector3(vec2.x, vec2.y, MEMBRANE_LENGTH));
  const rqs = ellipsePointsRQVec2.map(vec2 => new THREE.Vector3(vec2.x, vec2.y, 0));
  const tempGeometry = new MembraneBufferGeometry(rps, rqs, MEMBRANE_SEGMENT_COUNT);
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
  renderer.render(scene, camera);
};

animate();
