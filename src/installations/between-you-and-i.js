import * as THREE from 'three'
import { BetweenYouAndIForm } from '../forms/between-you-and-i'
import { Projector } from '../projector'
import * as C from '../constants'

export class BetweenYouAndIInstallation {

  constructor() {

    this.screen = {
      width: 16,
      height: 6
    }

    this.cameraPositions = [
      {
        cameraPosition: new THREE.Vector3(5.45, 4.04, 14.21),
        controlsTarget: new THREE.Vector3(1.06, 2, 3.31)
      },
      {
        cameraPosition: new THREE.Vector3(-5.69, 6.67, -5.35),
        controlsTarget: new THREE.Vector3(1.06, 2, 3.31)
      }
    ]

    const projectorPosition = new THREE.Vector3(0, C.PROJECTOR_CY * 4, C.MEMBRANE_LENGTH)

    this.projectorForm = new BetweenYouAndIForm(projectorPosition, true)
    this.screenForm = new BetweenYouAndIForm(projectorPosition, false)

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
