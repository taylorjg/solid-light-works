import * as THREE from "three";
import * as THREEMESHLINE from "three.meshline";

const container = document.getElementById("container");
const w = container.offsetWidth;
const h = container.offsetHeight;
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(w, h);
container.appendChild(renderer.domElement);

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(0.1, w / h, 0.1, 10000);
camera.position.set(0, 0, 5000);
camera.lookAt(new THREE.Vector3(0, 0, 0));
scene.add(camera);

const ellipseCurve1 = new THREE.EllipseCurve(-3, 0, 2.4, 2, 1.5 * Math.PI + (Math.PI / 900), 1.5 * Math.PI, true);
const ellipseCurve2 = new THREE.EllipseCurve(3, 0, 2.4, 2, 1.5 * Math.PI, 1.5 * Math.PI, true);

const points1 = ellipseCurve1.getPoints(500);
const geometry1 = new THREE.Geometry().setFromPoints(points1);
const meshLine1 = new THREEMESHLINE.MeshLine();
meshLine1.setGeometry(geometry1);
const meshLineMaterial1 = new THREEMESHLINE.MeshLineMaterial({ lineWidth: 15 });
const ellipse1 = new THREE.Mesh(meshLine1.geometry, meshLineMaterial1);

const points2 = ellipseCurve2.getPoints(500);
const geometry2 = new THREE.Geometry().setFromPoints(points2);
const meshLine2 = new THREEMESHLINE.MeshLine();
meshLine2.setGeometry(geometry2);
const meshLineMaterial2 = new THREEMESHLINE.MeshLineMaterial({ lineWidth: 15 });
const ellipse2 = new THREE.Mesh(meshLine2.geometry, meshLineMaterial2);

const leaving = new THREE.Group();
leaving.add(ellipse1);
leaving.add(ellipse2);
scene.add(leaving);

const updateEllipse1 = () => {
  ellipseCurve1.aEndAngle -= (Math.PI / (180 * 60));
  const points = ellipseCurve1.getPoints(500);
  geometry1.setFromPoints(points);
  geometry1.verticesNeedUpdate = true;
  meshLine1.setGeometry(geometry1);
};

const updateEllipse2 = () => {
  ellipseCurve2.aStartAngle -= (Math.PI / (180 * 60));
  const points = ellipseCurve2.getPoints(500);
  geometry2.setFromPoints(points);
  geometry2.verticesNeedUpdate = true;
  meshLine2.setGeometry(geometry2);
};

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
  updateEllipse1();
  updateEllipse2();
  renderer.render(scene, camera);
};

animate();
