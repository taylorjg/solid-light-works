import * as THREE from 'three'
import { LineGeometry as Line2D } from '../three-line-2d'
import { basicShader as Line2DBasicShader } from '../three-line-2d'
import * as U from './utils'
import * as C from './constants'

export class ScreenImage {

  constructor(scene, screenForm) {
    this._scene = scene
    this._screenForm = screenForm
    this._meshes = undefined
    this._visible = false
  }

  _createMesh() {
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
  }

  _createMeshes(lineCount) {
    this._destroyMeshes()
    this._meshes = U.range(lineCount).map(() => this._createMesh())
  }

  _destroyMeshes() {
    if (this._meshes) {
      for (const mesh of this._meshes) {
        U.disposeMesh(this._scene, mesh)
      }
      this._meshes = undefined
    }
  }

  update(lines) {
    const lineCount = lines.length
    const meshCount = this._meshes?.length ?? 0

    if (meshCount !== lineCount) {
      this._createMeshes(lineCount)
    }

    this._meshes.forEach((mesh, index) => {
      const line = lines[index]
      const path = U.vectorsAsArrays(line.points)
      mesh.geometry.update(path)
      // const p1 = line.points[0]
      // const p2 = line.points.slice(-1)[0]
      // mesh.geometry.update(path, p1 === p2)

      // I can't get opacity to work unless transparent is set to true
      // which looks awful. So I am doing this instead.
      const r = line.opacity
      const g = line.opacity
      const b = line.opacity
      mesh.material.uniforms.diffuse.value = new THREE.Color(r, g, b)
    })
  }

  set visible(value) {
    this._visible = value
    if (this._meshes) {
      this._meshes.forEach(mesh => mesh.visible = this._visible)
    }
  }
}
