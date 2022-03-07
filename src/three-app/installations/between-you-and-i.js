import * as THREE from 'three'
import { InstallationBase } from './installation-base'
import { BetweenYouAndIForm } from '../forms/between-you-and-i'
import { Floor } from '../scenery'
import * as C from '../constants'

export class BetweenYouAndIInstallation extends InstallationBase {

  constructor() {

    super()

    this.forms = [
      new BetweenYouAndIForm(3, 4, true),
      new BetweenYouAndIForm(3, 4, false)
    ]

    const rotation2D = new THREE.Matrix4().makeRotationZ(-C.HALF_PI)

    this.installationData2D = {
      screenForms: [
        {
          transform: new THREE.Matrix4()
            .multiply(new THREE.Matrix4().makeTranslation(-2.5, 0, 0))
            .multiply(rotation2D)
        },
        {
          transform: new THREE.Matrix4()
            .multiply(new THREE.Matrix4().makeTranslation(2.5, 0, 0))
            .multiply(rotation2D)
        }
      ],
      cameraPoses: [
        { position: new THREE.Vector3(0, 0, 8), target: new THREE.Vector3() }
      ]
    }

    const rotation3DX = new THREE.Matrix4().makeRotationX(-C.HALF_PI)
    const rotation3DY = new THREE.Matrix4().makeRotationY(C.PI)
    // const rotation3DZ = new THREE.Matrix4().makeRotationZ(C.PI)
    const translation3D1 = new THREE.Matrix4().makeTranslation(0, 0, 4)
    const translation3D2 = new THREE.Matrix4().makeTranslation(0, 0, 9)
    const transform3D1 = new THREE.Matrix4()
      .multiply(translation3D1)
      // .multiply(rotation3DZ)
      .multiply(rotation3DY)
      .multiply(rotation3DX)
    const transform3D2 = new THREE.Matrix4()
      .multiply(translation3D2)
      // .multiply(rotation3DZ)
      .multiply(rotation3DY)
      .multiply(rotation3DX)

    this.installationData3D = {
      screenForms: [
        {
          transform: transform3D1
        },
        {
          transform: transform3D2
        }
      ],
      projectedForms: [
        {
          transform: transform3D1,
          projectorPosition: new THREE.Vector3(0, 0, 10)
        },
        {
          transform: transform3D2,
          projectorPosition: new THREE.Vector3(0, 0, 10)
        }
      ],
      cameraPoses: [
        { position: new THREE.Vector3(4.44, 3.43, 13.70), target: new THREE.Vector3(1.20, 2.00, 9.48) },
        { position: new THREE.Vector3(-3.62, 4.46, 23.05), target: new THREE.Vector3(1.08, 3.34, 9.27) },
        { position: new THREE.Vector3(0.11, -7.74, 6.39), target: new THREE.Vector3(-0.32, 1.65, 6.39), hideScenery: true }
        // { position: new THREE.Vector3(-1.10, -7.72, 6.38), target: new THREE.Vector3(-0.32, 1.65, 6.39), hideScenery: true }
      ],
      scenery: [
        new Floor(10, 13)
      ]
    }
  }
}
