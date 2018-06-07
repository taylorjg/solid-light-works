import * as THREE from "three";
import OrbitControls from 'three-orbitcontrols';
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
camera.position.set(-20, -10, 50);
camera.lookAt(0, 0, 0);
scene.add(camera);

const controls = new OrbitControls(camera, renderer.domElement);
controls.minDistance = 0;
controls.maxDistance = 50;
controls.enableDamping = true;
controls.dampingFactor = 0.9;
controls.autoRotate = false;

const textureLoader = new THREE.TextureLoader();
const texture = textureLoader.load('blue-colored-smoke-texture-1.jpg');

const textureMaterial = new THREE.MeshBasicMaterial({
  map: texture,
  color: 0x00dddd,
  transparent: true,
  opacity: 0.6,
});

// ------------
// Left ellipse
// ------------

const fudgeFactor = Math.PI / 180;
const leftStartAngle = 1.5 * Math.PI + fudgeFactor;
const leftEndAngle = 3.5 * Math.PI;

const ellipseCurveLP = new THREE.EllipseCurve(-4, 1, 2.4 / 20, 2 / 20, leftStartAngle, leftEndAngle, true);
const ellipsePointsLPVec2 = ellipseCurveLP.getPoints(500);

const ellipseCurveLQ = new THREE.EllipseCurve(-4, 2.6, 2.4, 2, leftStartAngle, leftEndAngle, true);
const ellipsePointsLQVec2 = ellipseCurveLQ.getPoints(500);
const ellipsePointsLQArr = ellipsePointsLQVec2.map(vec2 => vec2.toArray());

const ellipseGemoetryL = Line(ellipsePointsLQArr);
const ellipseMaterialL = new THREE.ShaderMaterial(
  BasicShader({
    side: THREE.DoubleSide,
    diffuse: 0x5cd7ff,
    thickness: 0.1
  }));
const ellipseMeshL = new THREE.Mesh(ellipseGemoetryL, ellipseMaterialL);
scene.add(ellipseMeshL);

const lps = ellipsePointsLPVec2.map(vec2 => new THREE.Vector3(vec2.x, vec2.y, 15));
const lqs = ellipsePointsLQVec2.map(vec2 => new THREE.Vector3(vec2.x, vec2.y, 0));

// -------------
// Right ellipse
// -------------

const rightStartAngle = 1.5 * Math.PI;
const rightEndAngle = 3.5 * Math.PI;

const ellipseCurveRP = new THREE.EllipseCurve(4, 1, 2.4 / 20, 2 / 20, rightStartAngle, rightEndAngle, true);
const ellipsePointsRPVec2 = ellipseCurveRP.getPoints(500);

const ellipseCurveRQ = new THREE.EllipseCurve(4, 2.6, 2.4, 2, rightStartAngle, rightEndAngle, true);
const ellipsePointsRQVec2 = ellipseCurveRQ.getPoints(500);
const ellipsePointsRQArr = ellipsePointsRQVec2.map(vec2 => vec2.toArray());

const ellipseGemoetryR = Line(ellipsePointsRQArr);
const ellipseMaterialR = new THREE.ShaderMaterial(
  BasicShader({
    side: THREE.DoubleSide,
    diffuse: 0x5cd7ff,
    thickness: 0.1
  }));

const ellipseMeshR = new THREE.Mesh(ellipseGemoetryR, ellipseMaterialR);
scene.add(ellipseMeshR);

const rps = ellipsePointsRPVec2.map(vec2 => new THREE.Vector3(vec2.x, vec2.y, 15));
const rqs = ellipsePointsRQVec2.map(vec2 => new THREE.Vector3(vec2.x, vec2.y, 0));

// -------------
// Left membrane
// -------------

const leftMembraneGeometry = new MembraneBufferGeometry(lps, lqs, 50);
const leftMembraneMesh = new THREE.Mesh(leftMembraneGeometry, textureMaterial);
scene.add(leftMembraneMesh);

// --------------
// Right membrane
// -------------=

const rightMembraneGeometry = new MembraneBufferGeometry(rps, rqs, 50);
const rightMembraneMesh = new THREE.Mesh(rightMembraneGeometry, textureMaterial);
scene.add(rightMembraneMesh);

// ---------
// Animation
// ---------

const updateLeftForm = () => {
  ellipseCurveLQ.aEndAngle -= Math.PI / (180 * 60);
  const ellipsePointsLQVec2 = ellipseCurveLQ.getPoints(500);
  const ellipsePointsLQArr = ellipsePointsLQVec2.map(vec2 => vec2.toArray());
  ellipseGemoetryL.update(ellipsePointsLQArr);
};

const updateRightForm = () => {
  ellipseCurveRQ.aStartAngle -= Math.PI / (180 * 60);
  const ellipsePointsRQVec2 = ellipseCurveRQ.getPoints(500);
  const ellipsePointsRQArr = ellipsePointsRQVec2.map(vec2 => vec2.toArray());
  ellipseGemoetryR.update(ellipsePointsRQArr);
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
