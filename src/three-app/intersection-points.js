import * as THREE from 'three'
import * as C from './constants'

const COLOURS = [
  new THREE.Color("red").getHex(),
  new THREE.Color("green").getHex(),
  new THREE.Color("blue").getHex(),
  new THREE.Color("yellow").getHex(),
  new THREE.Color("cyan").getHex(),
  new THREE.Color("purple").getHex(),
  new THREE.Color("orange").getHex(),
  new THREE.Color("pink").getHex()
]

export class IntersectionPoints {

  constructor(parent) {
    this._meshes = this._createMeshes(parent)
    this._visible = false
  }

  _createMeshes(parent) {
    return COLOURS.map(color => {
      const geometry = new THREE.CircleBufferGeometry(C.LINE_THICKNESS, 16)
      const material = new THREE.MeshBasicMaterial({ color, side: THREE.DoubleSide })
      const mesh = new THREE.Mesh(geometry, material)
      mesh.visible = false
      mesh.renderOrder = 1
      parent.add(mesh)
      return mesh
    })
  }

  update(points) {
    for (const mesh of this._meshes) {
      mesh.visible = false
    }
    if (this._visible) {
      points.slice(0, COLOURS.length).forEach((point, index) => {
        const mesh = this._meshes[index]
        mesh.position.x = point.x
        mesh.position.y = point.y
        mesh.visible = true
      })
    }
  }

  get visible() {
    return this._visible
  }

  set visible(value) {
    this._visible = value
    if (!value) {
      for (const mesh of this._meshes) {
        mesh.visible = value
      }
    }
  }
}
