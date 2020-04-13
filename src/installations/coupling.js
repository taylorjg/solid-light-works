import * as THREE from 'three'
import { CouplingForm } from '../forms/coupling'
import { Projector } from '../projector'
import * as C from '../constants'

export class CouplingInstallation {

  constructor() {

    this.floor = {
      width: 12,
      depth: 8
    }

    this.cameraPositions = [
      {
        cameraPosition: new THREE.Vector3(18.18, 4.98, 3.41),
        controlsTarget: new THREE.Vector3(-8.67, 2, 2.97)
      },
      {
        cameraPosition: new THREE.Vector3(1.88, -6, 3.86),
        controlsTarget: new THREE.Vector3(-0.32, 2, 3.46)
      }
    ]

    this.projectorPosition = new THREE.Vector3(0, C.MEMBRANE_LENGTH, 4)
    this.screenForm = new CouplingForm()
    this.projector = null
  }

  create(scene, hazeTexture) {
    this.projector = new Projector(
      this.projectorPosition,
      C.ORIENTATION_VERTICAL,
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
