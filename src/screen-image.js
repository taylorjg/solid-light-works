import * as THREE from 'three'
import Line2dInit from 'three-line-2d'
import Line2dBasicShaderInit from 'three-line-2d/shaders/basic'
import * as U from './utils'
import * as C from './constants'

const Line2d = Line2dInit(THREE)
const Line2dBasicShader = Line2dBasicShaderInit(THREE)

export class ScreenImage {

  constructor(orientation, meshCount, scene) {
    this.orientation = orientation
    this.meshCount = meshCount
    this.scene = scene
    this.meshes = U.range(meshCount).map(() => {
      const geometry = new Line2d()
      const material = new THREE.ShaderMaterial(
        Line2dBasicShader({
          side: THREE.DoubleSide,
          diffuse: 0xffffff,
          thickness: C.SCREEN_IMAGE_LINE_THICKNESS
        }))
      const mesh = new THREE.Mesh(geometry, material)
      if (orientation === C.ORIENTATION_VERTICAL) {
        mesh.rotateX(C.HALF_PI)
      }
      return mesh
    })
    this.meshes.forEach(mesh => scene.add(mesh))
  }

  update(pointsArray) {
    U.range(this.meshCount).map(meshIndex => {
      const points = pointsArray[meshIndex]
      const path = U.vectorsAsArrays(points)
      const mesh = this.meshes[meshIndex]
      mesh.geometry.update(path)
    })
  }

  destroy() {
    this.meshes.forEach(mesh => U.disposeMesh(this.scene, mesh))
  }
}
