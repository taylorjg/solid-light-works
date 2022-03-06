import * as THREE from 'three'
import { InstallationBase } from './installation-base'
import { CouplingForm } from '../forms/coupling'
import { Floor } from '../scenery'
import * as C from '../constants'

export class CouplingInstallation extends InstallationBase {

  constructor() {

    super()

    this.forms = [
      new CouplingForm(2, 1)
    ]

    this.installationData2D = {
      screenForms: [
        {
          transform: new THREE.Matrix4()
        }
      ],
      cameraPoses: [
        { position: new THREE.Vector3(0, 0, 6), target: new THREE.Vector3() }
      ]
    }

    const translation3D = new THREE.Matrix4().makeTranslation(0, 0, 4)
    const rotation3D = new THREE.Matrix4().makeRotationX(-C.HALF_PI)
    const transform3D = new THREE.Matrix4()
      .multiply(translation3D)
      .multiply(rotation3D)

    this.installationData3D = {
      screenForms: [
        {
          transform: transform3D
        }
      ],
      projectedForms: [
        {
          transform: transform3D,
          projectorPosition: new THREE.Vector3(0, 0, 10)
        }
      ],
      cameraPoses: [
        { position: new THREE.Vector3(0, 2, 12), target: new THREE.Vector3(0, 0, 3) },
        { position: new THREE.Vector3(-2.10, 5.85, 20.04), target: new THREE.Vector3(0.43, 4.16, 4.94) },
        { position: new THREE.Vector3(0, -6.3, 3.7), target: new THREE.Vector3(0, 2, 4), hideScenery: true }
      ],
      scenery: [
        new Floor(12, 8)
      ]
    }
  }
}
