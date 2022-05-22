import * as THREE from 'three'

export class Pillar {

  constructor(size, height, x = 0, z = 0) {
    this._size = size
    this._height = height
    this._x = x
    this._z = z
  }

  create(parent) {
    const geometry = new THREE.BoxBufferGeometry(this._size, this._height, this._size)
    geometry.translate(this._x, this._height / 2, this._z)
    const material = new THREE.MeshBasicMaterial({ color: 0x303030 })
    const mesh = new THREE.Mesh(geometry, material)
    parent.add(mesh)
  }
}
