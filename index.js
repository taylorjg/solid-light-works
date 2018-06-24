import * as THREE from "three";
import OrbitControls from "three-orbitcontrols";
import { Form, LEFT, RIGHT, GROWING, SHRINKING, swapSidesTest } from "./form";
import * as C from "./constants";

const container = document.getElementById("container");
const w = container.offsetWidth;
const h = container.offsetHeight;
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(w, h);
container.appendChild(renderer.domElement);

const FAVOURITE_POSITIONS = [
  {
    cameraPosition: new THREE.Vector3(0.95, 2.12, 12.46),
    controlsTarget: new THREE.Vector3(0.95, 2.00, 9.63)
  },
  {
    cameraPosition: new THREE.Vector3(2.15, 4.05, -8.75),
    controlsTarget: new THREE.Vector3(-0.93, 2.00, 8.79)
  },
  {
    cameraPosition: new THREE.Vector3(-21.88, 9.81, 14.97),
    controlsTarget: new THREE.Vector3(1.85, 2.00, 9.08)
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

let axesHelper = undefined;
let spotLightLHelper = undefined;
let spotLightRHelper = undefined;

// --------------------------------
// Membrane spotlights (projectors)
// --------------------------------

const SPOTLIGHT_COLOUR = 0xffffff;
const SPOTLIGHT_HIGH_INTENSITY = 100;
const SPOTLIGHT_LOW_INTENSITY = 50;
const SPOTLIGHT_DISTANCE = C.MEMBRANE_LENGTH * 2;
const SPOTLIGHT_ANGLE = 14 * Math.PI / 180;

const spotLightTargetL = new THREE.Object3D();
spotLightTargetL.position.set(C.LEFT_CENTRE_X, C.CENTRE_Q_Y, 0);
scene.add(spotLightTargetL);
const spotLightL = new THREE.SpotLight(
  SPOTLIGHT_COLOUR,
  SPOTLIGHT_HIGH_INTENSITY,
  SPOTLIGHT_DISTANCE,
  SPOTLIGHT_ANGLE);
spotLightL.position.set(C.LEFT_CENTRE_X, C.CENTRE_P_Y, C.MEMBRANE_LENGTH);
spotLightL.target = spotLightTargetL;
scene.add(spotLightL);

{
  const spotLightTarget = new THREE.Object3D();
  spotLightTarget.position.set(C.LEFT_CENTRE_X, C.CENTRE_Q_Y, 0);
  scene.add(spotLightTarget);
  const spotLight = new THREE.SpotLight(
    SPOTLIGHT_COLOUR,
    SPOTLIGHT_LOW_INTENSITY,
    SPOTLIGHT_DISTANCE,
    SPOTLIGHT_ANGLE);
  spotLight.position.set(C.LEFT_CENTRE_X, 0, C.MEMBRANE_LENGTH);
  spotLight.target = spotLightTarget;
  scene.add(spotLight);
}

{
  const spotLightTarget = new THREE.Object3D();
  spotLightTarget.position.set(C.LEFT_CENTRE_X, C.CENTRE_Q_Y, 0);
  scene.add(spotLightTarget);
  const spotLight = new THREE.SpotLight(
    SPOTLIGHT_COLOUR,
    SPOTLIGHT_LOW_INTENSITY,
    SPOTLIGHT_DISTANCE,
    SPOTLIGHT_ANGLE);
  spotLight.position.set(C.LEFT_CENTRE_X, C.CENTRE_P_Y * 2, C.MEMBRANE_LENGTH);
  spotLight.target = spotLightTarget;
  scene.add(spotLight);
}

const spotLightTargetR = new THREE.Object3D();
spotLightTargetR.position.set(C.RIGHT_CENTRE_X, C.CENTRE_Q_Y, 0);
scene.add(spotLightTargetR);
const spotLightR = new THREE.SpotLight(
  SPOTLIGHT_COLOUR,
  SPOTLIGHT_HIGH_INTENSITY,
  SPOTLIGHT_DISTANCE,
  SPOTLIGHT_ANGLE);
spotLightR.position.set(C.RIGHT_CENTRE_X, C.CENTRE_P_Y, C.MEMBRANE_LENGTH);
spotLightR.target = spotLightTargetR;
scene.add(spotLightR);

{
  const spotLightTarget = new THREE.Object3D();
  spotLightTarget.position.set(C.RIGHT_CENTRE_X, C.CENTRE_P_Y, 0);
  scene.add(spotLightTarget);
  const spotLight = new THREE.SpotLight(
    SPOTLIGHT_COLOUR,
    SPOTLIGHT_LOW_INTENSITY,
    SPOTLIGHT_DISTANCE,
    SPOTLIGHT_ANGLE);
  spotLight.position.set(C.RIGHT_CENTRE_X, 0, C.MEMBRANE_LENGTH);
  spotLight.target = spotLightTarget;
  scene.add(spotLight);
}

{
  const spotLightTarget = new THREE.Object3D();
  spotLightTarget.position.set(C.RIGHT_CENTRE_X, C.CENTRE_P_Y, 0);
  scene.add(spotLightTarget);
  const spotLight = new THREE.SpotLight(
    SPOTLIGHT_COLOUR,
    SPOTLIGHT_LOW_INTENSITY,
    SPOTLIGHT_DISTANCE,
    SPOTLIGHT_ANGLE);
  spotLight.position.set(C.RIGHT_CENTRE_X, C.CENTRE_P_Y * 2, C.MEMBRANE_LENGTH);
  spotLight.target = spotLightTarget;
  scene.add(spotLight);
}

let growingForm = new Form(scene, GROWING, LEFT);
let shrinkingForm = new Form(scene, SHRINKING, RIGHT);

const onTextureLoaded = texture => {
  growingForm.onTextureLoaded(texture);
  shrinkingForm.onTextureLoaded(texture);
  animate();
};

const textureLoader = new THREE.TextureLoader();
textureLoader.load("haze.jpg", onTextureLoaded);

// ---------
// Animation
// ---------

window.addEventListener("resize", () => {
  renderer.setSize(container.offsetWidth, container.offsetHeight);
  camera.aspect = container.offsetWidth / container.offsetHeight;
  camera.updateProjectionMatrix();
});

const onDocumentKeyDownHandler = ev => {

  if (ev.key === "a") {
    if (axesHelper) {
      scene.remove(axesHelper);
      axesHelper = undefined;
    } else {
      axesHelper = new THREE.AxesHelper(5);
      scene.add(axesHelper);
    }
  }

  if (ev.key === "c") {
    console.log(`camera.position: ${JSON.stringify(camera.position)}`);
    console.log(`controls.target: ${JSON.stringify(controls.target)}`);
  }

  if (ev.key === "p") {
    currentFavouritePositionIndex++;
    currentFavouritePositionIndex %= FAVOURITE_POSITIONS.length;
    camera.position.copy(FAVOURITE_POSITIONS[currentFavouritePositionIndex].cameraPosition);
    controls.target.copy(FAVOURITE_POSITIONS[currentFavouritePositionIndex].controlsTarget);
  }

  if (ev.key === "r") {
    controls.autoRotate = !controls.autoRotate;
  }

  if (ev.key === "s") {
    if (spotLightLHelper) {
      scene.remove(spotLightLHelper);
      scene.remove(spotLightRHelper);
      spotLightLHelper = undefined;
      spotLightRHelper = undefined;
    }
    else {
      spotLightLHelper = new THREE.SpotLightHelper(spotLightL);
      spotLightRHelper = new THREE.SpotLightHelper(spotLightR);
      scene.add(spotLightLHelper);
      scene.add(spotLightRHelper);
    }
  }

  if (ev.key === "v") {
    growingForm.toggleHelpers();
    shrinkingForm.toggleHelpers();
  }
};

document.addEventListener("keydown", onDocumentKeyDownHandler);

let tick = 0;

const animate = () => {
  window.requestAnimationFrame(animate);
  growingForm.update(tick);
  shrinkingForm.update(tick);
  controls.update();
  renderer.render(scene, camera);
  if (swapSidesTest(++tick)) {
    tick = 0;
    growingForm.swapSides();
    shrinkingForm.swapSides();
  }
};
