import * as THREE from 'three'
import * as C from './constants'
import * as U from './utils'

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

  constructor(scene, screenForm) {
    this._scene = scene
    this._screenForm = screenForm
    this._meshes = undefined
    this._visible = false
  }

  _createMeshes() {
    if (!this._meshes) {
      this._meshes = COLOURS.map(color => {
        const geometry = new THREE.CircleBufferGeometry(C.SCREEN_IMAGE_LINE_THICKNESS, 16)
        const material = new THREE.MeshBasicMaterial({ color })
        const mesh = new THREE.Mesh(geometry, material)
        mesh.visible = false
        mesh.renderOrder = 1
        this._scene.add(mesh)
        return mesh
      })
    }
  }

  _destroyMeshes() {
    if (this._meshes) {
      for (const mesh of this._meshes) {
        U.disposeMesh(this._scene, mesh)
      }
      this._meshes = undefined
    }
  }

  update(points) {
    this._createMeshes()
    for (const mesh of this._meshes) {
      mesh.visible = false
    }
    if (this._visible) {
      points.forEach((point, index) => {
        const mesh = this._meshes[index]
        mesh.position.x = point.x
        mesh.position.y = point.y
        mesh.applyMatrix4(this._screenForm.transform)
        mesh.visible = true
      })
    }
  }

  get visible() {
    return this._visible
  }

  set visible(value) {
    this._visible = value
    if (this._meshes && !value) {
      for (const mesh of this._meshes) {
        mesh.visible = false
      }
    }
  }
}
