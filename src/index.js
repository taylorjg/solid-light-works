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
    this.screen = {
      width: 16,
      height: 6
    }
    this.cameraPositions = [
      {
        cameraPosition: new THREE.Vector3(-13.13, 2.42, 9.03),
        controlsTarget: new THREE.Vector3(-0.75, 2, 4.43)
      },
      {
        cameraPosition: new THREE.Vector3(-2.79, 4.2, -9.53),
        controlsTarget: new THREE.Vector3(0.58, 2, 5.34)
      }
    ]
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
    this.screen = {
      width: 16,
      height: 6
    }
    this.cameraPositions = [
      {
        cameraPosition: new THREE.Vector3(5.45, 4.04, 14.21),
        controlsTarget: new THREE.Vector3(1.06, 2, 3.31)
      },
      {
        cameraPosition: new THREE.Vector3(-5.69, 6.67, -5.35),
        controlsTarget: new THREE.Vector3(1.06, 2, 3.31)
      }
    ]
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
    this.screen = {
      width: 10,
      height: 6
    }
    this.cameraPositions = [
      {
        cameraPosition: new THREE.Vector3(5.88, 4.12, 12.26),
        controlsTarget: new THREE.Vector3(-0.81, 2, 2.62)
      },
      {
        cameraPosition: new THREE.Vector3(0.81, 5.01, -6.45),
        controlsTarget: new THREE.Vector3(-0.27, 2, 3.83)
      }
    ]
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
    this.screen = {
      width: 6.4,
      height: 4.4
    }
    this.leftWall = {
      width: C.MEMBRANE_LENGTH,
      height: 4.4,
      x: -3.2
    }
    this.cameraPositions = [
      {
        cameraPosition: new THREE.Vector3(4.18, 4.64, 12.76),
        controlsTarget: new THREE.Vector3(-0.88, 2, 5.51)
      },
      {
        cameraPosition: new THREE.Vector3(1.52, 2.75, -6.79),
        controlsTarget: new THREE.Vector3(-0.88, 2, 5.51)
      },
      {
        cameraPosition: new THREE.Vector3(-9.02, 1.68, 9.85),
        controlsTarget: new THREE.Vector3(-0.88, 2, 5.51)
      }
    ]
    const projectorPosition = new THREE.Vector3(-3.05, 0.1, C.MEMBRANE_LENGTH)
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

const main = async () => {

  const container = document.getElementById('container')
  const w = container.offsetWidth
  const h = container.offsetHeight
  const renderer = new THREE.WebGLRenderer({ antialias: true })
  renderer.setSize(w, h)
  container.appendChild(renderer.domElement)

  let currentFormIndex = 0
  let currentCameraPositionIndex = 0
  let axesHelper = null
  let surfaces = []

  const scene = new THREE.Scene()
  const camera = new THREE.PerspectiveCamera(45, w / h, 0.1, 50)
  scene.add(camera)

  const controls = new OrbitControls(camera, renderer.domElement)
  controls.minDistance = 0
  controls.maxDistance = 50
  controls.enableDamping = true
  controls.dampingFactor = 0.9
  controls.autoRotate = false
  controls.autoRotateSpeed = 0.5

  const createSurfaces = form => {
    if (form.screen) {
      const s = form.screen
      const screenGeometry = new THREE.PlaneGeometry(s.width, s.height)
      screenGeometry.translate(0, s.height / 2, 0)
      const screenMaterial = new THREE.MeshBasicMaterial({
        color: 0xC0C0C0,
        transparent: true,
        opacity: 0.2
      })
      const screen = new THREE.Mesh(screenGeometry, screenMaterial)
      scene.add(screen)
      surfaces.push(screen)
    }

    if (form.leftWall) {
      const lw = form.leftWall
      const leftWallGeometry = new THREE.PlaneGeometry(lw.width, lw.height)
      leftWallGeometry.rotateY(C.HALF_PI)
      leftWallGeometry.translate(lw.x, lw.height / 2, lw.width / 2)
      const leftWallMaterial = new THREE.MeshBasicMaterial({
        color: 0xA0A0A0,
        transparent: true,
        opacity: 0.2
      })
      const leftWall = new THREE.Mesh(leftWallGeometry, leftWallMaterial)
      scene.add(leftWall)
      surfaces.push(leftWall)
    }
  }

  const destroySurfaces = () => {
    surfaces.forEach(surface => U.disposeMesh(scene, surface))
    surfaces = []
  }

  const hazeTexture = await U.loadTexture('haze.jpg')

  const toggleAxes = () => {
    if (axesHelper) {
      scene.remove(axesHelper)
      axesHelper = undefined
    } else {
      axesHelper = new THREE.AxesHelper(C.MEMBRANE_LENGTH)
      scene.add(axesHelper)
    }
  }

  const reportCameraPosition = () => {
    const prec2 = f => Number(f.toFixed(2))
    const p = camera.position
    const t = controls.target
    console.log(`cameraPosition: new THREE.Vector3(${prec2(p.x)}, ${prec2(p.y)}, ${prec2(p.z)}),`)
    console.log(`controlsTarget: new THREE.Vector3(${prec2(t.x)}, ${prec2(t.y)}, ${prec2(t.z)})`)
  }

  const switchForm = (reset) => {
    if (reset) {
      currentFormIndex = 0
    } else {
      destroySurfaces()
      forms[currentFormIndex].destroy()
      currentFormIndex++
      currentFormIndex %= forms.length
    }
    createSurfaces(forms[currentFormIndex])
    forms[currentFormIndex].create(scene, hazeTexture)
    switchCameraPosition(true)
  }

  const switchCameraPosition = (reset) => {
    const form = forms[currentFormIndex]
    if (reset) {
      currentCameraPositionIndex = 0
    } else {
      currentCameraPositionIndex++
      currentCameraPositionIndex %= form.cameraPositions.length
    }
    camera.position.copy(form.cameraPositions[currentCameraPositionIndex].cameraPosition)
    controls.target.copy(form.cameraPositions[currentCameraPositionIndex].controlsTarget)
  }

  const toggleAutoRotate = () => {
    controls.autoRotate = !controls.autoRotate
  }

  const toggleVertexNormals = () => {
    forms[currentFormIndex].toggleVertexNormals()
  }

  const onDocumentKeyDownHandler = e => {
    if (e.altKey || e.ctrlKey || e.shiftKey || e.metaKey) return
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

  switchForm(true)

  const render = () => {
    forms[currentFormIndex].update()
    controls.update()
    renderer.render(scene, camera)
    requestAnimationFrame(render)
  }

  render()
}

main()
