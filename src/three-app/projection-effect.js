import * as THREE from 'three'
import { MembraneGeometry } from './membrane-geometry'
import { VertexNormalsHelper } from 'three/examples/jsm/helpers/VertexNormalsHelper.js'
import vertexShader from './shaders/vertex-shader.glsl'
import fragmentShader from './shaders/fragment-shader.glsl'
import * as U from './utils'

export class ProjectionEffect {

  constructor(parent, config3D, resources) {
    this._parent = parent
    this._config3D = config3D
    this._resources = resources
    this._meshes = undefined
    this._meshHelpers = undefined
    this._visibleHelpers = false
  }

  _createMesh() {
    const geometry = new MembraneGeometry()
    const material = new THREE.ShaderMaterial({
      uniforms: {
        hazeTexture: {
          value: this._resources.hazeTexture
        },
        projectorPosition: {
          value: this._config3D.projectorPosition
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
    mesh.applyMatrix4(this._config3D.transform)
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

  _tiltClippingPlane(clippingPlane) {
    const formPoint1 = new THREE.Vector3(2, 2, 0).applyMatrix4(this._config3D.transform)
    const formPoint2 = new THREE.Vector3(2, -2, 0).applyMatrix4(this._config3D.transform)
    const projectedFormPoint1 = clippingPlane.projectPoint(formPoint1, new THREE.Vector3())
    const projectedFormPoint2 = clippingPlane.projectPoint(formPoint2, new THREE.Vector3())
    const translation = new THREE.Matrix4().makeTranslation(...this._config3D.projectorPosition.toArray())
    const transform = translation.premultiply(this._config3D.transform)
    const transformedProjectorPosition = new THREE.Vector3().applyMatrix4(transform)
    const originalNormal = clippingPlane.normal.clone()
    clippingPlane.setFromCoplanarPoints(
      projectedFormPoint1,
      projectedFormPoint2,
      transformedProjectorPosition)
    const dotProduct = originalNormal.dot(clippingPlane.normal)
    if (dotProduct < 0) {
      clippingPlane.negate()
    }
  }

  _tiltClippingPlanes(clippingPlanes) {
    for (const clippingPlane of clippingPlanes) {
      this._tiltClippingPlane(clippingPlane)
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
      const numPoints = line.points.length
      const projectorPoints = Array(numPoints).fill(this._config3D.projectorPosition)
      const screenPoints = U.vec2sToVec3sHorizontal(line.points)
      mesh.geometry.dispose()
      mesh.geometry = new MembraneGeometry(projectorPoints, screenPoints)
      mesh.geometry.computeVertexNormals()
      mesh.material.uniforms.opacity.value = line.opacity

      if (line.clippingPlanes) {
        mesh.material.clippingPlanes = line.clippingPlanes.map(clippingPlane =>
          clippingPlane.clone().applyMatrix4(this._config3D.transform))
        mesh.material.clipping = true
        this._tiltClippingPlanes(mesh.material.clippingPlanes)
      } else {
        mesh.material.clippingPlanes = null
        mesh.material.clipping = false
      }
    })

    if (this._visibleHelpers) {
      if (!this._meshHelpers) {
        this._createMeshHelpers()
      }
      this._meshHelpers.forEach(meshHelper => meshHelper.update())
    } else {
      if (this._meshHelpers) {
        this._destroyMeshHelpers()
      }
    }
  }

  set showVertexNormals(value) {
    this._visibleHelpers = value
  }
}
