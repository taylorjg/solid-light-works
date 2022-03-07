import * as THREE from 'three'
import Line2DInit from 'three-line-2d'
import Line2DBasicShaderInit from 'three-line-2d/shaders/basic'
import * as U from './utils'
import * as C from './constants'

const Line2D = Line2DInit(THREE)
const Line2DBasicShader = Line2DBasicShaderInit(THREE)

export class ScreenImage {

  constructor(scene, screenForm) {
    this._scene = scene
    this._screenForm = screenForm
    this._meshes = undefined
    this._visible = false
  }

  createMeshes(lineCount) {
    return U.range(lineCount).map(() => {
      const geometry = new Line2D()
      const material = new THREE.ShaderMaterial(
        Line2DBasicShader({
          side: THREE.DoubleSide,
          diffuse: 0xffffff,
          thickness: C.SCREEN_IMAGE_LINE_THICKNESS
        }))
      const mesh = new THREE.Mesh(geometry, material)
      mesh.applyMatrix4(this._screenForm.transform)
      mesh.visible = this._visible
      this._scene.add(mesh)
      return mesh
    })
  }

  update(lines) {
    if (!this._meshes) {
      const lineCount = lines.length
      this._meshes = this.createMeshes(lineCount)
    }
    this._meshes.forEach((mesh, index) => {
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

  set visible(value) {
    this._visible = value
    if (this._meshes) {
      this._meshes.forEach(mesh => mesh.visible = this._visible)
    }
  }
}
