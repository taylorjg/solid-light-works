import * as THREE from 'three'
import { TestForm } from '../forms/test'
import { Floor } from '../scenery'
import * as C from '../constants'

const makeWork1 = () => {
  const translation3D = new THREE.Matrix4().makeTranslation(0, 0, 4)
  const rotation3D = new THREE.Matrix4().makeRotationX(-C.HALF_PI)
  const transform3D = new THREE.Matrix4()
    .multiply(translation3D)
    .multiply(rotation3D)

  return {
    formConfigs: [
      {
        form: new TestForm(6, 4),
        config2D: {
          transform: new THREE.Matrix4()
        },
        config3D: {
          transform: transform3D,
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
    cameraPose: { position: new THREE.Vector3(0, 0, 6), target: new THREE.Vector3() }
  },
  config3D: {
    cameraPoses: [
      { position: new THREE.Vector3(15.75, 5.44, 6.00), target: new THREE.Vector3(0.22, 2.82, 2.18) }],
    scenery: [
      new Floor(12, 8)
    ]
  }
}
