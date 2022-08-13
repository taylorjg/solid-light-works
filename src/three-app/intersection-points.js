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
    this._meshPairs = this._createMeshPairs(parent)
    this._visible = false
  }

  _createMeshPairs(parent) {
    return COLOURS.map(color => {
      const geometry = new THREE.CircleBufferGeometry(C.LINE_THICKNESS * 1.5, 16)
      const material = new THREE.MeshBasicMaterial({ color, side: THREE.DoubleSide })

      const meshAbove = new THREE.Mesh(geometry, material)
      meshAbove.visible = false
      meshAbove.translateZ(0.011)
      parent.add(meshAbove)

      const meshBelow = new THREE.Mesh(geometry, material)
      meshBelow.visible = false
      meshBelow.translateZ(-0.011)
      parent.add(meshBelow)

      return [meshAbove, meshBelow]
    })
  }

  update(points) {
    for (const [meshAbove, meshBelow] of this._meshPairs) {
      meshAbove.visible = false
      meshBelow.visible = false
    }

    if (this._visible) {
      points.slice(0, COLOURS.length).forEach((point, index) => {
        for (const mesh of this._meshPairs[index]) {
          mesh.position.x = point.x
          mesh.position.y = point.y
          mesh.visible = true
        }
      })
    }
  }

  get visible() {
    return this._visible
  }

  set visible(value) {
    this._visible = value
    if (!value) {
      for (const [meshAbove, meshBelow] of this._meshPairs) {
        meshAbove.visible = value
        meshBelow.visible = value
      }
    }
  }
}
