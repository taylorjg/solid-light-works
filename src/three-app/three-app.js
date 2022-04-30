import EventEmitter from 'events'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import { Installation } from './installations/installation'
import { config as DoublingBackInstallationConfig } from './installations/doubling-back'
import { config as LeavingInstallationConfig } from './installations/leaving'
import { config as CouplingInstallationConfig } from './installations/coupling'
import { config as BetweenYouAndIInstallationConfig } from './installations/between-you-and-i'
import { config as BreathIIIInstallationConfig } from './installations/breath-iii'
import { config as SkirtIIIInstallationConfig } from './installations/skirt-iii'
import { config as MultiWorksInstallationConfig } from './installations/multi-works'
import { Mode } from './mode'
import * as C from './constants'
import * as U from './utils'

const SETTINGS_CHANGED_EVENT_NAME = 'settings-changed'

const eventEmitter = new EventEmitter()

let mode = Mode.Mode2D
let renderer
let scene
let camera
let controls
let installations
let currentInstallationIndex = 0
let currentCameraPoseIndex = 0
let behindOnly = false
let axesEnabled = false
let axesHelper = undefined
let vertexNormalsEnabled = false
let intersectionPointsEnabled = false

const addSettingsChangedListener = listener =>
  eventEmitter.on(SETTINGS_CHANGED_EVENT_NAME, listener)

const removeSettingsChangedListener = listener =>
  eventEmitter.off(SETTINGS_CHANGED_EVENT_NAME, listener)

const getSettings = () => {
  return {
    mode,
    behindOnly,
    autoRotate: controls.autoRotate,
    autoRotateSpeed: controls.autoRotateSpeed,
    axesEnabled,
    vertexNormalsEnabled,
    intersectionPointsEnabled
  }
}

const emitSettingsChanged = () => {
  eventEmitter.emit(SETTINGS_CHANGED_EVENT_NAME, getSettings())
}

const toggleMode = () => {
  setMode(mode === Mode.Mode2D ? Mode.Mode3D : Mode.Mode2D)
}

const toggleAutoRotate = () => {
  setAutoRotate(!controls.autoRotate)
}

const toggleVertexNormals = () => {
  setVertexNormalsEnabled(!vertexNormalsEnabled)
}

const toggleIntersectionPoints = () => {
  setIntersectionPointsEnabled(!intersectionPointsEnabled)
}

const toggleBehindOnly = () => {
  setBehindOnly(!behindOnly)
}

const showAxesHelper = () => {
  if (!axesHelper) {
    axesHelper = new THREE.AxesHelper(C.MEMBRANE_LENGTH)
    scene.add(axesHelper)
  }
}

const hideAxesHelper = () => {
  if (axesHelper) {
    scene.remove(axesHelper)
    axesHelper = undefined
  }
}

const toggleAxes = () => {
  setAxesEnabled(!axesEnabled)
}

const reportCameraPosition = () => {
  const prec2 = value => value.toFixed(2)
  const newVector3 = vec3 => `new THREE.Vector3(${prec2(vec3.x)}, ${prec2(vec3.y)}, ${prec2(vec3.z)})`
  console.log(`{ position: ${newVector3(camera.position)}, target: ${newVector3(controls.target)} }`)
}

const updateVisibility = () => {
  installations.forEach((installation, index) => {
    const isCurrentInstallation = index === currentInstallationIndex
    installation.updateVisibility(
      mode,
      vertexNormalsEnabled,
      intersectionPointsEnabled,
      isCurrentInstallation)
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
    ? [currentInstallation.config.config2D.cameraPose]
    : currentInstallation.config.config3D.cameraPoses
  const cameraPoses = allCameraPoses.filter(cameraPose => behindOnly ? cameraPose.isBehind : true)
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
    if (cameraPose.isBehind) {
      currentInstallation.hideScenery()
    } else {
      currentInstallation.showScenery()
    }
  }
}

const setMode = value => {
  const validModes = [Mode.Mode2D, Mode.Mode3D]
  mode = validModes.includes(value) ? value : Mode.Mode2D
  controls.enabled = mode === Mode.Mode3D
  updateVisibility()
  switchCameraPose(true)
  emitSettingsChanged()
}

const setAutoRotate = value => {
  controls.autoRotate = value
  emitSettingsChanged()
}

const setAutoRotateSpeed = value => {
  controls.autoRotateSpeed = value
  emitSettingsChanged()
}

const setAxesEnabled = value => {
  axesEnabled = value
  axesEnabled ? showAxesHelper() : hideAxesHelper()
  emitSettingsChanged()
}

const setVertexNormalsEnabled = value => {
  vertexNormalsEnabled = value
  updateVisibility()
  emitSettingsChanged()
}

const setIntersectionPointsEnabled = value => {
  intersectionPointsEnabled = value
  updateVisibility()
  emitSettingsChanged()
}

const setBehindOnly = value => {
  behindOnly = value
  switchCameraPose()
  emitSettingsChanged()
}

export const threeAppInit = async () => {

  const container = document.getElementById('visualisation-container')
  const w = container.offsetWidth
  const h = container.offsetHeight
  renderer = new THREE.WebGLRenderer({ antialias: true })
  renderer.setPixelRatio(window.devicePixelRatio)
  renderer.setSize(w, h)
  container.appendChild(renderer.domElement)

  scene = new THREE.Scene()
  scene.visible = false
  camera = new THREE.PerspectiveCamera(45, w / h, 0.1, 50)
  scene.add(camera)

  controls = new OrbitControls(camera, renderer.domElement)
  controls.minDistance = 0
  controls.maxDistance = 50
  controls.enableDamping = true
  controls.dampingFactor = 0.9
  controls.autoRotate = false
  controls.autoRotateSpeed = 0.5
  controls.enabled = mode === Mode.Mode3D

  const hazeTexture = await U.loadTexture('/solid-light-works/haze.jpg')

  const resources = {
    hazeTexture
  }

  const configs = [
    DoublingBackInstallationConfig,
    LeavingInstallationConfig,
    CouplingInstallationConfig,
    BetweenYouAndIInstallationConfig,
    BreathIIIInstallationConfig,
    SkirtIIIInstallationConfig,
    MultiWorksInstallationConfig
  ]

  installations = configs.map(config => new Installation(scene, resources, config))

  const onDocumentKeyDownHandler = e => {
    if (e.altKey || e.ctrlKey || e.metaKey || e.ShiftKey) return
    switch (e.key) {
      case 'a': return toggleAxes()
      case 'b': return toggleBehindOnly()
      case 'c': return reportCameraPosition()
      case 'f': return switchInstallation()
      case 'i': return toggleIntersectionPoints()
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

  renderer.setAnimationLoop(() => {
    const currentInstallation = installations[currentInstallationIndex]
    currentInstallation.updateRenderables(mode)
    controls.update()
    renderer.render(scene, camera)
  })

  const ready = () => {
    scene.visible = true
  }

  return {
    ready,
    getSettings,
    addSettingsChangedListener,
    removeSettingsChangedListener,
    toggleMode,
    switchInstallation,
    switchCameraPose,
    setMode,
    setBehindOnly,
    setAutoRotate,
    setAutoRotateSpeed,
    setAxesEnabled,
    setVertexNormalsEnabled,
    setIntersectionPointsEnabled
  }
}
