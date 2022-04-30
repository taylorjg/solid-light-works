import * as THREE from 'three'
import { BetweenYouAndIForm } from '../forms/between-you-and-i'
import { Floor } from '../scenery'
import * as C from '../constants'

const makeWork1 = () => {
  const rotation2D = new THREE.Matrix4().makeRotationZ(-C.HALF_PI)

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

  return {
    formConfigs: [
      {
        form: new BetweenYouAndIForm(3, 4, true),
        config2D: {
          transform: new THREE.Matrix4()
            .multiply(new THREE.Matrix4().makeTranslation(-2.5, 0, 0))
            .multiply(rotation2D)
        },
        config3D: {
          transform: transform3D1,
          projectorPosition: new THREE.Vector3(0, 0, 10)
        }
      },
      {
        form: new BetweenYouAndIForm(3, 4, false),
        config2D: {
          transform: new THREE.Matrix4()
            .multiply(new THREE.Matrix4().makeTranslation(2.5, 0, 0))
            .multiply(rotation2D)
        },
        config3D: {
          transform: transform3D2,
          projectorPosition: new THREE.Vector3(0, 0, 10)
        }
      }
    ]
  }
}

export const config = {
  works: [
    makeWork1()
  ],
  config2D: {
    cameraPose: { position: new THREE.Vector3(0, 0, 8), target: new THREE.Vector3() }
  },
  config3D: {
    cameraPoses: [
      { position: new THREE.Vector3(4.44, 3.43, 13.70), target: new THREE.Vector3(1.20, 2.00, 9.48) },
      { position: new THREE.Vector3(-3.62, 4.46, 23.05), target: new THREE.Vector3(1.08, 3.34, 9.27) },
      { position: new THREE.Vector3(0.11, -7.74, 6.39), target: new THREE.Vector3(-0.32, 1.65, 6.39), isBehind: true }
    ],
    scenery: [
      new Floor(10, 13)
    ]
  }
}
