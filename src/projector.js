import * as THREE from 'three'
import { ProjectionEffect } from './projection-effect'
import { ScreenImage } from './screen-image'
import * as C from './constants'

export const addProjectorCasing = (scene, texture, position) => {

  const PROJECTOR_CASING_WIDTH = 1.2
  const PROJECTOR_CASING_HEIGHT = 0.6
  const PROJECTOR_CASING_DEPTH = 0.6

  const dimensions = [
    PROJECTOR_CASING_WIDTH,
    PROJECTOR_CASING_HEIGHT,
    PROJECTOR_CASING_DEPTH
  ]

  const projectorCasingGeometry = new THREE.BoxBufferGeometry(...dimensions)
  const projectorCasingMaterial = new THREE.MeshBasicMaterial({ color: 0x808080 })
  const projectorCasingMesh = new THREE.Mesh(projectorCasingGeometry, projectorCasingMaterial)
  projectorCasingMesh.position.copy(position)
  projectorCasingMesh.position.add(new THREE.Vector3(0, 0, PROJECTOR_CASING_DEPTH / 2))
  scene.add(projectorCasingMesh)

  const lensSize = C.PROJECTOR_R * 2
  const projectorLensGeometry = new THREE.PlaneBufferGeometry(lensSize, lensSize)
  const projectorLensMaterial = new THREE.MeshBasicMaterial({
    color: 0xffffff,
    map: texture,
    side: THREE.DoubleSide,
    transparent: true
  })
  const projectorLensMesh = new THREE.Mesh(projectorLensGeometry, projectorLensMaterial)
  projectorLensMesh.position.copy(position)
  scene.add(projectorLensMesh)
}

export class Projector {

  // TODO: add options instead of current last 3 params
  //   scene
  //   hazeTexture
  //   projectorLensTexture
  //   projectorPosition
  //   projectorDirection ?
  //   membraneLength ?
  // TODO: add support for multiple membranes

  // e.g. a straight line + a wave + an ellipse
  // http://moussemagazine.it/app/uploads/180110_PW_McCall_001-e1518002087117.jpg

  constructor(projectorFormPoints, screenFormPoints, scene, hazeTexture, projectorLensTexture) {
    this.projectorFormPoints = projectorFormPoints
    this.screenFormPoints = screenFormPoints
    this.screenImage = new ScreenImage(scene)
    this.projectionEffect = new ProjectionEffect(scene, hazeTexture)
    const projectorPosition = new THREE.Vector3(
      projectorFormPoints.cx,
      projectorFormPoints.cy,
      C.MEMBRANE_LENGTH)
    addProjectorCasing(scene, projectorLensTexture, projectorPosition)
  }

  update() {
    const projectorPoints = this.projectorFormPoints.getUpdatedPoints()
    const screenPoints = this.screenFormPoints.getUpdatedPoints()
    this.screenImage.update(screenPoints)
    this.projectionEffect.update(projectorPoints, screenPoints)
  }

  toggleHelpers() {
    this.projectionEffect.toggleHelpers()
  }
}
