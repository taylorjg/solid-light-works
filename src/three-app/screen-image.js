import * as THREE from 'three'
import { LineGeometry as Line2D } from '../three-line-2d'
import { basicShader as Line2DBasicShader } from '../three-line-2d'
import { IntersectionPoints } from './intersection-points'
import * as C from './constants'
import * as U from './utils'

export class ScreenImage {

  constructor(scene, screenForm) {
    this._group = this._createGroup(scene, screenForm)
    this._meshes = this._createMeshes()
    this._intersectionPoints = new IntersectionPoints(this._group)
  }

  _createGroup(scene, screenForm) {
    const group = new THREE.Group()
    group.applyMatrix4(screenForm.transform)
    group.visible = false
    scene.add(group)
    return group
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
    this._group.add(mesh)
    return mesh
  }

  _createMeshes(lineCount) {
    this._destroyMeshes()
    this._meshes = U.range(lineCount).map(() => this._createMesh())
  }

  _destroyMeshes() {
    if (this._meshes) {
      for (const mesh of this._meshes) {
        U.disposeMesh(mesh)
      }
      this._meshes = undefined
    }
  }

  update(lines) {
    const lineCount = lines.length
    const meshCount = this._meshes?.length ?? 0

    if (meshCount !== lineCount) {
      this._createMeshes(lineCount)
    } else {
      const meshes = this._meshes ?? []
      meshes.forEach((mesh, index) => {
        const pointCount = lines[index].points.length
        const positionAttribute = mesh.geometry.getAttribute("position")

        // For each point in the path, the line geometry adds
        // 2 lots of X, Y and Z values to the position attribute,
        const minRequiredArrayLength = pointCount * 6

        const arrayLength = positionAttribute.array.length
        if (arrayLength < minRequiredArrayLength) {
          U.disposeMesh(mesh)
          this._meshes[index] = this._createMesh()
        }
      })
    }

    this._meshes.forEach((mesh, index) => {
      const line = lines[index]
      const path = U.vectorsAsArrays(line.points)
      if (line.closed) {
        const [x1, y1] = path[0]
        const [x2, y2] = path[path.length - 1]
        const firstSameAsLast = U.isClose(x1, x2) && U.isClose(y1, y2)
        const adjustedPath = firstSameAsLast ? path.slice(0, -1) : path
        mesh.geometry.update(adjustedPath, true)
      } else {
        mesh.geometry.update(path)
      }

      // I can't get opacity to work unless transparent is set to true
      // which looks awful. So I am doing this instead.
      const r = line.opacity
      const g = line.opacity
      const b = line.opacity
      mesh.material.uniforms.diffuse.value = new THREE.Color(r, g, b)
    })

    if (this._intersectionPoints.visible && lines.intersectionPoints) {
      this._intersectionPoints.update(lines.intersectionPoints)
    }
  }

  set visible(value) {
    this._group.visible = value
  }

  set intersectionPointsVisible(value) {
    this._intersectionPoints.visible = value
  }
}
