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
// camera.position.set(-15, 2, 15);
camera.position.set(5, 3, -14);
scene.add(camera);

// const axesHelper = new THREE.AxesHelper(5);
// scene.add(axesHelper);

const controls = new OrbitControls(camera, renderer.domElement);
controls.target = new THREE.Vector3(0, 2, 0);
controls.minDistance = 0;
controls.maxDistance = 50;
controls.enableDamping = true;
controls.dampingFactor = 0.9;
controls.autoRotate = false;

const textureLoader = new THREE.TextureLoader();
const texture = textureLoader.load("smoke-texture.jpg");

const textureMaterial = new THREE.MeshBasicMaterial({
  map: texture,
  color: 0x00dddd,
  transparent: true,
  opacity: 0.6,
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
const ELLIPSE_THICKNESS = 0.04;
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
    // diffuse: 0x5cd7ff,
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
    // diffuse: 0x5cd7ff,
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
const leftMembraneMesh = new THREE.Mesh(leftMembraneGeometry, textureMaterial);
scene.add(leftMembraneMesh);

// --------------
// Right membrane
// -------------=

const rightMembraneGeometry = new MembraneBufferGeometry(rps, rqs, MEMBRANE_SEGMENT_COUNT);
const rightMembraneMesh = new THREE.Mesh(rightMembraneGeometry, textureMaterial);
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
  const leftMembraneGeometry = new MembraneBufferGeometry(lps, lqs, MEMBRANE_SEGMENT_COUNT);
  leftMembraneMesh.geometry.copy(leftMembraneGeometry);
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
  const rightMembraneGeometry = new MembraneBufferGeometry(rps, rqs, MEMBRANE_SEGMENT_COUNT);
  rightMembraneMesh.geometry.copy(rightMembraneGeometry);
};

window.addEventListener("resize", () => {
  renderer.setSize(container.offsetWidth, container.offsetHeight);
  camera.aspect = container.offsetWidth / container.offsetHeight;
  camera.updateProjectionMatrix();
});

const animate = () => {
  window.requestAnimationFrame(animate);
  updateLeftForm();
  updateRightForm();
  controls.update();
  renderer.render(scene, camera);
};

animate();
