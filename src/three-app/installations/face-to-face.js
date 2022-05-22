import * as THREE from 'three'
import { BetweenYouAndIForm } from '../forms/between-you-and-i'
import { Floor, Pillar } from '../scenery'
import * as C from '../constants'

const makeWork1 = () => {

  const transformForm1 = new THREE.Matrix4()
    .premultiply(new THREE.Matrix4().makeRotationY(C.HALF_PI))
    .premultiply(new THREE.Matrix4().makeTranslation(-4.8, 1.3, 3.25))

  const transformForm2 = new THREE.Matrix4()
    .premultiply(new THREE.Matrix4().makeRotationY(-C.HALF_PI))
    .premultiply(new THREE.Matrix4().makeTranslation(0.8, 1.3, 6.95))

  return {
    formConfigs: [
      {
        form: new BetweenYouAndIForm(4.5, 2.6, false),
        config2D: {
          transform: new THREE.Matrix4()
            .multiply(new THREE.Matrix4().makeTranslation(-2.5, 0, 0))
        },
        config3D: {
          transform: transformForm1,
          projectorPosition: new THREE.Vector3(2.25, -1.3, 10)
        }
      },
      {
        form: new BetweenYouAndIForm(4, 3, true),
        config2D: {
          transform: new THREE.Matrix4()
            .multiply(new THREE.Matrix4().makeTranslation(2.5, 0, 0))
        },
        config3D: {
          transform: transformForm2,
          projectorPosition: new THREE.Vector3(2.25, -1.3, 10)
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
      { position: new THREE.Vector3(3.03, 1.79, 10.03), target: new THREE.Vector3(-2.25, 0.78, 5.36) },
      { position: new THREE.Vector3(-10.60, 0.92, 7.55), target: new THREE.Vector3(-3.40, -0.37, 5.91) }
    ],
    scenery: [
      new Pillar(0.5, 5, -2.0, 4.8),
      new Pillar(0.5, 5, -6.0, 4.8),
      new Pillar(0.5, 5, 2.0, 4.8),
      new Pillar(0.5, 5, 6.0, 4.8),
      new Floor(22.4, 12.6)
    ]
  }
}
