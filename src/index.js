import * as THREE from "three"
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls"
import { GrowingForm, ShrinkingForm, setSpeed } from "./form"
// import { addSpotLights, toggleSpotLightHelpers } from "./spotlights"
import * as C from "./constants"

const container = document.getElementById("container")
const w = container.offsetWidth
const h = container.offsetHeight
const renderer = new THREE.WebGLRenderer({ antialias: true })
renderer.setSize(w, h)
container.appendChild(renderer.domElement)

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
]
let currentFavouritePositionIndex = 0

const scene = new THREE.Scene()
const camera = new THREE.PerspectiveCamera(45, w / h, 0.1, 50)
camera.position.copy(FAVOURITE_POSITIONS[currentFavouritePositionIndex].cameraPosition)
scene.add(camera)

const controls = new OrbitControls(camera, renderer.domElement)
controls.target.copy(FAVOURITE_POSITIONS[currentFavouritePositionIndex].controlsTarget)
controls.minDistance = 0
controls.maxDistance = 50
controls.enableDamping = true
controls.dampingFactor = 0.9
controls.autoRotate = false

const projectionScreenGeometry = new THREE.PlaneGeometry(16, 6)
projectionScreenGeometry.translate(0, 3, 0)
const projectionScreenMaterial = new THREE.MeshBasicMaterial({
  color: 0xA0A0A0,
  transparent: true,
  opacity: 0.2
})
const screen = new THREE.Mesh(projectionScreenGeometry, projectionScreenMaterial)
scene.add(screen)

let axesHelper = undefined

// addSpotLights(scene, C.CENTRE_P_Y, C.CENTRE_Q_Y, C.HIGH_INTENSITY_SPOTLIGHT)
// addSpotLights(scene, 0, C.CENTRE_Q_Y, C.LOW_INTENSITY_SPOTLIGHT)
// addSpotLights(scene, C.CENTRE_P_Y * 2, C.CENTRE_Q_Y, C.LOW_INTENSITY_SPOTLIGHT)

let growingForm = new GrowingForm(scene, C.LEFT)
let shrinkingForm = new ShrinkingForm(scene, C.RIGHT)

const textureLoader = new THREE.TextureLoader()
textureLoader.load("haze.jpg", texture => {
  growingForm.onTextureLoaded(texture)
  shrinkingForm.onTextureLoaded(texture)
  animate()
})

window.addEventListener("resize", () => {
  renderer.setSize(container.offsetWidth, container.offsetHeight)
  camera.aspect = container.offsetWidth / container.offsetHeight
  camera.updateProjectionMatrix()
})

const onDocumentKeyDownHandler = ev => {

  if (ev.key === "a") {
    if (axesHelper) {
      scene.remove(axesHelper)
      axesHelper = undefined
    } else {
      axesHelper = new THREE.AxesHelper(5)
      scene.add(axesHelper)
    }
  }

  if (ev.key === "c") {
    console.log(`camera.position: ${JSON.stringify(camera.position)}`)
    console.log(`controls.target: ${JSON.stringify(controls.target)}`)
  }

  if (ev.key === "p") {
    currentFavouritePositionIndex++
    currentFavouritePositionIndex %= FAVOURITE_POSITIONS.length
    camera.position.copy(FAVOURITE_POSITIONS[currentFavouritePositionIndex].cameraPosition)
    controls.target.copy(FAVOURITE_POSITIONS[currentFavouritePositionIndex].controlsTarget)
  }

  if (ev.key === "r") {
    controls.autoRotate = !controls.autoRotate
  }

  // if (ev.key === "s") {
  //   toggleSpotLightHelpers(scene)
  // }

  if (ev.key === "v") {
    growingForm.toggleHelpers()
    shrinkingForm.toggleHelpers()
  }

  if (ev.key === "1") {
    setSpeedAndReset(1)
  }
  if (ev.key === "2") {
    setSpeedAndReset(2)
  }
  if (ev.key === "3") {
    setSpeedAndReset(5)
  }
  if (ev.key === "4") {
    setSpeedAndReset(10)
  }
}

const setSpeedAndReset = multiplier => {
  setSpeed(multiplier)
  growingForm.reset()
  shrinkingForm.reset()
  tick = 1
}

document.addEventListener("keydown", onDocumentKeyDownHandler)

let tick = 1

const animate = () => {
  window.requestAnimationFrame(animate)
  growingForm.update(tick)
  shrinkingForm.update(tick)
  controls.update()
  renderer.render(scene, camera)
  tick++
  if (growingForm.swapSidesTest()) {
    tick = 1
    growingForm.swapSides()
    shrinkingForm.swapSides()
  }
}
