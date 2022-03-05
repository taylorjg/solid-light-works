import * as THREE from 'three'
import { InstallationBase } from './installation-base'
import { CouplingForm } from '../forms/coupling'
import { FloorSurface } from '../surfaces/floor-surface'
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
        { position: new THREE.Vector3(1.88, -6, 3.86), target: new THREE.Vector3(-0.32, 2, 3.46) }
      ],
      surfaces: [
        new FloorSurface(12, 8)
      ]
    }
  }
}
