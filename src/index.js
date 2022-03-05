import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import { DoublingBackInstallation } from './installations/doubling-back'
import { LeavingInstallation } from './installations/leaving'
import { CouplingInstallation } from './installations/coupling'
import { BetweenYouAndIInstallation } from './installations/between-you-and-i'
import { ScreenImage } from './screen-image'
import { ProjectionEffect } from './projection-effect'
import { Mode } from './mode'
import * as U from './utils'
import * as C from './constants'

const createRenderables2D = (scene, installation) => {
  const screenForms = installation.installationData2D.screenForms
  return {
    screenImages: screenForms.map(screenForm => new ScreenImage(scene, screenForm))
  }
}

const createRenderables3D = (scene, installation, resources) => {
  const screenForms = installation.installationData3D.screenForms
  const projectedForms = installation.installationData3D.projectedForms
  return {
    screenImages: screenForms.map(screenForm => new ScreenImage(scene, screenForm)),
    projectionEffects: projectedForms.map(projectedForm => new ProjectionEffect(scene, projectedForm, resources)),
    surfaces: createSurfaces(scene, installation)
  }
}

const createRenderables = (scene, resources) => installation => {
  installation.renderables2D = createRenderables2D(scene, installation)
  installation.renderables3D = createRenderables3D(scene, installation, resources)
  return installation
}

const createSurfaces = (scene, installation) => {

  const surfaces = []

  const { screen, leftWall, rightWall, floor } = installation.installationData3D

  if (screen) {
    const geometry = new THREE.PlaneGeometry(screen.width, screen.height)
    geometry.translate(0, screen.height / 2, 0)
    const material = new THREE.MeshBasicMaterial({
      color: 0xC0C0C0,
      transparent: true,
      opacity: 0.2
    })
    const mesh = new THREE.Mesh(geometry, material)
    scene.add(mesh)
    surfaces.push(mesh)
  }

  if (leftWall) {
    const geometry = new THREE.PlaneGeometry(leftWall.length, leftWall.height)
    geometry.rotateY(C.HALF_PI)
    geometry.translate(leftWall.distance, leftWall.height / 2, leftWall.length / 2)
    const material = new THREE.MeshBasicMaterial({
      color: 0xA0A0A0,
      transparent: true,
      opacity: 0.2
    })
    const mesh = new THREE.Mesh(geometry, material)
    scene.add(mesh)
    surfaces.push(mesh)
  }

  if (rightWall) {
    const geometry = new THREE.PlaneGeometry(rightWall.length, rightWall.height)
    geometry.rotateY(-C.HALF_PI)
    geometry.translate(rightWall.distance, rightWall.height / 2, rightWall.length / 2)
    const material = new THREE.MeshBasicMaterial({
      color: 0xE0E0E0,
      transparent: true,
      opacity: 0.5
    })
    const mesh = new THREE.Mesh(geometry, material)
    scene.add(mesh)
    surfaces.push(mesh)
  }

  if (floor) {
    const geometry = new THREE.PlaneGeometry(floor.width, floor.depth)
    geometry.rotateX(-C.HALF_PI)
    geometry.translate(0, 0, floor.depth / 2)
    const material = new THREE.MeshBasicMaterial({
      color: 0xD0D0D0,
      transparent: true,
      opacity: 0.2
    })
    const mesh = new THREE.Mesh(geometry, material)
    scene.add(mesh)
    surfaces.push(mesh)
  }

  return surfaces
}

// const destroySurfaces = (scene, surfaces) => {
//   for (const surface of surfaces) {
//     U.disposeMesh(scene, surface)
//   }
// }

const main = async () => {

  const container = document.getElementById('container')
  const w = container.offsetWidth
  const h = container.offsetHeight
  const renderer = new THREE.WebGLRenderer({ antialias: true })
  renderer.setSize(w, h)
  container.appendChild(renderer.domElement)

  // TODO: set initial values for these via the query string
  let currentInstallationIndex = 0
  let currentCameraPoseIndex = 0
  let mode = Mode.Mode2D
  let showVertexNormals = false
  let axesHelper = undefined
  let autoRotate = false
  let autoRotateSpeed = .5

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
    .map(createRenderables(scene, resources))

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
    const cameraPoses = mode === Mode.Mode2D
      ? currentInstallation.installationData2D.cameraPoses
      : currentInstallation.installationData3D.cameraPoses
    if (reset) {
      currentCameraPoseIndex = 0
    } else {
      currentCameraPoseIndex += 1
      currentCameraPoseIndex %= cameraPoses.length
    }
    const cameraPose = cameraPoses[currentCameraPoseIndex]
    camera.position.copy(cameraPose.position)
    controls.target.copy(cameraPose.target)
  }

  const toggleMode = () => {
    mode = mode === Mode.Mode2D ? Mode.Mode3D : Mode.Mode2D
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

main()
