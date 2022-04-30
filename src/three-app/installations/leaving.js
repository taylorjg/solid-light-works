import * as THREE from 'three'
import { InstallationBase } from './installation-base'
import { LeavingForm } from '../forms/leaving'
import { Screen } from '../scenery'

const makeWork1 = () => {
  const ELLIPSE_CX_LEFT = -2.2
  const ELLIPSE_CX_RIGHT = 2.2
  const ELLIPSE_CY = 2.4
  const ELLIPSE_RX = 2
  const ELLIPSE_RY = 1.6
  const PROJECTOR_HEIGHT = 0.3
  const PROJECTOR_DISTANCE = 10

  return {
    formConfigs: [
      {
        form: new LeavingForm(ELLIPSE_RX, ELLIPSE_RY, true),
        config2D: {
          transform: new THREE.Matrix4().makeTranslation(ELLIPSE_CX_LEFT, 0, 0),
        },
        config3D: {
          transform: new THREE.Matrix4().makeTranslation(ELLIPSE_CX_LEFT, ELLIPSE_CY, 0),
          projectorPosition: new THREE.Vector3(0, PROJECTOR_HEIGHT - ELLIPSE_CY, PROJECTOR_DISTANCE)
        }
      },
      {
        form: new LeavingForm(ELLIPSE_RX, ELLIPSE_RY, false),
        config2D: {
          transform: new THREE.Matrix4().makeTranslation(ELLIPSE_CX_RIGHT, 0, 0)
        },
        config3D: {
          transform: new THREE.Matrix4().makeTranslation(ELLIPSE_CX_RIGHT, ELLIPSE_CY, 0),
          projectorPosition: new THREE.Vector3(0, PROJECTOR_HEIGHT - ELLIPSE_CY, PROJECTOR_DISTANCE)
        }
      }
    ]
  }
}

const config = {
  works: [
    makeWork1()
  ],
  config2D: {
    cameraPose: { position: new THREE.Vector3(0, 0, 8), target: new THREE.Vector3() }
  },
  config3D: {
    cameraPoses: [
      { position: new THREE.Vector3(-10.06, 1.50, 9.81), target: new THREE.Vector3(-0.75, 2.00, 4.43) },
      { position: new THREE.Vector3(0.46, 1.21, 13.56), target: new THREE.Vector3(-0.54, 0.96, 4.38) },
      { position: new THREE.Vector3(0, 2, -6.75), target: new THREE.Vector3(0, 2.4, 0), isBehind: true }
    ],
    scenery: [
      new Screen(14, 6)
    ]
  }
}

export class LeavingInstallation extends InstallationBase {
  constructor() {
    super()
    this.config = config
  }
}
