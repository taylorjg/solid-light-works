import * as THREE from 'three'
import * as C from './constants'

const PROJECTOR_CASING_WIDTH = 1.2
const PROJECTOR_CASING_HEIGHT = 0.6
const PROJECTOR_CASING_DEPTH = 0.6

export const addProjectorCasing = (scene, texture, position) => {

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

  const lensSize = C.PROJECTOR_BULB_RADIUS * 2
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
