import * as THREE from 'three'
import { DoublingBackForm } from '../forms/doubling-back'
import { Projector } from '../projector'
import * as C from '../constants'

export class DoublingBackInstallation {

  constructor() {

    this.screen = {
      width: 6.4,
      height: 4.4
    }

    this.leftWall = {
      width: C.MEMBRANE_LENGTH,
      height: 4.4,
      x: -3.2
    }

    this.cameraPositions = [
      {
        cameraPosition: new THREE.Vector3(4.18, 4.64, 12.76),
        controlsTarget: new THREE.Vector3(-0.88, 2, 5.51)
      },
      {
        cameraPosition: new THREE.Vector3(1.52, 2.75, -6.79),
        controlsTarget: new THREE.Vector3(-0.88, 2, 5.51)
      },
      {
        cameraPosition: new THREE.Vector3(-9.02, 1.68, 9.85),
        controlsTarget: new THREE.Vector3(-0.88, 2, 5.51)
      }
    ]

    this.projectorPosition = new THREE.Vector3(-3.05, 0.1, C.MEMBRANE_LENGTH)

    this.projectorForm = new DoublingBackForm(this.projectorPosition, true)
    this.screenForm = new DoublingBackForm(this.projectorPosition, false)

    this.projector = null
  }

  create(scene, hazeTexture) {
    this.projector = new Projector(
      this.projectorPosition,
      C.ORIENTATION_HORIZONTAL,
      this.projectorForm,
      this.screenForm,
      scene,
      hazeTexture)
  }

  destroy() {
    this.projector && this.projector.destroy()
    this.projector = null
  }

  update() {
    this.projector && this.projector.update()
  }

  toggleVertexNormals() {
    this.projector && this.projector.toggleVertexNormals()
  }
}
