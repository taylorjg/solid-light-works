import * as THREE from 'three'
import * as C from '../constants'

export class RightWall {

  constructor(length, height, distance) {
    this._length = length
    this._height = height
    this._distance = distance
  }

  create(parent) {
    const geometry = new THREE.PlaneGeometry(this._length, this._height)
    geometry.rotateY(-C.HALF_PI)
    geometry.translate(this._distance, this._height / 2, this._length / 2)
    const material = new THREE.MeshBasicMaterial({
      color: 0xE0E0E0,
      transparent: true,
      opacity: 0.5
    })
    const mesh = new THREE.Mesh(geometry, material)
    parent.add(mesh)
  }
}
