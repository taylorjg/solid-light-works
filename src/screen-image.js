import * as THREE from 'three'
import Line2dInit from 'three-line-2d'
import Line2dBasicShaderInit from 'three-line-2d/shaders/basic'
import * as U from './utils'
import * as C from './constants'

const Line2d = Line2dInit(THREE)
const Line2dBasicShader = Line2dBasicShaderInit(THREE)

export class ScreenImage {

  constructor(scene) {
    this.line2dGeometry = Line2d()
    const line2dMaterial = new THREE.ShaderMaterial(
      Line2dBasicShader({
        side: THREE.DoubleSide,
        diffuse: 0xffffff,
        thickness: C.SCREEN_IMAGE_LINE_THICKNESS
      }))
    this.line2dMesh = new THREE.Mesh(this.line2dGeometry, line2dMaterial)
    scene.add(this.line2dMesh)
  }

  update(points) {
    const path = U.vectorsAsArrays(points)
    this.line2dGeometry.update(path)
  }
}
