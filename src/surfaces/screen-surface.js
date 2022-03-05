import * as THREE from 'three'
import { SurfaceBase } from './surface-base'

export class ScreenSurface extends SurfaceBase {

  constructor(width, height) {
    super()
    this._width = width
    this._height = height
  }

  create(scene) {
    const geometry = new THREE.PlaneGeometry(this._width, this._height)
    geometry.translate(0, this._height / 2, 0)
    const material = new THREE.MeshBasicMaterial({
      color: 0xC0C0C0,
      transparent: true,
      opacity: 0.2
    })
    this._mesh = new THREE.Mesh(geometry, material)
    scene.add(this._mesh)
  }
}
