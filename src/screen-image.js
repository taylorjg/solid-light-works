import * as THREE from 'three'
import Line2dInit from 'three-line-2d'
import Line2dBasicShaderInit from 'three-line-2d/shaders/basic'
import * as U from './utils'
import * as C from './constants'

const Line2d = Line2dInit(THREE)
const Line2dBasicShader = Line2dBasicShaderInit(THREE)

export class ScreenImage {

  constructor(lineCount, scene, applyTransforms) {
    this.scene = scene
    this.meshes = U.range(lineCount).map(() => {
      const geometry = new Line2d()
      const material = new THREE.ShaderMaterial(
        Line2dBasicShader({
          side: THREE.DoubleSide,
          diffuse: 0xffffff,
          thickness: C.SCREEN_IMAGE_LINE_THICKNESS
        }))
      const mesh = new THREE.Mesh(geometry, material)
      applyTransforms && applyTransforms(mesh)
      return mesh
    })
    this.meshes.forEach(mesh => scene.add(mesh))
  }

  update(lines) {
    this.meshes.forEach((mesh, index) => {
      const line = lines[index]
      if (line) {
        const path = U.vectorsAsArrays(line.points)
        mesh.geometry.update(path)
      }
    })
  }

  destroy() {
    this.meshes.forEach(mesh => U.disposeMesh(this.scene, mesh))
  }
}
