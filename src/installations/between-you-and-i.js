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

    this.frontProjectorPosition = new THREE.Vector3(0, 0, -10)
    this.backProjectorPosition = new THREE.Vector3(0, 0, -10)

    this.frontScreenForm = new BetweenYouAndIForm(1.5, 2, true)
    this.backScreenForm = new BetweenYouAndIForm(1.5, 2, false)

    this.frontProjector = null
    this.backProjector = null
  }

  create(scene, hazeTexture) {
    this.frontProjector = new Projector(
      this.frontProjectorPosition,
      this.frontScreenForm,
      scene,
      hazeTexture,
      mesh => mesh
        .rotateX(C.HALF_PI)
        .translateY(12))

    this.backProjector = new Projector(
      this.backProjectorPosition,
      this.backScreenForm,
      scene,
      hazeTexture,
      mesh => mesh
        .rotateX(C.HALF_PI)
        .translateY(7))
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
