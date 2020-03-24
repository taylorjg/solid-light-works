import * as THREE from 'three'
import { LeavingForm } from '../forms/leaving'
import { Projector } from '../projector'
import * as C from '../constants'

const LEFT_FORM_CX = -3.0
const RIGHT_FORM_CX = -LEFT_FORM_CX

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
        cameraPosition: new THREE.Vector3(1.02, 3.02, -10.02),
        controlsTarget: new THREE.Vector3(0.58, 2, 5.34)
      }
    ]

    this.leftProjectorPosition = new THREE.Vector3(LEFT_FORM_CX, C.PROJECTOR_CY, C.MEMBRANE_LENGTH)
    this.rightProjectorPosition = new THREE.Vector3(RIGHT_FORM_CX, C.PROJECTOR_CY, C.MEMBRANE_LENGTH)

    this.leftProjectorForm = new LeavingForm(
      this.leftProjectorPosition,
      true,
      LEFT_FORM_CX,
      C.PROJECTOR_CY,
      C.PROJECTOR_R,
      C.PROJECTOR_R,
      true)
    this.leftScreenForm = new LeavingForm(
      this.leftProjectorPosition,
      false,
      LEFT_FORM_CX,
      C.SCREEN_IMAGE_CY,
      C.SCREEN_IMAGE_RX,
      C.SCREEN_IMAGE_RY,
      true)

    this.rightProjectorForm = new LeavingForm(
      this.rightProjectorPosition,
      true,
      RIGHT_FORM_CX,
      C.PROJECTOR_CY,
      C.PROJECTOR_R,
      C.PROJECTOR_R,
      false)
    this.rightScreenForm = new LeavingForm(
      this.rightProjectorPosition,
      false,
      RIGHT_FORM_CX,
      C.SCREEN_IMAGE_CY,
      C.SCREEN_IMAGE_RX,
      C.SCREEN_IMAGE_RY,
      false)

    this.leftProjector = null
    this.rightProjector = null
  }

  create(scene, hazeTexture) {
    this.leftProjector = new Projector(
      this.leftProjectorPosition,
      C.ORIENTATION_HORIZONTAL,
      this.leftProjectorForm,
      this.leftScreenForm,
      scene,
      hazeTexture)
    this.rightProjector = new Projector(
      this.rightProjectorPosition,
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
