import * as THREE from 'three'
import { LineGeometry } from './line-geometry'
import { IntersectionPoints } from './intersection-points'
import * as U from './utils'

// mode:
// 0: 2D
// 1: 3D (one side)
// 2: 3D (two sides)

export class ScreenImage {

  constructor(parent, config, formBoundary) {
    this._config = config
    this._formBoundary = formBoundary
    this._group = this._createGroup(parent)
    this._meshes = undefined
    this._meshes2 = undefined
    this._intersectionPoints = new IntersectionPoints(this._group)
    this._formBoundaryClippingPlanes = undefined
    this._formBoundaryLine = undefined
  }

  _createGroup(parent) {
    const group = new THREE.Group()
    group.applyMatrix4(this._config.transform)
    parent.add(group)
    return group
  }

  _createMesh(line) {
    const geometry = new LineGeometry({
      lineThickness: line.lineThickness,
      extendEnds: line.clipToFormBoundary,
      maxNumPoints: line.maxNumPoints
    })
    const material = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 1.0
    })
    const mesh = new THREE.Mesh(geometry, material)

    if (this._config.mode === 1 || this._config.mode === 2) {
      // To prevent z-fighting
      mesh.translateZ(0.01)
    }

    this._group.add(mesh)
    return mesh
  }

  _createMeshes(lines) {
    this._destroyMeshes()
    this._meshes = lines.map(line => this._createMesh(line))
    if (this._config.mode === 2) {
      this._meshes2 = this._meshes.map(mesh => {
        const { geometry, material } = mesh
        const mesh2 = new THREE.Mesh(geometry, material)
        mesh2.translateZ(-0.01)
        this._group.add(mesh2)
        return mesh2
      })
    }
  }

  _destroyMeshes() {
    if (this._meshes) {
      for (const mesh of this._meshes) {
        U.disposeMesh(mesh)
      }
      this._meshes = undefined
    }

    if (this._meshes2) {
      for (const mesh of this._meshes2) {
        U.disposeMesh(mesh)
      }
      this._meshes2 = undefined
    }
  }

  update(footprintData) {
    const { lines, intersectionPoints } = footprintData
    const lineCount = lines.length
    const meshCount = this._meshes?.length ?? 0

    if (meshCount !== lineCount) {
      this._createMeshes(lines)
    }

    this._meshes.forEach((mesh, index) => {
      const line = lines[index]

      const path = U.vectorsAsArrays(line.points)
      if (line.closed) {
        const [x1, y1] = path[0]
        const [x2, y2] = U.last(path)
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

      mesh.material.opacity = line.opacity
    })

    if (this._intersectionPoints.visible && intersectionPoints) {
      this._intersectionPoints.update(intersectionPoints)
    }
  }

  set intersectionPointsVisible(value) {
    this._intersectionPoints.visible = value
  }

  set formBoundaryVisible(value) {
    if (value) {
      if (!this._formBoundaryLine) {
        const { width, height } = this._formBoundary
        const path = [
          [-width / 2, -height / 2],
          [-width / 2, height / 2],
          [width / 2, height / 2],
          [width / 2, -height / 2]
        ]
        const geometry = new LineGeometry({ lineThickness: 0.01 })
        geometry.update(path, true)
        const material = new THREE.MeshBasicMaterial({ color: 0xffffff, side: THREE.DoubleSide })
        this._formBoundaryLine = new THREE.Mesh(geometry, material)
        this._group.add(this._formBoundaryLine)
      }
    } else {
      if (this._formBoundaryLine) {
        U.disposeMesh(this._formBoundaryLine)
        this._formBoundaryLine = undefined
      }
    }
  }

  _ensureFormBoundaryClippingPlanes() {
    if (!this._formBoundaryClippingPlanes) {
      const makeClippingPlane = (x, y, constant) => {
        const normal = new THREE.Vector3(x, y, 0)
        return new THREE.Plane(normal, constant).applyMatrix4(this._config.transform)
      }
      const { width, height } = this._formBoundary
      const topClippingPlane = makeClippingPlane(0, -1, height / 2)
      const bottomClippingPlane = makeClippingPlane(0, 1, height / 2)
      const leftClippingPlane = makeClippingPlane(1, 0, width / 2)
      const rightClippingPlane = makeClippingPlane(-1, 0, width / 2)
      this._formBoundaryClippingPlanes = [
        topClippingPlane,
        bottomClippingPlane,
        leftClippingPlane,
        rightClippingPlane
      ]
    }
  }
}
