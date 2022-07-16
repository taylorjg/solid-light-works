import * as THREE from 'three'
import * as C from '../constants'

export class FloatingScreen {

  constructor(width, height, x, z) {
    this._width = width // + C.LINE_THICKNESS
    this._height = height // + C.LINE_THICKNESS
    this._x = x
    this._z = z
  }

  create(parent) {
    const FRAME_THICKNESS = 0.1
    const HALF_FRAME_THICKNESS = FRAME_THICKNESS / 2
    const FRAME_ORDER = 2

    const group = new THREE.Group()
    group.translateX(this._x)
    group.translateY(this._height / 2 + FRAME_THICKNESS)
    group.translateZ(this._z)
    group.rotateY(C.HALF_PI)

    const frameMaterial = new THREE.MeshBasicMaterial({
      color: 0x101010,
      side: THREE.DoubleSide,
    })

    const topBottomGeometry = new THREE.PlaneGeometry(this._width + 2 * FRAME_THICKNESS, FRAME_THICKNESS)
    const leftRightGeometry = new THREE.PlaneGeometry(FRAME_THICKNESS, this._height)

    const topMesh = new THREE.Mesh(topBottomGeometry, frameMaterial)
    topMesh.translateY(this._height / 2 + HALF_FRAME_THICKNESS)
    topMesh.order = FRAME_ORDER
    group.add(topMesh)

    const bottomMesh = new THREE.Mesh(topBottomGeometry, frameMaterial)
    bottomMesh.translateY(-this._height / 2 - HALF_FRAME_THICKNESS)
    bottomMesh.order = FRAME_ORDER
    group.add(bottomMesh)

    const leftMesh = new THREE.Mesh(leftRightGeometry, frameMaterial)
    leftMesh.translateX(this._width / 2 + HALF_FRAME_THICKNESS)
    leftMesh.order = FRAME_ORDER
    group.add(leftMesh)

    const rightMesh = new THREE.Mesh(leftRightGeometry, frameMaterial)
    rightMesh.translateX(-this._width / 2 - HALF_FRAME_THICKNESS)
    rightMesh.order = FRAME_ORDER
    group.add(rightMesh)

    const screenGeometry = new THREE.PlaneGeometry(this._width, this._height)
    const screenMaterial = new THREE.MeshBasicMaterial({
      color: 0xC0C0C0,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.2,
    })
    const screenMesh = new THREE.Mesh(screenGeometry, screenMaterial)
    group.add(screenMesh)

    parent.add(group)
  }
}
