import * as THREE from 'three'
import { SceneryBase } from './scenery-base'
import * as C from '../constants'

export class Floor extends SceneryBase {

  constructor(width, depth) {
    super()
    this._width = width
    this._depth = depth
  }

  create(scene) {
    const geometry = new THREE.PlaneGeometry(this._width, this._depth)
    geometry.rotateX(-C.HALF_PI)
    geometry.translate(0, 0, this._depth / 2)
    const material = new THREE.MeshBasicMaterial({
      color: 0xD0D0D0,
      transparent: true,
      opacity: 0.2
    })
    this._mesh = new THREE.Mesh(geometry, material)
    scene.add(this._mesh)
  }
}
