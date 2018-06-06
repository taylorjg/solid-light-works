import * as THREE from "three";
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
renderer.localClippingEnabled = true;
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
  clippingPlanes: [new THREE.Plane(new THREE.Vector3(0, 0, 1))]
});

const formLeftGeometry = new THREE.CylinderBufferGeometry(2.4, 0.1, 20, 50, 50, true, 0 * Math.PI, 2 * Math.PI);
const formLeft = new THREE.Mesh(formLeftGeometry, textureMaterial);
formLeft.rotateX(-75 * Math.PI / 180);
formLeft.position.set(-4, 1.3, 9);
scene.add(formLeft);

const formRightGeometry = new THREE.CylinderBufferGeometry(2.4, 0.1, 20, 50, 50, true, 0 * Math.PI, 2 * Math.PI);
const formRight = new THREE.Mesh(formRightGeometry, textureMaterial);
formRight.rotateX(-75 * Math.PI / 180);
formRight.position.set(4, 1.3, 9);
scene.add(formRight);

const ellipseCurve = new THREE.EllipseCurve(4, 4, 2.4, 2, 1.5 * Math.PI, 3.5 * Math.PI, true);
const points = ellipseCurve.getPoints(500).map(({x, y}) => [x, y]);
const geo = Line(points);
const mat = new THREE.ShaderMaterial(
  BasicShader({
    side: THREE.DoubleSide,
    diffuse: 0x5cd7ff,
    thickness: 0.1
  }));
const mesh = new THREE.Mesh(geo, mat);
scene.add(mesh);

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
