import * as THREE from 'three'
import { SurfaceBase } from './surface-base'
import * as C from '../constants'

export class LeftWallSurface extends SurfaceBase {

  constructor(length, height, distance) {
    super()
    this._length = length
    this._height = height
    this._distance = distance
  }

  create(scene) {
    const geometry = new THREE.PlaneGeometry(this._length, this._height)
    geometry.rotateY(C.HALF_PI)
    geometry.translate(this._distance, this._height / 2, this._length / 2)
    const material = new THREE.MeshBasicMaterial({
      color: 0xA0A0A0,
      transparent: true,
      opacity: 0.2
    })
    this._mesh = new THREE.Mesh(geometry, material)
    scene.add(this._mesh)
  }
}
