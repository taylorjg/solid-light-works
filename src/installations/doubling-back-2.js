import * as THREE from 'three'
import { DoublingBackForm } from '../forms/doubling-back'

export class DoublingBackInstallation2 {

  constructor() {

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
        { position: new THREE.Vector3(4.18, 4.64, 12.76), target: new THREE.Vector3(-0.8, 2, 5.5) },
        { position: new THREE.Vector3(1.52, 2.75, -6.79), target: new THREE.Vector3(-0.8, 2, 5.5) },
        { position: new THREE.Vector3(-9.02, 1.68, 9.85), target: new THREE.Vector3(-0.8, 2, 5.5) }
      ],
      screen: {
        width: 6.4,
        height: 4.4
      },
      leftWall: {
        length: 10,
        height: 4.4,
        distance: -3.2
      }
    }
  }
}
