import * as THREE from 'three'
import { LeavingForm } from '../forms/leaving'
import { Projector } from '../projector'
import * as C from '../constants'

export class LeavingInstallation {

  constructor() {

    this.screen = {
      width: 16,
      height: 6
    }

    this.cameraPositions = [
      {
        cameraPosition: new THREE.Vector3(-13.13, 2.42, 9.03),
        controlsTarget: new THREE.Vector3(-0.75, 2, 4.43)
      },
      {
        cameraPosition: new THREE.Vector3(-2.79, 4.2, -9.53),
        controlsTarget: new THREE.Vector3(0.58, 2, 5.34)
      }
    ]

    const leftProjectorPosition = new THREE.Vector3(C.LEFT_FORM_CX, C.PROJECTOR_CY, C.MEMBRANE_LENGTH)
    const rightProjectorPosition = new THREE.Vector3(C.RIGHT_FORM_CX, C.PROJECTOR_CY, C.MEMBRANE_LENGTH)

    this.leftProjectorForm = new LeavingForm(
      leftProjectorPosition,
      C.LEFT_FORM_CX,
      C.PROJECTOR_CY,
      C.PROJECTOR_R,
      C.PROJECTOR_R,
      true)
    this.leftScreenForm = new LeavingForm(
      leftProjectorPosition,
      C.LEFT_FORM_CX,
      C.SCREEN_IMAGE_CY,
      C.SCREEN_IMAGE_RX,
      C.SCREEN_IMAGE_RY,
      true)

    this.rightProjectorForm = new LeavingForm(
      rightProjectorPosition,
      C.RIGHT_FORM_CX,
      C.PROJECTOR_CY,
      C.PROJECTOR_R,
      C.PROJECTOR_R,
      false)
    this.rightScreenForm = new LeavingForm(
      rightProjectorPosition,
      C.RIGHT_FORM_CX,
      C.SCREEN_IMAGE_CY,
      C.SCREEN_IMAGE_RX,
      C.SCREEN_IMAGE_RY,
      false)

    this.leftProjector = null
    this.rightProjector = null
  }

  create(scene, hazeTexture) {
    this.leftProjector = new Projector(
      C.ORIENTATION_HORIZONTAL,
      this.leftProjectorForm,
      this.leftScreenForm,
      scene,
      hazeTexture)
    this.rightProjector = new Projector(
      C.ORIENTATION_HORIZONTAL,
      this.rightProjectorForm,
      this.rightScreenForm,
      scene,
      hazeTexture)
  }

  destroy() {
    this.leftProjector && this.leftProjector.destroy()
    this.rightProjector && this.rightProjector.destroy()
    this.leftProjector = null
    this.rightProjector = null
  }

  update() {
    this.leftProjector && this.leftProjector.update()
    this.rightProjector && this.rightProjector.update()
  }

  toggleVertexNormals() {
    this.leftProjector && this.leftProjector.toggleVertexNormals()
    this.rightProjector && this.rightProjector.toggleVertexNormals()
  }
}
