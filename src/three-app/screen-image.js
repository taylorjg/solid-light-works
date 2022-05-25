import * as THREE from 'three'
import { LineGeometry } from './line-geometry'
import { IntersectionPoints } from './intersection-points'
import * as C from './constants'
import * as U from './utils'

export class ScreenImage {

  constructor(parent, config, formBoundary) {
    this._config = config
    this._formBoundary = formBoundary
    this._group = this._createGroup(parent)
    this._meshes = undefined
    this._intersectionPoints = new IntersectionPoints(this._group)
    this._formBoundaryClippingPlanes = undefined
  }

  _createGroup(parent) {
    const group = new THREE.Group()
    group.applyMatrix4(this._config.transform)
    parent.add(group)
    return group
  }

  _createMesh(line) {
    const geometry = new LineGeometry()
    const material = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 1.0
    })
    const mesh = new THREE.Mesh(geometry, material)
    mesh.renderOrder = -1 // to fix z-fighting with projection effect
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

      const clippingPlanes = []

      if (line.clipToFormBoundary) {
        this._ensureFormBoundaryClippingPlanes()
        clippingPlanes.push(...this._formBoundaryClippingPlanes)
      }

      if (line.clippingPlanes) {
        line.clippingPlanes.forEach(clippingPlane =>
          clippingPlanes.push(clippingPlane.clone().applyMatrix4(this._config.transform))
        )
      }

      if (clippingPlanes.length) {
        mesh.material.clippingPlanes = clippingPlanes
        mesh.material.clipping = true
      } else {
        mesh.material.clippingPlanes = null
        mesh.material.clipping = false
      }

      // If we set 'mesh.material.transparent` to true, we can do the following:
      mesh.material.opacity = line.opacity
      // However, in 3D mode, this results in a horrid flickering effect.
      // Hence, doing this as a workaround:
      // const r = line.opacity
      // const g = line.opacity
      // const b = line.opacity
      // mesh.material.color = new THREE.Color(r, g, b)
    })

    if (this._intersectionPoints.visible && lines.intersectionPoints) {
      this._intersectionPoints.update(lines.intersectionPoints)
    }
  }

  set intersectionPointsVisible(value) {
    this._intersectionPoints.visible = value
  }

  _ensureFormBoundaryClippingPlanes() {
    if (!this._formBoundaryClippingPlanes) {
      const makeClippingPlane = (x, y, z, constant) => {
        const normal = new THREE.Vector3(x, y, z)
        const adjustedConstant = constant + C.LINE_THICKNESS / 2
        return new THREE.Plane(normal, adjustedConstant).applyMatrix4(this._config.transform)
      }
      const { width, height } = this._formBoundary
      const topClippingPlane = makeClippingPlane(0, -1, 0, height / 2)
      const bottomClippingPlane = makeClippingPlane(0, 1, 0, height / 2)
      const leftClippingPlane = makeClippingPlane(1, 0, 0, width / 2)
      const rightClippingPlane = makeClippingPlane(-1, 0, 0, width / 2)
      this._formBoundaryClippingPlanes = [
        topClippingPlane,
        bottomClippingPlane,
        leftClippingPlane,
        rightClippingPlane
      ]
    }
  }
}
