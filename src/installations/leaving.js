import * as THREE from 'three'
import { InstallationBase } from './installation-base'
import { LeavingForm } from '../forms/leaving'
import { Screen } from '../scenery'

const SCREEN_CX_LEFT = -2.2
const SCREEN_CX_RIGHT = 2.2
const SCREEN_CY = 2.4
const SCREEN_RX = 2
const SCREEN_RY = 1.6
const PROJECTOR_HEIGHT = 0.3
const PROJECTOR_DISTANCE = 10

export class LeavingInstallation extends InstallationBase {

  constructor() {

    super()

    this.forms = [
      new LeavingForm(SCREEN_RX, SCREEN_RY, true),
      new LeavingForm(SCREEN_RX, SCREEN_RY, false)
    ]

    this.installationData2D = {
      screenForms: [
        { transform: new THREE.Matrix4().makeTranslation(SCREEN_CX_LEFT, 0, 0) },
        { transform: new THREE.Matrix4().makeTranslation(SCREEN_CX_RIGHT, 0, 0) }
      ],
      cameraPoses: [
        { position: new THREE.Vector3(0, 0, 8), target: new THREE.Vector3() }
      ]
    }

    this.installationData3D = {
      screenForms: [
        { transform: new THREE.Matrix4().makeTranslation(SCREEN_CX_LEFT, SCREEN_CY, 0) },
        { transform: new THREE.Matrix4().makeTranslation(SCREEN_CX_RIGHT, SCREEN_CY, 0) }
      ],
      projectedForms: [
        {
          transform: new THREE.Matrix4().makeTranslation(SCREEN_CX_LEFT, SCREEN_CY, 0),
          projectorPosition: new THREE.Vector3(0, PROJECTOR_HEIGHT - SCREEN_CY, PROJECTOR_DISTANCE)
        },
        {
          transform: new THREE.Matrix4().makeTranslation(SCREEN_CX_RIGHT, SCREEN_CY, 0),
          projectorPosition: new THREE.Vector3(0, PROJECTOR_HEIGHT - SCREEN_CY, PROJECTOR_DISTANCE)
        }
      ],
      cameraPoses: [
        { position: new THREE.Vector3(-10.06, 1.50, 9.81), target: new THREE.Vector3(-0.75, 2.00, 4.43) },
        { position: new THREE.Vector3(0.46, 1.21, 13.56), target: new THREE.Vector3(-0.54, 0.96, 4.38) }
      ],
      scenery: [
        new Screen(14, 6)
      ]
    }
  }
}
