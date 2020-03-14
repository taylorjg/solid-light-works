import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import { LeavingForm, setSpeed } from './forms/leaving'
import { BetweenYouAndIForm } from './forms/between-you-and-i'
import { CouplingForm } from './forms/coupling'
import { DoublingBackForm } from './forms/doubling-back'
import { Projector } from './projector'
import * as U from './utils'
import * as C from './constants'

class LeavingFormConfig {
  constructor() {
    const leftProjectorPosition = new THREE.Vector3(C.LEFT_FORM_CX, C.PROJECTOR_CY, C.MEMBRANE_LENGTH)
    const rightProjectorPosition = new THREE.Vector3(C.RIGHT_FORM_CX, C.PROJECTOR_CY, C.MEMBRANE_LENGTH)
    this.leftProjectorForm = new LeavingForm(
      leftProjectorPosition,
      C.LEFT_FORM_CX,
      C.PROJECTOR_CY,
      C.PROJECTOR_R,
      C.PROJECTOR_R,
      true)
    this.leftScreenForm = new LeavingForm(
      leftProjectorPosition,
      C.LEFT_FORM_CX,
      C.SCREEN_IMAGE_CY,
      C.SCREEN_IMAGE_RX,
      C.SCREEN_IMAGE_RY,
      true)
    this.rightProjectorForm = new LeavingForm(
      rightProjectorPosition,
      C.RIGHT_FORM_CX,
      C.PROJECTOR_CY,
      C.PROJECTOR_R,
      C.PROJECTOR_R,
      false)
    this.rightScreenForm = new LeavingForm(
      rightProjectorPosition,
      C.RIGHT_FORM_CX,
      C.SCREEN_IMAGE_CY,
      C.SCREEN_IMAGE_RX,
      C.SCREEN_IMAGE_RY,
      false)
    this.leftProjector = null
    this.rightProjector = null
  }

  create(scene, hazeTexture) {
    this.leftProjector = new Projector(
      this.leftProjectorForm,
      this.leftScreenForm,
      scene,
      hazeTexture)
    this.rightProjector = new Projector(
      this.rightProjectorForm,
      this.rightScreenForm,
      scene,
      hazeTexture)
  }

  destroy() {
    this.leftProjector && this.leftProjector.destroy()
    this.rightProjector && this.rightProjector.destroy()
    this.leftProjector = null
    this.rightProjector = null
  }

  update() {
    this.leftProjector && this.leftProjector.update()
    this.rightProjector && this.rightProjector.update()
  }

  toggleVertexNormals() {
    this.leftProjector && this.leftProjector.toggleVertexNormals()
    this.rightProjector && this.rightProjector.toggleVertexNormals()
  }
}

class BetweenYouAndIFormConfig {
  constructor() {
    const projectorPosition = new THREE.Vector3(0, C.PROJECTOR_CY * 4, C.MEMBRANE_LENGTH)
    this.projectorForm = new BetweenYouAndIForm(projectorPosition, true)
    this.screenForm = new BetweenYouAndIForm(projectorPosition, false)
    this.projector = null
  }

  create(scene, hazeTexture) {
    this.projector = new Projector(
      this.projectorForm,
      this.screenForm,
      scene,
      hazeTexture)
  }

  destroy() {
    this.projector && this.projector.destroy()
    this.projector = null
  }

  update() {
    this.projector && this.projector.update()
  }

  toggleVertexNormals() {
    this.projector && this.projector.toggleVertexNormals()
  }
}

class CouplingFormConfig {
  constructor() {
    const projectorPosition = new THREE.Vector3(0, C.PROJECTOR_CY * 4, C.MEMBRANE_LENGTH)
    this.projectorForm = new CouplingForm(projectorPosition, true)
    this.screenForm = new CouplingForm(projectorPosition, false)
    this.projector = null
  }

  create(scene, hazeTexture) {
    this.projector = new Projector(
      this.projectorForm,
      this.screenForm,
      scene,
      hazeTexture)
  }

  destroy() {
    this.projector && this.projector.destroy()
    this.projector = null
  }

  update() {
    this.projector && this.projector.update()
  }

  toggleVertexNormals() {
    this.projector && this.projector.toggleVertexNormals()
  }
}

class DoublingBackFormConfig {
  constructor() {
    const projectorPosition = new THREE.Vector3(-2, 0, C.MEMBRANE_LENGTH)
    this.projectorForm = new DoublingBackForm(projectorPosition, true)
    this.screenForm = new DoublingBackForm(projectorPosition, false)
    this.projector = null
  }

  create(scene, hazeTexture) {
    this.projector = new Projector(
      this.projectorForm,
      this.screenForm,
      scene,
      hazeTexture)
  }

  destroy() {
    this.projector && this.projector.destroy()
    this.projector = null
  }

  toggleVertexNormals() {
    this.projector && this.projector.toggleVertexNormals()
  }

  update() {
    this.projector && this.projector.update()
  }
}

const forms = [
  new DoublingBackFormConfig(),
  new CouplingFormConfig(),
  new LeavingFormConfig(),
  new BetweenYouAndIFormConfig()
]

const CAMERA_POSITIONS = [
  {
    cameraPosition: new THREE.Vector3(-0.515, 4.40, -5.93),
    controlsTarget: new THREE.Vector3(-0.29, 2, 5.14)
  },
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

  let currentFormIndex = 0
  let currentCameraPositionIndex = 0
  let axesHelper = undefined

  const scene = new THREE.Scene()
  const camera = new THREE.PerspectiveCamera(45, w / h, 0.1, 50)
  camera.position.copy(CAMERA_POSITIONS[currentCameraPositionIndex].cameraPosition)
  scene.add(camera)

  const controls = new OrbitControls(camera, renderer.domElement)
  controls.target.copy(CAMERA_POSITIONS[currentCameraPositionIndex].controlsTarget)
  controls.minDistance = 0
  controls.maxDistance = 50
  controls.enableDamping = true
  controls.dampingFactor = 0.9
  controls.autoRotate = false
  controls.autoRotateSpeed = 0.5

  const projectionScreenGeometry = new THREE.PlaneGeometry(16, 6)
  projectionScreenGeometry.translate(0, 3, 0)
  const projectionScreenMaterial = new THREE.MeshBasicMaterial({
    color: 0xA0A0A0,
    transparent: true,
    opacity: 0.2
  })
  const screen = new THREE.Mesh(projectionScreenGeometry, projectionScreenMaterial)
  scene.add(screen)

  const hazeTexture = await U.loadTexture('haze.jpg')

  forms[currentFormIndex].create(scene, hazeTexture)

  const toggleAxes = () => {
    if (axesHelper) {
      scene.remove(axesHelper)
      axesHelper = undefined
    } else {
      axesHelper = new THREE.AxesHelper(15)
      scene.add(axesHelper)
    }
  }

  const reportCameraPosition = () => {
    console.log(`camera.position: ${JSON.stringify(camera.position)}`)
    console.log(`controls.target: ${JSON.stringify(controls.target)}`)
  }

  const switchForm = () => {
    forms[currentFormIndex].destroy()
    currentFormIndex++
    currentFormIndex %= forms.length
    forms[currentFormIndex].create(scene, hazeTexture)
  }

  const switchCameraPosition = () => {
    currentCameraPositionIndex++
    currentCameraPositionIndex %= CAMERA_POSITIONS.length
    camera.position.copy(CAMERA_POSITIONS[currentCameraPositionIndex].cameraPosition)
    controls.target.copy(CAMERA_POSITIONS[currentCameraPositionIndex].controlsTarget)
  }

  const toggleAutoRotate = () => {
    controls.autoRotate = !controls.autoRotate
  }

  const toggleVertexNormals = () => {
    forms[currentFormIndex].toggleVertexNormals()
  }

  const onDocumentKeyDownHandler = e => {
    switch (e.key) {
      case 'a': return toggleAxes()
      case 'c': return reportCameraPosition()
      case 'f': return switchForm()
      case 'p': return switchCameraPosition()
      case 'r': return toggleAutoRotate()
      case 'v': return toggleVertexNormals()
      case '1': return setSpeed(1)
      case '2': return setSpeed(2)
      case '3': return setSpeed(5)
      case '4': return setSpeed(10)
    }
  }

  document.addEventListener('keydown', onDocumentKeyDownHandler)

  const onWindowResizeHandler = () => {
    renderer.setSize(container.offsetWidth, container.offsetHeight)
    camera.aspect = container.offsetWidth / container.offsetHeight
    camera.updateProjectionMatrix()
  }

  window.addEventListener('resize', onWindowResizeHandler)

  const render = () => {
    forms[currentFormIndex].update()
    controls.update()
    renderer.render(scene, camera)
    requestAnimationFrame(render)
  }

  render()
}

main()
