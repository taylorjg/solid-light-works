import * as THREE from "three";
import * as MESHLINE from "three.meshline";

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

const ellipseCurve = new THREE.EllipseCurve(0, 0, 2.4, 2, 0, 2 * Math.PI);
const points = ellipseCurve.getPoints(500);
const geometry = new THREE.Geometry().setFromPoints(points);
const meshLine = new MESHLINE.MeshLine();
meshLine.setGeometry(geometry);
const meshLineMaterial = new MESHLINE.MeshLineMaterial({ lineWidth: 15 });
const ellipse = new THREE.Mesh(meshLine.geometry, meshLineMaterial);

const leaving = new THREE.Group();
leaving.add(ellipse);
scene.add(leaving);

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
  renderer.render(scene, camera);
};

animate();
