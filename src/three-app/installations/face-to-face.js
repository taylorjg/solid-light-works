import * as THREE from 'three'
import { BetweenYouAndIForm } from '../forms/between-you-and-i'
import { FloatingScreen, Floor, Pillar } from '../scenery'
import * as C from '../constants'

const FRAME_THICKNESS = 0.1

const makeWork1 = () => {

  const transformForm1 = new THREE.Matrix4()
    .premultiply(new THREE.Matrix4().makeRotationY(C.HALF_PI))
    .premultiply(new THREE.Matrix4().makeTranslation(-4.8, 1.3 + FRAME_THICKNESS, 3.25))

  const transformForm2 = new THREE.Matrix4()
    .premultiply(new THREE.Matrix4().makeRotationY(-C.HALF_PI))
    .premultiply(new THREE.Matrix4().makeTranslation(0.8, 1.3 + FRAME_THICKNESS, 6.95))

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
        form: new BetweenYouAndIForm(4.5, 2.6, true),
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
    mode: 2,
    cameraPoses: [
      { position: new THREE.Vector3(-2.82, 2.26, 13.96), target: new THREE.Vector3(-2.25, 0.78, 5.36) },
      { position: new THREE.Vector3(-9.72, 2.13, 8.70), target: new THREE.Vector3(-2.91, 1.21, 5.71) }
    ],
    scenery: [
      new Floor(22.4, 12.6),
      new FloatingScreen(4.5, 2.6, -4.8, 3.25),
      new FloatingScreen(4.5, 2.6, 0.8, 6.95),
      new Pillar(0.5, 5, -2.0, 4.8),
      new Pillar(0.5, 5, -6.0, 4.8),
      new Pillar(0.5, 5, 2.0, 4.8),
      new Pillar(0.5, 5, 6.0, 4.8)
    ]
  }
}
