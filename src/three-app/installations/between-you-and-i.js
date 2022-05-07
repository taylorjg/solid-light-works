import * as THREE from 'three'
import { BetweenYouAndIForm } from '../forms/between-you-and-i'
import { Floor } from '../scenery'
import * as C from '../constants'

const makeWork1 = () => {
  const rotationX = new THREE.Matrix4().makeRotationX(-C.HALF_PI)
  const rotationY = new THREE.Matrix4().makeRotationY(C.HALF_PI)
  const translationForm1 = new THREE.Matrix4().makeTranslation(0, 0, 9)
  const translationForm2 = new THREE.Matrix4().makeTranslation(0, 0, 4)
  const transformForm1 = new THREE.Matrix4()
    .premultiply(rotationX)
    .premultiply(rotationY)
    .premultiply(translationForm1)
  const transformForm2 = new THREE.Matrix4()
    .premultiply(rotationX)
    .premultiply(rotationY)
    .premultiply(translationForm2)

  return {
    formConfigs: [
      {
        form: new BetweenYouAndIForm(4, 3, true),
        config2D: {
          transform: new THREE.Matrix4()
            .multiply(new THREE.Matrix4().makeTranslation(-2.5, 0, 0))
        },
        config3D: {
          transform: transformForm1,
          projectorPosition: new THREE.Vector3(0, 0, 10)
        }
      },
      {
        form: new BetweenYouAndIForm(4, 3, false),
        config2D: {
          transform: new THREE.Matrix4()
            .multiply(new THREE.Matrix4().makeTranslation(2.5, 0, 0))
        },
        config3D: {
          transform: transformForm2,
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
