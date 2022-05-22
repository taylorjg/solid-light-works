import * as THREE from 'three'

export class FloatingScreen {

  constructor(width, height) {
    this._width = width
    this._height = height
  }

  create(parent) {
    const geometry = new THREE.PlaneGeometry(this._width, this._height)
    geometry.translate(0, this._height / 2, 0)
    const material = new THREE.MeshBasicMaterial({
      color: 0xC0C0C0,
      transparent: true,
      opacity: 0.2
    })
    const mesh = new THREE.Mesh(geometry, material)
    parent.add(mesh)
  }
}
