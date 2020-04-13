import * as THREE from 'three'
import { LeavingForm } from '../forms/leaving'
import { Projector } from '../projector'
import * as C from '../constants'

const SCREEN_LEFT_CX = -3.5
const SCREEN_RIGHT_CX = 3.5
const SCREEN_CY = 2.6
const SCREEN_RX = 2.8
const SCREEN_RY = 2
const PROJECTOR_HEIGHT = 0.3
const PROJECTOR_DISTANCE = 12

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

    this.leftProjectorPosition = new THREE.Vector3(0, PROJECTOR_HEIGHT - SCREEN_CY, PROJECTOR_DISTANCE)
    this.rightProjectorPosition = new THREE.Vector3(0, PROJECTOR_HEIGHT - SCREEN_CY, PROJECTOR_DISTANCE)

    this.leftScreenForm = new LeavingForm(SCREEN_RX, SCREEN_RY, true)
    this.rightScreenForm = new LeavingForm(SCREEN_RX, SCREEN_RY, false)

    this.leftProjector = null
    this.rightProjector = null
  }

  create(scene, hazeTexture) {
    this.leftProjector = new Projector(
      this.leftProjectorPosition,
      this.leftScreenForm,
      scene,
      hazeTexture,
      mesh => mesh
        .translateX(SCREEN_LEFT_CX)
        .translateY(SCREEN_CY))

    this.rightProjector = new Projector(
      this.rightProjectorPosition,
      this.rightScreenForm,
      scene,
      hazeTexture,
      mesh => mesh
        .translateX(SCREEN_RIGHT_CX)
        .translateY(SCREEN_CY))
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
