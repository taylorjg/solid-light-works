import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import { LeavingForm, setSpeed } from './forms/leaving-form'
import { FaceToFaceIIForm } from './forms/face-to-face-ii-form'
import { Projector } from './projector'
// import { addSpotLights, toggleSpotLightHelpers } from './spotlights'
import * as U from './utils'
import * as C from './constants'

const leavingFormEnabled = true
const faceToFaceIIFormEnabled = false

const FAVOURITE_POSITIONS = [
  {
    cameraPosition: new THREE.Vector3(-18.39, 6.51, 13.86),
    controlsTarget: new THREE.Vector3(4.49, 2, 3.12)
  },
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

const main = async () => {

  const container = document.getElementById('container')
  const w = container.offsetWidth
  const h = container.offsetHeight
  const renderer = new THREE.WebGLRenderer({ antialias: true })
  renderer.setSize(w, h)
  container.appendChild(renderer.domElement)

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

  const hazeTexture = await U.loadTexture('haze.jpg')
  const projectorLensTexture = await U.loadTexture('projector-lens.png')

  const makeProjectorPosition = x =>
    new THREE.Vector3(x, C.PROJECTOR_CY, C.MEMBRANE_LENGTH)

  let leavingProjectorLeft
  let leavingProjectorRight
  let faceToFaceIIProjector

  if (leavingFormEnabled) {
    const leavingProjectorFormLeft = new LeavingForm(
      C.LEFT_FORM_CX,
      C.PROJECTOR_CY,
      C.PROJECTOR_R,
      C.PROJECTOR_R,
      true)

    const leavingScreenFormLeft = new LeavingForm(
      C.LEFT_FORM_CX,
      C.SCREEN_IMAGE_CY,
      C.SCREEN_IMAGE_RX,
      C.SCREEN_IMAGE_RY,
      true)

    const leavingProjectorFormRight = new LeavingForm(
      C.RIGHT_FORM_CX,
      C.PROJECTOR_CY,
      C.PROJECTOR_R,
      C.PROJECTOR_R,
      false)

    const leavingScreenFormRight = new LeavingForm(
      C.RIGHT_FORM_CX,
      C.SCREEN_IMAGE_CY,
      C.SCREEN_IMAGE_RX,
      C.SCREEN_IMAGE_RY,
      false)

    leavingProjectorLeft = new Projector(
      leavingProjectorFormLeft,
      leavingScreenFormLeft,
      1,
      scene,
      hazeTexture,
      projectorLensTexture,
      makeProjectorPosition(C.LEFT_FORM_CX))

    leavingProjectorRight = new Projector(
      leavingProjectorFormRight,
      leavingScreenFormRight,
      1,
      scene,
      hazeTexture,
      projectorLensTexture,
      makeProjectorPosition(C.RIGHT_FORM_CX))
  }

  if (faceToFaceIIFormEnabled) {
    const faceToFaceIIProjectorForm = new FaceToFaceIIForm(true)
    const faceToFaceIIScreenForm = new FaceToFaceIIForm(false)
    faceToFaceIIProjector = new Projector(
      faceToFaceIIProjectorForm,
      faceToFaceIIScreenForm,
      3,
      scene,
      hazeTexture,
      projectorLensTexture,
      new THREE.Vector3(0, C.PROJECTOR_CY * 4, C.MEMBRANE_LENGTH))
  }

  window.addEventListener('resize', () => {
    renderer.setSize(container.offsetWidth, container.offsetHeight)
    camera.aspect = container.offsetWidth / container.offsetHeight
    camera.updateProjectionMatrix()
  })

  const onDocumentKeyDownHandler = e => {

    if (e.key === 'a') {
      if (axesHelper) {
        scene.remove(axesHelper)
        axesHelper = undefined
      } else {
        axesHelper = new THREE.AxesHelper(15)
        scene.add(axesHelper)
      }
    }

    if (e.key === 'c') {
      console.log(`camera.position: ${JSON.stringify(camera.position)}`)
      console.log(`controls.target: ${JSON.stringify(controls.target)}`)
    }

    if (e.key === 'p') {
      currentFavouritePositionIndex++
      currentFavouritePositionIndex %= FAVOURITE_POSITIONS.length
      camera.position.copy(FAVOURITE_POSITIONS[currentFavouritePositionIndex].cameraPosition)
      controls.target.copy(FAVOURITE_POSITIONS[currentFavouritePositionIndex].controlsTarget)
    }

    if (e.key === 'r') {
      controls.autoRotate = !controls.autoRotate
    }

    // if (ev.key === 's') {
    //   toggleSpotLightHelpers(scene)
    // }

    if (e.key === 'v') {
      if (leavingFormEnabled) {
        leavingProjectorLeft.toggleHelpers()
        leavingProjectorRight.toggleHelpers()
      }
      if (faceToFaceIIFormEnabled) {
        faceToFaceIIProjector.toggleHelpers()
      }
    }

    if (e.key === '1') {
      setSpeed(1)
    }
    if (e.key === '2') {
      setSpeed(2)
    }
    if (e.key === '3') {
      setSpeed(5)
    }
    if (e.key === '4') {
      setSpeed(10)
    }
  }

  document.addEventListener('keydown', onDocumentKeyDownHandler)

  const render = () => {
    if (leavingFormEnabled) {
      leavingProjectorLeft.update()
      leavingProjectorRight.update()
    }
    if (faceToFaceIIFormEnabled) {
      faceToFaceIIProjector.update()
    }
    controls.update()
    renderer.render(scene, camera)
    requestAnimationFrame(render)
  }

  render()
}

main()
