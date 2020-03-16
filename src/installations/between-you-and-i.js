import * as THREE from 'three'
import { BetweenYouAndIForm } from '../forms/between-you-and-i'
import { Projector } from '../projector'
import * as C from '../constants'

export class BetweenYouAndIInstallation {

  constructor() {

    this.floor = {
      width: 10,
      depth: 19
    }

    this.cameraPositions = [
      {
        cameraPosition: new THREE.Vector3(-4.6, 9.03, 30.78),
        controlsTarget: new THREE.Vector3(1.2, 2, 9.48)
      },
      {
        cameraPosition: new THREE.Vector3(4.27, 2.76, 23.73),
        controlsTarget: new THREE.Vector3(1.2, 2, 9.48)
      },
      {
        cameraPosition: new THREE.Vector3(-0.16, -8.18, 9.26),
        controlsTarget: new THREE.Vector3(0.45, 2, 9.25)
      }
    ]

    this.frontProjectorPosition = new THREE.Vector3(0, C.MEMBRANE_LENGTH, 12)
    this.backProjectorPosition = new THREE.Vector3(0, C.MEMBRANE_LENGTH, 7)

    this.frontProjectorForm = new BetweenYouAndIForm(this.frontProjectorPosition, true, true, 12)
    this.frontScreenForm = new BetweenYouAndIForm(this.frontProjectorPosition, false, true, 12)

    this.backProjectorForm = new BetweenYouAndIForm(this.backProjectorPosition, true, false, 7)
    this.backScreenForm = new BetweenYouAndIForm(this.backProjectorPosition, false, false, 7)

    this.frontProjector = null
    this.backProjector = null
  }

  create(scene, hazeTexture) {
    this.frontProjector = new Projector(
      this.frontProjectorPosition,
      C.ORIENTATION_VERTICAL,
      this.frontProjectorForm,
      this.frontScreenForm,
      scene,
      hazeTexture)
    this.backProjector = new Projector(
      this.backProjectorPosition,
      C.ORIENTATION_VERTICAL,
      this.backProjectorForm,
      this.backScreenForm,
      scene,
      hazeTexture)
  }

  destroy() {
    this.frontProjector && this.frontProjector.destroy()
    this.backProjector && this.backProjector.destroy()
    this.frontProjector = null
    this.backProjector = null
  }

  update() {
    this.frontProjector && this.frontProjector.update()
    this.backProjector && this.backProjector.update()
  }

  toggleVertexNormals() {
    this.frontProjector && this.frontProjector.toggleVertexNormals()
    this.backProjector && this.backProjector.toggleVertexNormals()
  }
}
