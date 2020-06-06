import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import { DoublingBackInstallation } from './installations/doubling-back'
import { CouplingInstallation } from './installations/coupling'
import { LeavingInstallation } from './installations/leaving'
import { BetweenYouAndIInstallation } from './installations/between-you-and-i'
import * as U from './utils'
import * as C from './constants'

const installations = [
  new DoublingBackInstallation(),
  new CouplingInstallation(),
  new LeavingInstallation(),
  new BetweenYouAndIInstallation()
]

const main = async () => {

  const container = document.getElementById('container')
  const w = container.offsetWidth
  const h = container.offsetHeight
  const renderer = new THREE.WebGLRenderer({ antialias: true })
  renderer.setSize(w, h)
  container.appendChild(renderer.domElement)

  let currentInstallationIndex = 0
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

  const createSurfaces = installation => {
    if (installation.screen) {
      const s = installation.screen
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

    if (installation.leftWall) {
      const lw = installation.leftWall
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

    if (installation.floor) {
      const f = installation.floor
      const floorGeometry = new THREE.PlaneGeometry(f.width, f.depth)
      floorGeometry.rotateX(-C.HALF_PI)
      floorGeometry.translate(0, 0, f.depth / 2)
      const floorMaterial = new THREE.MeshBasicMaterial({
        color: 0xD0D0D0,
        transparent: true,
        opacity: 0.2
      })
      const floor = new THREE.Mesh(floorGeometry, floorMaterial)
      scene.add(floor)
      surfaces.push(floor)
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

  const switchInstallation = reset => {
    if (reset) {
      currentInstallationIndex = 0
    } else {
      destroySurfaces()
      installations[currentInstallationIndex].destroy()
      currentInstallationIndex++
      currentInstallationIndex %= installations.length
    }
    createSurfaces(installations[currentInstallationIndex])
    installations[currentInstallationIndex].create(scene, hazeTexture)
    switchCameraPosition(true)
  }

  const switchCameraPosition = reset => {
    const installation = installations[currentInstallationIndex]
    if (reset) {
      currentCameraPositionIndex = 0
    } else {
      currentCameraPositionIndex++
      currentCameraPositionIndex %= installation.cameraPositions.length
    }
    camera.position.copy(installation.cameraPositions[currentCameraPositionIndex].cameraPosition)
    controls.target.copy(installation.cameraPositions[currentCameraPositionIndex].controlsTarget)
  }

  const toggleAutoRotate = () => {
    controls.autoRotate = !controls.autoRotate
  }

  const toggleVertexNormals = () => {
    installations[currentInstallationIndex].toggleVertexNormals()
  }

  const onDocumentKeyDownHandler = e => {
    if (e.altKey || e.ctrlKey || e.shiftKey || e.metaKey) return
    switch (e.key) {
      case 'a': return toggleAxes()
      case 'c': return reportCameraPosition()
      case 'f': return switchInstallation()
      case 'p': return switchCameraPosition()
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
    installations[currentInstallationIndex].update()
    controls.update()
    renderer.render(scene, camera)
    requestAnimationFrame(render)
  }

  render()
}

main()
