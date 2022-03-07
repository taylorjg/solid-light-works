import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import { DoublingBackInstallation } from './installations/doubling-back'
import { LeavingInstallation } from './installations/leaving'
import { CouplingInstallation } from './installations/coupling'
import { BetweenYouAndIInstallation } from './installations/between-you-and-i'
import { Mode } from './mode'
import * as C from './constants'
import * as U from './utils'

const init = async () => {

  const container = document.getElementById('container')
  const w = container.offsetWidth
  const h = container.offsetHeight
  const renderer = new THREE.WebGLRenderer({ antialias: true })
  renderer.setSize(w, h)
  container.appendChild(renderer.domElement)

  const searchParams = new URLSearchParams(window.location.search)

  // TODO: set initial values for these via the query string
  let currentInstallationIndex = 0
  let currentCameraPoseIndex = 0
  let mode = searchParams.get('mode') === '3d' ? Mode.Mode3D : Mode.Mode2D
  let showVertexNormals = searchParams.has('showVertexNormals')
  let axesHelper = undefined
  let autoRotate = searchParams.has('autoRotate')
  let autoRotateSpeed = .5
  let behindOnly = searchParams.has('behindOnly')

  const scene = new THREE.Scene()
  const camera = new THREE.PerspectiveCamera(45, w / h, 0.1, 50)
  scene.add(camera)

  const controls = new OrbitControls(camera, renderer.domElement)
  controls.minDistance = 0
  controls.maxDistance = 50
  controls.enableDamping = true
  controls.dampingFactor = 0.9
  controls.autoRotate = autoRotate
  controls.autoRotateSpeed = autoRotateSpeed
  controls.enabled = mode === Mode.Mode3D

  const hazeTexture = await U.loadTexture('haze.jpg')

  const resources = {
    hazeTexture
  }

  const installations = [
    DoublingBackInstallation,
    LeavingInstallation,
    CouplingInstallation,
    BetweenYouAndIInstallation
  ]
    .map(installationConstructor => new installationConstructor())
    .map(installation => installation.createRenderables(scene, resources))

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
    const prec2 = value => value.toFixed(2)
    const newVector3 = vec3 => `new THREE.Vector3(${prec2(vec3.x)}, ${prec2(vec3.y)}, ${prec2(vec3.z)})`
    console.log(`{ position: ${newVector3(camera.position)}, target: ${newVector3(controls.target)} }`)
  }

  const updateVisibility = () => {
    installations.forEach((installation, index) => {
      const isCurrentInstallation = index === currentInstallationIndex
      installation.updateVisibility(mode, showVertexNormals, isCurrentInstallation)
    })
  }

  const switchInstallation = reset => {
    if (reset) {
      currentInstallationIndex = 0
    } else {
      currentInstallationIndex += 1
      currentInstallationIndex %= installations.length
    }
    updateVisibility()
    switchCameraPose(true)
  }

  const switchCameraPose = reset => {
    const currentInstallation = installations[currentInstallationIndex]
    const allCameraPoses = mode === Mode.Mode2D
      ? currentInstallation.installationData2D.cameraPoses
      : currentInstallation.installationData3D.cameraPoses
    const cameraPoses = allCameraPoses.filter(cameraPose =>
      mode === Mode.Mode3D && behindOnly ? cameraPose.hideScenery : true)
    if (reset) {
      currentCameraPoseIndex = 0
    } else {
      currentCameraPoseIndex += 1
      currentCameraPoseIndex %= cameraPoses.length
    }
    const cameraPose = cameraPoses[currentCameraPoseIndex]
    camera.position.copy(cameraPose.position)
    controls.target.copy(cameraPose.target)
    if (mode === Mode.Mode3D) {
      if (cameraPose.hideScenery) {
        currentInstallation.hideScenery()
      } else {
        currentInstallation.showScenery()
      }
    }
  }

  const toggleMode = () => {
    mode = mode === Mode.Mode2D ? Mode.Mode3D : Mode.Mode2D
    controls.enabled = mode === Mode.Mode3D
    updateVisibility()
    switchCameraPose(true)
  }

  const toggleAutoRotate = () => {
    controls.autoRotate = !controls.autoRotate
  }

  const toggleVertexNormals = () => {
    showVertexNormals = !showVertexNormals
    updateVisibility()
  }

  const onDocumentKeyDownHandler = e => {
    switch (e.key) {
      case 'a': return toggleAxes()
      case 'c': return reportCameraPosition()
      case 'f': return switchInstallation()
      case 'm': return toggleMode()
      case 'p': return switchCameraPose()
      case 'r': return toggleAutoRotate()
      case 'v': return toggleVertexNormals()
      default: return
    }
  }

  document.addEventListener('keydown', onDocumentKeyDownHandler)

  const onWindowResizeHandler = () => {
    renderer.setSize(container.offsetWidth, container.offsetHeight)
    camera.aspect = container.offsetWidth / container.offsetHeight
    camera.updateProjectionMatrix()
  }

  window.addEventListener('resize', onWindowResizeHandler)

  switchInstallation(true)

  const render = () => {
    const currentInstallation = installations[currentInstallationIndex]
    currentInstallation.updateRenderables(mode)
    controls.update()
    renderer.render(scene, camera)
    requestAnimationFrame(render)
  }

  render()
}

const setAnimationSpeed = value => {
}

const setAutoRotate = value => {
}

const setAutoRotateSpeed = value => {
}

const setAxesEnabled = value => {
}

const threeApp = () => {
  return {
    init,
    setAnimationSpeed,
    setAutoRotate,
    setAutoRotateSpeed,
    setAxesEnabled
  }
}

export default threeApp
