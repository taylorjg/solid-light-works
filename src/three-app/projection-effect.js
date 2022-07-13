import * as THREE from 'three'
import { makeLinePointPairs } from './line-point-pairs'
import { MembraneGeometry } from './membrane-geometry'
import { VertexNormalsHelper } from 'three/examples/jsm/helpers/VertexNormalsHelper.js'
import vertexShader from './shaders/vertex-shader.glsl'
import fragmentShader from './shaders/fragment-shader.glsl'
import * as C from './constants'
import * as U from './utils'

export class ProjectionEffect {

  constructor(parent, config, formBoundary, resources) {
    this._parent = parent
    this._config = config
    this._formBoundary = formBoundary
    this._resources = resources
    this._meshes = undefined
    this._meshHelpers = undefined
    this._visibleHelpers = false
    this._formBoundaryClippingPlanes = undefined
  }

  _createMesh() {
    const geometry = new MembraneGeometry()
    const material = new THREE.ShaderMaterial({
      uniforms: {
        hazeTexture: {
          value: this._resources.hazeTexture
        },
        projectorPosition: {
          value: this._config.projectorPosition
        },
        opacity: {
          value: 1
        }
      },
      vertexShader,
      fragmentShader,
      side: THREE.DoubleSide,
      blending: THREE.AdditiveBlending,
      transparent: true,
      depthTest: false
    })
    const mesh = new THREE.Mesh(geometry, material)
    mesh.applyMatrix4(this._config.transform)
    this._parent.add(mesh)
    return mesh
  }

  _createMeshes(lineCount) {
    this._destroyMeshHelpers()
    this._destroyMeshes()
    this._meshes = U.range(lineCount).map(() => this._createMesh())
  }

  _destroyMeshes() {
    if (this._meshes) {
      this._meshes.forEach(U.disposeMesh)
      this._meshes = undefined
    }
  }

  _createMeshHelpers() {
    if (this._meshes && !this._meshHelpers) {
      this._meshHelpers = this._meshes.map(mesh => new VertexNormalsHelper(mesh, 0.2, 0x0000ff))
      this._meshHelpers.forEach(meshHelper => this._parent.add(meshHelper))
    }
  }

  _destroyMeshHelpers() {
    if (this._meshHelpers) {
      this._meshHelpers.forEach(U.disposeMesh)
      this._meshHelpers = undefined
    }
  }

  _tiltClippingPlane(newClippingPlane, oldClippingPlane) {
    const zaxis = new THREE.Vector3(0, 0, 1)
    const oldClippingPlaneNormal = oldClippingPlane.normal
    const oldClippingPlaneTangent = zaxis.cross(oldClippingPlaneNormal).normalize()
    const pointInOldClippingPlane1 = oldClippingPlane.coplanarPoint(new THREE.Vector3())
    const pointInOldClippingPlane2 = pointInOldClippingPlane1.clone().add(oldClippingPlaneTangent)
    const transformedPointInOldClippingPlane1 = pointInOldClippingPlane1.applyMatrix4(this._config.transform)
    const transformedPointInOldClippingPlane2 = pointInOldClippingPlane2.applyMatrix4(this._config.transform)
    const transformedProjectorPosition = this._config.projectorPosition.clone().applyMatrix4(this._config.transform)
    const newClippingPlaneSavedNormal = newClippingPlane.normal.clone()
    newClippingPlane.setFromCoplanarPoints(
      transformedPointInOldClippingPlane1,
      transformedPointInOldClippingPlane2,
      transformedProjectorPosition)
    const dotProduct = newClippingPlaneSavedNormal.dot(newClippingPlane.normal)
    if (dotProduct < 0) {
      newClippingPlane.negate()
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

      // const numPoints = line.points.length
      // const projectorPoints = Array(numPoints).fill(this._config.projectorPosition)
      // const screenPoints = U.vec2sToVec3sHorizontal(line.points)

      const path = line.points.map(point => point.toArray())
      const linePointPairs = makeLinePointPairs(path, line.closed, line.lineThickness)
      const upperPoints = linePointPairs.map(linePointPair => linePointPair.upperPoint)
      const lowerPoints = linePointPairs.map(linePointPair => linePointPair.lowerPoint)
      const points = [...upperPoints, ...lowerPoints.reverse()]
      const screenPoints = points.map(point => new THREE.Vector3(point.x, point.y, 0))
      // const projectorPoints = Array(screenPoints.length).fill(this._config.projectorPosition)
      const projectorPoints = screenPoints.map(pt => pt.clone().divideScalar(40).add(this._config.projectorPosition))

      mesh.geometry.dispose()
      mesh.geometry = new MembraneGeometry(projectorPoints, screenPoints)
      mesh.geometry.computeVertexNormals()
      mesh.material.uniforms.opacity.value = line.opacity

      const clippingPlanes = []

      if (line.clipToFormBoundary) {
        this._ensureFormBoundaryClippingPlanes()
        clippingPlanes.push(...this._formBoundaryClippingPlanes)
      }

      if (line.clippingPlanes) {
        line.clippingPlanes.forEach(oldClippingPlane => {
          const newClippingPlane = oldClippingPlane.clone().applyMatrix4(this._config.transform)
          this._tiltClippingPlane(newClippingPlane, oldClippingPlane)
          clippingPlanes.push(newClippingPlane)
        })
      }

      if (clippingPlanes.length) {
        mesh.material.clippingPlanes = clippingPlanes
        mesh.material.clipping = true
      } else {
        mesh.material.clippingPlanes = null
        mesh.material.clipping = false
      }
    })

    if (this._visibleHelpers) {
      if (!this._meshHelpers) {
        this._createMeshHelpers()
      }
      this._meshHelpers.forEach((meshHelper, index) => {
        const mesh = this._meshes[index]
        meshHelper.material.clippingPlanes = mesh.material.clippingPlanes
        meshHelper.material.clipping = mesh.material.clipping
        meshHelper.update()
      })
    } else {
      if (this._meshHelpers) {
        this._destroyMeshHelpers()
      }
    }
  }

  set showVertexNormals(value) {
    this._visibleHelpers = value
  }

  _ensureFormBoundaryClippingPlanes() {
    if (!this._formBoundaryClippingPlanes) {
      const makeClippingPlane = (x, y, z, constant) => {
        const normal = new THREE.Vector3(x, y, z)
        const adjustedConstant = constant + C.LINE_THICKNESS / 2
        const oldClippingPlane = new THREE.Plane(normal, adjustedConstant)
        const newClippingPlane = oldClippingPlane.clone().applyMatrix4(this._config.transform)
        this._tiltClippingPlane(newClippingPlane, oldClippingPlane)
        return newClippingPlane
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
