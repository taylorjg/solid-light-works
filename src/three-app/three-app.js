import EventEmitter from 'events'
import * as THREE from 'three'
import Stats from 'stats.js'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import { Installation } from './installations/installation'
import { config as TestInstallationConfig } from './installations/test'
import { config as DoublingBackInstallationConfig } from './installations/doubling-back'
import { config as LeavingInstallationConfig } from './installations/leaving'
import { config as CouplingInstallationConfig } from './installations/coupling'
import { config as BetweenYouAndIInstallationConfig } from './installations/between-you-and-i'
import { config as BreathIIIInstallationConfig } from './installations/breath-iii'
import { config as SkirtIIIInstallationConfig } from './installations/skirt-iii'
import { config as MeetingYouHalfwayInstallationConfig } from './installations/meeting-you-halfway'
import { config as FaceToFaceInstallationConfig } from './installations/face-to-face'
import { Mode } from './mode'
import * as C from './constants'
import * as U from './utils'

const SETTINGS_CHANGED_EVENT_NAME = 'settings-changed'
const RESOURCES_CHANGED_EVENT_NAME = 'resources-changed'

const eventEmitter = new EventEmitter()
eventEmitter.setMaxListeners(20)

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
let stats = null

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

const showRendererInfo = () => {
  console.log("renderer.info:", renderer.info)
}

const toggleStats = () => {
  if (stats) {
    document.body.removeChild(stats.dom)
    stats = null
  } else {
    stats = new Stats()
    stats.dom.style.left = 'unset'
    stats.dom.style.top = '.5rem'
    stats.dom.style.right = '.5rem'
    document.body.appendChild(stats.dom)
  }
}

export const threeAppInit = async () => {

  const DPR = window.devicePixelRatio

  const container = document.getElementById('visualisation-container')
  const w = container.offsetWidth
  const h = container.offsetHeight
  renderer = new THREE.WebGLRenderer({ antialias: true })
  renderer.setPixelRatio(DPR)
  renderer.localClippingEnabled = true
  renderer.setSize(w, h)
  container.appendChild(renderer.domElement)

  let renderTarget = new THREE.WebGLRenderTarget(w * DPR, h * DPR)
  renderTarget.depthTexture = new THREE.DepthTexture()

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
    hazeTexture,
    depthTexture: renderTarget.depthTexture,
    resolution: new THREE.Vector2(w * DPR, h * DPR),
    addListener: listener => {
      eventEmitter.on(RESOURCES_CHANGED_EVENT_NAME, listener)
    }
  }

  const emitResourcesChanged = () => {
    eventEmitter.emit(RESOURCES_CHANGED_EVENT_NAME)
  }

  const maybeTestInstallationConfig = window.location.search.includes('test')
    ? [TestInstallationConfig]
    : []

  const configs = [
    ...maybeTestInstallationConfig,
    DoublingBackInstallationConfig,
    LeavingInstallationConfig,
    CouplingInstallationConfig,
    BetweenYouAndIInstallationConfig,
    BreathIIIInstallationConfig,
    SkirtIIIInstallationConfig,
    MeetingYouHalfwayInstallationConfig,
    FaceToFaceInstallationConfig
  ]

  installations = configs.map(config => new Installation(scene, resources, config))

  const onDocumentKeyDownHandler = e => {
    if (e.altKey || e.ctrlKey || e.metaKey || e.ShiftKey) return
    switch (e.key) {
      case 'a': return toggleAxes()
      case 'b': return toggleBehindOnly()
      case 'c': return reportCameraPosition()
      case 'd': return showRendererInfo()
      case 'f': return switchInstallation()
      case 'i': return toggleIntersectionPoints()
      case 'm': return toggleMode()
      case 'p': return switchCameraPose()
      case 'r': return toggleAutoRotate()
      case 's': return toggleStats()
      case 'v': return toggleVertexNormals()
      default: return
    }
  }

  document.addEventListener('keydown', onDocumentKeyDownHandler)

  const onWindowResizeHandler = () => {
    const w = container.offsetWidth
    const h = container.offsetHeight

    renderer.setSize(w, h)

    camera.aspect = w / h
    camera.updateProjectionMatrix()

    renderTarget = new THREE.WebGLRenderTarget(w * DPR, h * DPR)
    renderTarget.depthTexture = new THREE.DepthTexture()

    resources.depthTexture = renderTarget.depthTexture
    resources.resolution = new THREE.Vector2(w * DPR, h * DPR)
    emitResourcesChanged()
  }

  window.addEventListener('resize', onWindowResizeHandler)

  switchInstallation(true)

  renderer.setAnimationLoop(() => {
    stats && stats.begin()
    const currentInstallation = installations[currentInstallationIndex]
    currentInstallation.updateRenderables(mode)
    controls.update()

    // Render everything except the membranes to an offscreen render target
    // with a depth buffer (we actually only care about the depth buffer)
    renderer.setRenderTarget(renderTarget)
    camera.layers.set(0)
    renderer.render(scene, camera)

    // Render everything to the canvas
    renderer.setRenderTarget(null)
    camera.layers.enableAll()
    renderer.render(scene, camera)

    stats && stats.end()
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
