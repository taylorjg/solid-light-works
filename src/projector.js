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

  // TODO: move all the constructor params into an config object:
  //   projectorFormPoints
  //   screenFormPoints
  //   scene
  //   hazeTexture
  //   projectorLensTexture
  //   projectorPosition
  //   projectorDirection
  //   membraneLength
  //   meshCount
  constructor(projectorFormPoints, screenFormPoints, scene, meshCount, hazeTexture, projectorLensTexture, projectorPosition) {
    this.projectorFormPoints = projectorFormPoints
    this.screenFormPoints = screenFormPoints
    this.screenImage = new ScreenImage(scene, meshCount)
    this.projectionEffect = new ProjectionEffect(scene, meshCount, hazeTexture)
    addProjectorCasing(scene, projectorLensTexture, projectorPosition)
  }

  update() {
    const projectorPointsArray = this.projectorFormPoints.getUpdatedPoints()
    const screenPointsArray = this.screenFormPoints.getUpdatedPoints()
    this.screenImage.update(screenPointsArray)
    this.projectionEffect.update(projectorPointsArray, screenPointsArray)
  }

  toggleHelpers() {
    this.projectionEffect.toggleHelpers()
  }
}
