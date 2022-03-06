import * as THREE from 'three'
import { InstallationBase } from './installation-base'
import { DoublingBackForm } from '../forms/doubling-back'
import { LeftWall, RightWall, Screen } from '../scenery'

export class DoublingBackInstallation extends InstallationBase {

  constructor() {

    super()

    this.forms = [
      new DoublingBackForm(6, 4)
    ]

    this.installationData2D = {
      screenForms: [
        { transform: new THREE.Matrix4() }
      ],
      cameraPoses: [
        { position: new THREE.Vector3(0, 0, 6), target: new THREE.Vector3() }
      ]
    }

    const transform3D = new THREE.Matrix4().makeTranslation(0, 2, 0)
    this.installationData3D = {
      screenForms: [
        { transform: transform3D }
      ],
      projectedForms: [
        { transform: transform3D, projectorPosition: new THREE.Vector3(-3.05, -1.9, 10) }
      ],
      cameraPoses: [
        { position: new THREE.Vector3(-0.85, 7.31, 17.00), target: new THREE.Vector3(-0.80, 2.00, 5.50) },
        { position: new THREE.Vector3(4.18, 4.64, 12.76), target: new THREE.Vector3(-0.8, 2, 5.5) },
        { position: new THREE.Vector3(1.3, 2, -6), target: new THREE.Vector3(0, 2, 0), hideScenery: true }
      ],
      scenery: [
        new Screen(6.4, 4.4),
        new LeftWall(10, 4.4, -3.2),
        new RightWall(10, 4.4, 3.2)
      ]
    }
  }
}
