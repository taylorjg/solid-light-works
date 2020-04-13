import * as THREE from 'three'
import { CouplingForm } from '../forms/coupling'
import { Projector } from '../projector'
import * as C from '../constants'

export class CouplingInstallation {

  constructor() {

    this.floor = {
      width: 8,
      depth: 12
    }

    this.cameraPositions = [
      {
        cameraPosition: new THREE.Vector3(0, 2, 12),
        controlsTarget: new THREE.Vector3(0, 0, 3)
      },
      {
        cameraPosition: new THREE.Vector3(1.88, -6, 3.86),
        controlsTarget: new THREE.Vector3(-0.32, 2, 3.46)
      }
    ]

    this.projectorPosition = new THREE.Vector3(0, 0, -10)
    this.screenForm = new CouplingForm(2, 1)
    this.projector = null
  }

  create(scene, hazeTexture) {
    this.projector = new Projector(
      this.projectorPosition,
      this.screenForm,
      scene,
      hazeTexture,
      mesh => mesh
        .rotateX(C.HALF_PI)
        .translateY(6))
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
