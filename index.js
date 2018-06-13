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
camera.position.set(-21.88, 9.81, 14.97);
scene.add(camera);

const controls = new OrbitControls(camera, renderer.domElement);
controls.target = new THREE.Vector3(1.85, 2.00, 9.08);
controls.minDistance = 0;
controls.maxDistance = 50;
controls.enableDamping = true;
controls.dampingFactor = 0.9;
controls.autoRotate = false;

const projectionScreenGeometry = new THREE.PlaneGeometry(16, 6, 100, 100);
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

let leftMembraneOuterMesh;
let leftMembraneInnerMesh;
let rightMembraneOuterMesh;
let rightMembraneInnerMesh;

const onTextureLoaded = hazeTexture => {

  scene.add(ellipseMeshL);
  scene.add(ellipseMeshR);

  const membraneOuterTextureMaterial = new THREE.MeshLambertMaterial({
    map: hazeTexture,
    side: THREE.BackSide,
    color: 0xffffff,
    transparent: true,
    opacity: 0.8
  });

  const membraneInnerTextureMaterial = new THREE.MeshLambertMaterial({
    map: hazeTexture,
    side: THREE.FrontSide,
    color: 0xffffff,
    transparent: true,
    opacity: 0.8
  });

  // -------------
  // Left membrane
  // -------------

  const leftMembraneOuterGeometry = new MembraneBufferGeometry();
  leftMembraneOuterMesh = new THREE.Mesh(leftMembraneOuterGeometry, membraneOuterTextureMaterial);
  scene.add(leftMembraneOuterMesh);

  const leftMembraneInnerGeometry = new MembraneBufferGeometry();
  leftMembraneInnerMesh = new THREE.Mesh(leftMembraneInnerGeometry, membraneInnerTextureMaterial);
  scene.add(leftMembraneInnerMesh);

  // --------------
  // Right membrane
  // --------------

  const rightMembraneOuterGeometry = new MembraneBufferGeometry();
  rightMembraneOuterMesh = new THREE.Mesh(rightMembraneOuterGeometry, membraneOuterTextureMaterial);
  scene.add(rightMembraneOuterMesh);

  const rightMembraneInnerGeometry = new MembraneBufferGeometry();
  rightMembraneInnerMesh = new THREE.Mesh(rightMembraneInnerGeometry, membraneInnerTextureMaterial);
  scene.add(rightMembraneInnerMesh);

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

  const tempGeometry = new MembraneBufferGeometry(ps, qs, MEMBRANE_SEGMENT_COUNT);
  tempGeometry.computeVertexNormals();
  leftMembraneInnerMesh.geometry.copy(tempGeometry);
  reverseNormals(tempGeometry);
  leftMembraneOuterMesh.geometry.copy(tempGeometry);
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

  const tempGeometry = new MembraneBufferGeometry(ps, qs, MEMBRANE_SEGMENT_COUNT);
  tempGeometry.computeVertexNormals();
  rightMembraneInnerMesh.geometry.copy(tempGeometry);
  reverseNormals(tempGeometry);
  rightMembraneOuterMesh.geometry.copy(tempGeometry);
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
