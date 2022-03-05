import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import { DoublingBackInstallation } from './installations/doubling-back'
import { LeavingInstallation } from './installations/leaving'
import { CouplingInstallation } from './installations/coupling'
import { BetweenYouAndIInstallation } from './installations/between-you-and-i'
import { ScreenImage } from './screen-image'
import { ProjectionEffect } from './projection-effect'
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
    projectionEffects: projectedForms.map(projectedForm => new ProjectionEffect(scene, projectedForm, resources))
  }
}

const createRenderables = (scene, resources) => installation => ({
  ...installation,
  renderables2D: createRenderables2D(scene, installation),
  renderables3D: createRenderables3D(scene, installation, resources)
})

const main = async () => {

  const container = document.getElementById('container')
  const w = container.offsetWidth
  const h = container.offsetHeight
  const renderer = new THREE.WebGLRenderer({ antialias: true })
  renderer.setSize(w, h)
  container.appendChild(renderer.domElement)

  const MODE_2D = Symbol('MODE_2D')
  const MODE_3D = Symbol('MODE_3D')

  let currentInstallationIndex = 0
  let currentCameraPoseIndex = 0
  let mode = MODE_2D
  let showVertexNormals = false
  let axesHelper = undefined

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

  // const createSurfaces = installation => {
  //   if (installation.screen) {
  //     const s = installation.screen
  //     const screenGeometry = new THREE.PlaneGeometry(s.width, s.height)
  //     screenGeometry.translate(0, s.height / 2, 0)
  //     const screenMaterial = new THREE.MeshBasicMaterial({
  //       color: 0xC0C0C0,
  //       transparent: true,
  //       opacity: 0.2
  //     })
  //     const screen = new THREE.Mesh(screenGeometry, screenMaterial)
  //     scene.add(screen)
  //     surfaces.push(screen)
  //   }

  //   if (installation.leftWall) {
  //     const lw = installation.leftWall
  //     const leftWallGeometry = new THREE.PlaneGeometry(lw.width, lw.height)
  //     leftWallGeometry.rotateY(C.HALF_PI)
  //     leftWallGeometry.translate(lw.x, lw.height / 2, lw.width / 2)
  //     const leftWallMaterial = new THREE.MeshBasicMaterial({
  //       color: 0xA0A0A0,
  //       transparent: true,
  //       opacity: 0.2
  //     })
  //     const leftWall = new THREE.Mesh(leftWallGeometry, leftWallMaterial)
  //     scene.add(leftWall)
  //     surfaces.push(leftWall)
  //   }

  //   if (installation.floor) {
  //     const f = installation.floor
  //     const floorGeometry = new THREE.PlaneGeometry(f.width, f.depth)
  //     floorGeometry.rotateX(-C.HALF_PI)
  //     floorGeometry.translate(0, 0, f.depth / 2)
  //     const floorMaterial = new THREE.MeshBasicMaterial({
  //       color: 0xD0D0D0,
  //       transparent: true,
  //       opacity: 0.2
  //     })
  //     const floor = new THREE.Mesh(floorGeometry, floorMaterial)
  //     scene.add(floor)
  //     surfaces.push(floor)
  //   }
  // }

  // const destroySurfaces = () => {
  //   surfaces.forEach(surface => U.disposeMesh(scene, surface))
  //   surfaces = []
  // }

  const hazeTexture = await U.loadTexture('haze.jpg')

  const resources = {
    hazeTexture
  }

  const installations = [
    new DoublingBackInstallation(),
    new LeavingInstallation(),
    new CouplingInstallation(),
    new BetweenYouAndIInstallation()
  ].map(createRenderables(scene, resources))

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
    // const p = camera.position
    // const t = controls.target
    // { position: new THREE.Vector3(0, 0, 6), target: new THREE.Vector3() }
    // console.log(`cameraPosition: new THREE.Vector3(${prec2(p.x)}, ${prec2(p.y)}, ${prec2(p.z)}),`)
    // console.log(`controlsTarget: new THREE.Vector3(${prec2(t.x)}, ${prec2(t.y)}, ${prec2(t.z)})`)
    // { position: new THREE.Vector3(0, 0, 6), target: new THREE.Vector3() }
    console.log(`{ position: ${newVector3(camera.position)}, target: ${newVector3(controls.target)} }`)
  }

  const updateVisibility = () => {
    installations.forEach((installation, index) => {
      const isCurrentInstallation = index === currentInstallationIndex
      const visible2D = isCurrentInstallation && mode === MODE_2D
      const visible3D = isCurrentInstallation && mode === MODE_3D
      installation.renderables2D.screenImages.forEach(screenImage => screenImage.visible = visible2D)
      installation.renderables3D.screenImages.forEach(screenImage => screenImage.visible = visible3D)
      installation.renderables3D.projectionEffects.forEach(projectionEffect => {
        projectionEffect.visible = visible3D
        projectionEffect.showVertexNormals = visible3D && showVertexNormals
      })
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
    const cameraPoses = mode === MODE_2D
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
    mode = mode === MODE_2D ? MODE_3D : MODE_2D
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

  const updateRenderables = installation => {
    installation.forms.forEach((form, index) => {
      const lines = form.getLines()
      switch (mode) {
        case MODE_2D:
          installation.renderables2D.screenImages[index].update(lines)
          break
        case MODE_3D:
          installation.renderables3D.screenImages[index].update(lines)
          installation.renderables3D.projectionEffects[index].update(lines)
          break
      }
    })
  }

  const render = () => {
    const currentInstallation = installations[currentInstallationIndex]
    updateRenderables(currentInstallation)
    controls.update()
    renderer.render(scene, camera)
    requestAnimationFrame(render)
  }

  render()
}

main()
