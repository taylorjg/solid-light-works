import * as THREE from 'three'
import { LeavingForm } from '../forms/leaving'
import { Projector } from '../projector'
import * as C from '../constants'

const LEFT_FORM_CX = -3.5
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

    this.leftScreenForm = new LeavingForm(
      LEFT_FORM_CX,
      C.SCREEN_IMAGE_CY,
      C.SCREEN_IMAGE_RX,
      C.SCREEN_IMAGE_RY,
      true)

    this.rightScreenForm = new LeavingForm(
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
      this.leftScreenForm,
      scene,
      hazeTexture)

    this.rightProjector = new Projector(
      this.rightProjectorPosition,
      C.ORIENTATION_HORIZONTAL,
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
