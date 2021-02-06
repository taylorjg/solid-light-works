import * as THREE from 'three'
import { LeavingForm } from '../forms/leaving'

const SCREEN_LEFT_CX = -2.2
const SCREEN_RIGHT_CX = 2.2
const SCREEN_CY = 2.4
const SCREEN_RX = 2
const SCREEN_RY = 1.6
const PROJECTOR_HEIGHT = 0.3
const PROJECTOR_DISTANCE = 10

export class LeavingInstallation2 {

  constructor() {

    this.forms = [
      new LeavingForm(SCREEN_RX, SCREEN_RY, true),
      new LeavingForm(SCREEN_RX, SCREEN_RY, false)
    ]

    this.installationData2D = {
      screenForms: [
        { transform: new THREE.Matrix4().makeTranslation(SCREEN_LEFT_CX, 0, 0) },
        { transform: new THREE.Matrix4().makeTranslation(SCREEN_RIGHT_CX, 0, 0) }
      ],
      cameraPoses: [
        { position: new THREE.Vector3(0, 0, 8), target: new THREE.Vector3() }
      ]
    }

    this.installationData3D = {
      screenForms: [
        { transform: new THREE.Matrix4().makeTranslation(SCREEN_LEFT_CX, SCREEN_CY, 0) },
        { transform: new THREE.Matrix4().makeTranslation(SCREEN_RIGHT_CX, SCREEN_CY, 0) }
      ],
      projectedForms: [
        {
          transform: new THREE.Matrix4().makeTranslation(SCREEN_LEFT_CX, SCREEN_CY, 0),
          projectorPosition: new THREE.Vector3(0, PROJECTOR_HEIGHT - SCREEN_CY, PROJECTOR_DISTANCE)
        },
        {
          transform: new THREE.Matrix4().makeTranslation(SCREEN_RIGHT_CX, SCREEN_CY, 0),
          projectorPosition: new THREE.Vector3(0, PROJECTOR_HEIGHT - SCREEN_CY, PROJECTOR_DISTANCE)
        }
      ],
      cameraPoses: [
        { position: new THREE.Vector3(-13.13, 2.42, 9.03), target: new THREE.Vector3(-0.75, 2, 4.43) },
        { position: new THREE.Vector3(1.02, 3.02, -10.02), target: new THREE.Vector3(0.58, 2, 5.34) }
      ],
      screen: {
        width: 14,
        height: 6
      }
    }
  }
}
