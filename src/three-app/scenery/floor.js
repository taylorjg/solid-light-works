import * as THREE from 'three'
import * as C from '../constants'

export class Floor {

  constructor(width, depth) {
    this._width = width
    this._depth = depth
  }

  create(parent) {
    const geometry = new THREE.PlaneGeometry(this._width, this._depth)
    geometry.rotateX(-C.HALF_PI)
    geometry.translate(0, 0, this._depth / 2)
    const material = new THREE.MeshBasicMaterial({
      color: 0xD0D0D0,
      transparent: true,
      opacity: 0.2
    })
    const mesh = new THREE.Mesh(geometry, material)
    parent.add(mesh)
  }
}
