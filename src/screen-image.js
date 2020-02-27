import * as THREE from 'three'
import Line2dInit from 'three-line-2d'
import Line2dBasicShaderInit from 'three-line-2d/shaders/basic'
import * as U from './utils'
import * as C from './constants'

const Line2d = Line2dInit(THREE)
const Line2dBasicShader = Line2dBasicShaderInit(THREE)

export class ScreenImage {

  constructor(scene, meshCount) {
    this.meshCount = meshCount
    this.meshes = U.range(meshCount).map(() => {
      const lineGeometry = Line2d()
      const lineMaterial = new THREE.ShaderMaterial(
        Line2dBasicShader({
          side: THREE.DoubleSide,
          diffuse: 0xffffff,
          thickness: C.SCREEN_IMAGE_LINE_THICKNESS
        }))
      const lineMesh = new THREE.Mesh(lineGeometry, lineMaterial)
      scene.add(lineMesh)
      return lineMesh
    })
  }

  update(pointsArray) {
    U.range(this.meshCount).map(meshIndex => {
      const path = U.vectorsAsArrays(pointsArray[meshIndex])
      this.meshes[meshIndex].geometry.update(path)
    })
  }
}
