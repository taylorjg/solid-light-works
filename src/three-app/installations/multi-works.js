import * as THREE from 'three'
import { CouplingForm } from '../forms/coupling'
import { BreathIIIForm } from '../forms/breath-iii'
import { Floor } from '../scenery'
import * as C from '../constants'

const makeWork1 = () => {
  return {
    formConfigs: [
      {
        form: new CouplingForm(2, 1),
        config2D: {
          transform: new THREE.Matrix4()
            .premultiply(new THREE.Matrix4().makeRotationZ(C.HALF_PI))
            .premultiply(new THREE.Matrix4().makeTranslation(-4, 1, 0))
        },
        config3D: {
          transform: new THREE.Matrix4()
            .premultiply(new THREE.Matrix4().makeRotationX(-C.HALF_PI))
            .premultiply(new THREE.Matrix4().makeRotationY(C.HALF_PI))
            .premultiply(new THREE.Matrix4().makeTranslation(-4, 0, 6)),
          projectorPosition: new THREE.Vector3(0, 0, 10)
        }
      }
    ]
  }
}

const makeWork2 = () => {
  return {
    formConfigs: [
      {
        form: new BreathIIIForm(6, 4),
        config2D: {
          transform: new THREE.Matrix4()
            .premultiply(new THREE.Matrix4().makeRotationZ(-C.HALF_PI))
            .premultiply(new THREE.Matrix4().makeTranslation(4, -1, 0))
        },
        config3D: {
          transform: new THREE.Matrix4()
            .premultiply(new THREE.Matrix4().makeRotationX(-C.HALF_PI))
            .premultiply(new THREE.Matrix4().makeRotationY(-C.HALF_PI))
            .premultiply(new THREE.Matrix4().makeTranslation(4, 0, 8)),
          projectorPosition: new THREE.Vector3(0, 0, 10)
        },
      }
    ]
  }
}

export const config = {
  works: [
    makeWork1(),
    makeWork2()
  ],
  config2D: {
    cameraPose: { position: new THREE.Vector3(0, 0, 12), target: new THREE.Vector3() }
  },
  config3D: {
    cameraPoses: [
      { position: new THREE.Vector3(-18.33, 2.42, 11.21), target: new THREE.Vector3(0.43, 4.16, 4.94) }
    ],
    scenery: [
      new Floor(20, 14)
    ]
  }
}
