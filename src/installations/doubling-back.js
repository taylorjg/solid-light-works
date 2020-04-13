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
      width: 10,
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

    this.projectorPosition = new THREE.Vector3(-3.05, 0.1 - 2, 10)
    this.screenForm = new DoublingBackForm(6, 4)
    this.projector = null
  }

  create(scene, hazeTexture) {
    this.projector = new Projector(
      this.projectorPosition,
      this.screenForm,
      scene,
      hazeTexture,
      mesh => mesh.translateY(2))
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
