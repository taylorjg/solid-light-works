import * as THREE from 'three'
import { CouplingForm } from '../forms/coupling'
import { Projector } from '../projector'
import * as C from '../constants'

export class CouplingInstallation {

  constructor() {

    this.screen = {
      width: 10,
      height: 6
    }

    this.cameraPositions = [
      {
        cameraPosition: new THREE.Vector3(5.88, 4.12, 12.26),
        controlsTarget: new THREE.Vector3(-0.81, 2, 2.62)
      },
      {
        cameraPosition: new THREE.Vector3(0.81, 5.01, -6.45),
        controlsTarget: new THREE.Vector3(-0.27, 2, 3.83)
      }
    ]

    const projectorPosition = new THREE.Vector3(0, C.PROJECTOR_CY * 4, C.MEMBRANE_LENGTH)

    this.projectorForm = new CouplingForm(projectorPosition, true)
    this.screenForm = new CouplingForm(projectorPosition, false)

    this.projector = null
  }

  create(scene, hazeTexture) {
    this.projector = new Projector(
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
