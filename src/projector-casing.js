import * as THREE from 'three'
import * as C from './constants'

const PROJECTOR_CASING_WIDTH = 1.2
const PROJECTOR_CASING_HEIGHT = 0.6
const PROJECTOR_CASING_DEPTH = 0.6
const HALF_PROJECTOR_CASING_HEIGHT = PROJECTOR_CASING_HEIGHT / 2
const HALF_PROJECTOR_CASING_DEPTH = PROJECTOR_CASING_DEPTH / 2

export const addProjectorCasing = async (scene, projectorLensTexture, side) => {

  const centreX = side === C.LEFT ? C.LEFT_CENTRE_X : C.RIGHT_CENTRE_X

  const dimensions = [PROJECTOR_CASING_WIDTH, PROJECTOR_CASING_HEIGHT, PROJECTOR_CASING_DEPTH]
  const projectorCasingGeometry = new THREE.BoxBufferGeometry(...dimensions)
  const projectorCasingMaterial = new THREE.MeshBasicMaterial({ color: 0x808080 })
  const projectorCasingMesh = new THREE.Mesh(projectorCasingGeometry, projectorCasingMaterial)
  projectorCasingMesh.position.setX(centreX)
  projectorCasingMesh.position.setY(HALF_PROJECTOR_CASING_HEIGHT)
  projectorCasingMesh.position.setZ(C.MEMBRANE_LENGTH + HALF_PROJECTOR_CASING_DEPTH)
  scene.add(projectorCasingMesh)

  const lensSize = C.PROJECTOR_BULB_RADIUS * 2
  const projectorLensGeometry = new THREE.PlaneBufferGeometry(lensSize, lensSize)
  const projectorLensMaterial = new THREE.MeshBasicMaterial({
    color: 0xffffff,
    map: projectorLensTexture,
    side: THREE.DoubleSide,
    transparent: true
  })
  const projectorLensMesh = new THREE.Mesh(projectorLensGeometry, projectorLensMaterial)
  projectorLensMesh.position.setX(centreX)
  projectorLensMesh.position.setY(HALF_PROJECTOR_CASING_HEIGHT)
  projectorLensMesh.position.setZ(C.MEMBRANE_LENGTH)
  scene.add(projectorLensMesh)
}
