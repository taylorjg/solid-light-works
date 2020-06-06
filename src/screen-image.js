import * as THREE from 'three'
import Line2DInit from 'three-line-2d'
import Line2DBasicShaderInit from 'three-line-2d/shaders/basic'
import * as U from './utils'
import * as C from './constants'

const Line2D = Line2DInit(THREE)
const Line2DBasicShader = Line2DBasicShaderInit(THREE)

export class ScreenImage {

  constructor(lineCount, scene, applyTransforms) {
    this.scene = scene
    this.meshes = U.range(lineCount).map(() => {
      const geometry = new Line2D()
      const material = new THREE.ShaderMaterial(
        Line2DBasicShader({
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

        // I can't get opacity to work unless transparent is set to true
        // which looks awful. So I am doing this instead.
        const grey = line.opacity
        mesh.material.uniforms.diffuse.value = new THREE.Color(grey, grey, grey)
      }
    })
  }

  destroy() {
    this.meshes.forEach(mesh => U.disposeMesh(this.scene, mesh))
  }
}
