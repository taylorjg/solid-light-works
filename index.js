import * as THREE from "three";
import { MembraneBufferGeometry } from "./MembraneGeometry";
import OrbitControls from 'three-orbitcontrols';
import LineInitFn from "three-line-2d";
import BasicShaderInitFn from "three-line-2d/shaders/basic";
const Line = LineInitFn(THREE);
const BasicShader = BasicShaderInitFn(THREE);

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
  opacity: 0.4,
});


const ellipseCurveRP = new THREE.EllipseCurve(4, 1, 2.4 / 20, 2 / 20, 1.5 * Math.PI, 2 * Math.PI, true);
const ellipsePointsRPVec2 = ellipseCurveRP.getPoints(500);

const ellipseCurveRQ = new THREE.EllipseCurve(4, 2.6, 2.4, 2, 1.5 * Math.PI, 2 * Math.PI, true);
const ellipsePointsRQVec2 = ellipseCurveRQ.getPoints(500);

const ellipsePointsRQArr = ellipsePointsRQVec2.map(vec2 => vec2.toArray());
const ellipseGemoetryRQ = Line(ellipsePointsRQArr);
const ellipseMaterialRQ = new THREE.ShaderMaterial(
  BasicShader({
    side: THREE.DoubleSide,
    diffuse: 0x5cd7ff,
    thickness: 0.1
  }));
const ellipseMeshRQ = new THREE.Mesh(ellipseGemoetryRQ, ellipseMaterialRQ);
scene.add(ellipseMeshRQ);

const rps = ellipsePointsRPVec2.map(vec2 => new THREE.Vector3(vec2.x, vec2.y, 15));
const rqs = ellipsePointsRQVec2.map(vec2 => new THREE.Vector3(vec2.x, vec2.y, 0));


const ellipseCurveLP = new THREE.EllipseCurve(-4, 1, 2.4 / 20, 2 / 20, 1.5 * Math.PI, 3.5 * Math.PI, true);
const ellipsePointsLPVec2 = ellipseCurveLP.getPoints(500);

const ellipseCurveLQ = new THREE.EllipseCurve(-4, 2.6, 2.4, 2, 1.5 * Math.PI, 3.5 * Math.PI, true);
const ellipsePointsLQVec2 = ellipseCurveLQ.getPoints(500);

const ellipsePointsLQArr = ellipsePointsLQVec2.map(vec2 => vec2.toArray());
const ellipseGemoetryLQ = Line(ellipsePointsLQArr);
const ellipseMaterialLQ = new THREE.ShaderMaterial(
  BasicShader({
    side: THREE.DoubleSide,
    diffuse: 0x5cd7ff,
    thickness: 0.1
  }));
const ellipseMeshLQ = new THREE.Mesh(ellipseGemoetryLQ, ellipseMaterialLQ);
scene.add(ellipseMeshLQ);


const lps = ellipsePointsLPVec2.map(vec2 => new THREE.Vector3(vec2.x, vec2.y, 15));
const lqs = ellipsePointsLQVec2.map(vec2 => new THREE.Vector3(vec2.x, vec2.y, 0));

const leftMembraneGeometry = new MembraneBufferGeometry(lps, lqs, 50);
const leftMembraneMesh = new THREE.Mesh(leftMembraneGeometry, textureMaterial);
scene.add(leftMembraneMesh);

const rightMembraneGeometry = new MembraneBufferGeometry(rps, rqs, 50);
const rightMembraneMesh = new THREE.Mesh(rightMembraneGeometry, textureMaterial);
scene.add(rightMembraneMesh);

// const updateEllipse1 = () => {
//   ellipseCurve1.aEndAngle -= (Math.PI / (180 * 60));
//   const points = ellipseCurve1.getPoints(500);
//   geometry1.setFromPoints(points);
//   geometry1.verticesNeedUpdate = true;
//   meshLine1.setGeometry(geometry1);
// };

// const updateEllipse2 = () => {
//   ellipseCurve2.aStartAngle -= (Math.PI / (180 * 60));
//   const points = ellipseCurve2.getPoints(500);
//   geometry2.setFromPoints(points);
//   geometry2.verticesNeedUpdate = true;
//   meshLine2.setGeometry(geometry2);
// };

window.addEventListener("resize", () => {
  renderer.setSize(container.offsetWidth, container.offsetHeight);
  camera.aspect = container.offsetWidth / container.offsetHeight;
  camera.updateProjectionMatrix();
});

const clock = new THREE.Clock();
const mixer = new THREE.AnimationMixer();

const animate = () => {
  window.requestAnimationFrame(animate);
  const delta = clock.getDelta() * mixer.timeScale;
  mixer.update(delta);
  // updateEllipse1();
  // updateEllipse2();
  controls.update();
  renderer.render(scene, camera);
};

animate();
