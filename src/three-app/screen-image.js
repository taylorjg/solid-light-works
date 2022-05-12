import * as THREE from 'three'
import { LineGeometry as Line2D } from '../three-line-2d'
import { basicShader as Line2DBasicShader } from '../three-line-2d'
import { IntersectionPoints } from './intersection-points'
import * as C from './constants'
import * as U from './utils'

export class ScreenImage {

  constructor(parent, config2D) {
    this._config2D = config2D
    this._group = this._createGroup(parent, config2D)
    this._meshes = undefined
    this._intersectionPoints = new IntersectionPoints(this._group)
  }

  _createGroup(parent, config2D) {
    const group = new THREE.Group()
    group.applyMatrix4(config2D.transform)
    parent.add(group)
    return group
  }

  _createMesh(line) {
    const geometry = new Line2D()
    const material = new THREE.ShaderMaterial(
      Line2DBasicShader({
        side: THREE.DoubleSide,
        diffuse: 0xffffff,
        thickness: line.lineThickness ?? C.SCREEN_IMAGE_LINE_THICKNESS
      }))
    const mesh = new THREE.Mesh(geometry, material)
    this._group.add(mesh)
    return mesh
  }

  _createMeshes(lines) {
    this._destroyMeshes()
    this._meshes = lines.map(line => this._createMesh(line))
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
      this._createMeshes(lines)
    } else {
      const meshes = this._meshes ?? []
      meshes.forEach((mesh, index) => {
        const line = lines[index]
        const pointCount = line.points.length
        const positionAttribute = mesh.geometry.getAttribute("position")

        // For each point in the path, the line geometry adds
        // 2 lots of X, Y and Z values to the position attribute,
        const minRequiredArrayLength = pointCount * 6

        const arrayLength = positionAttribute.array.length
        if (arrayLength < minRequiredArrayLength) {
          U.disposeMesh(mesh)
          this._meshes[index] = this._createMesh(line)
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

      if (line.clippingPlanes) {
        mesh.material.clippingPlanes = line.clippingPlanes.map(clippingPlane =>
          clippingPlane.clone().applyMatrix4(this._config2D.transform))
        mesh.material.clipping = true
      } else {
        mesh.material.clippingPlanes = null
        mesh.material.clipping = false
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

  set intersectionPointsVisible(value) {
    this._intersectionPoints.visible = value
  }
}
