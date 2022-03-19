import * as THREE from 'three'
import { MembraneGeometry } from './membrane-geometry'
import { VertexNormalsHelper } from 'three/examples/jsm/helpers/VertexNormalsHelper.js'
import vertexShader from './shaders/vertex-shader.glsl'
import fragmentShader from './shaders/fragment-shader.glsl'
import * as U from './utils'

export class ProjectionEffect {

  constructor(scene, projectedForm, resources) {
    this._scene = scene
    this._projectedForm = projectedForm
    this._resources = resources
    this._meshes = undefined
    this._meshHelpers = undefined
    this._visible = false
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
          value: this._projectedForm.projectorPosition
        },
        opacity: {
          value: 1
        }
      },
      vertexShader,
      fragmentShader,
      side: THREE.DoubleSide,
      // blending: THREE.AdditiveBlending,
      transparent: true,
      depthTest: false
    })
    const mesh = new THREE.Mesh(geometry, material)
    mesh.applyMatrix4(this._projectedForm.transform)
    mesh.visible = this._visible
    this._scene.add(mesh)
    return mesh
  }

  _createMeshes(lineCount) {
    this._destroyMeshes()
    this._destroyMeshHelpers()
    this._meshes = U.range(lineCount).map(() => this._createMesh())
    if (this._visible && this._visibleHelpers) {
      this._createMeshHelpers()
    }
  }

  _destroyMeshes() {
    if (this._meshes) {
      for (const mesh of this._meshes) {
        U.disposeMesh(this._scene, mesh)
      }
      this._meshes = undefined
    }
  }

  _createMeshHelpers() {
    if (this._meshes && !this._meshHelpers) {
      this._meshHelpers = this._meshes.map(mesh => new VertexNormalsHelper(mesh, 0.2, 0x0000ff))
      this._meshHelpers.forEach(meshHelper => this._scene.add(meshHelper))
    }
  }

  _destroyMeshHelpers() {
    if (this._meshHelpers) {
      this._meshHelpers.forEach(meshHelper => U.disposeMesh(this._scene, meshHelper))
      this._meshHelpers = undefined
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
      const projectorPoints = Array(numPoints).fill(this._projectedForm.projectorPosition)
      const screenPoints = U.vec2sToVec3sHorizontal(line.points)
      mesh.geometry.dispose()
      mesh.geometry = new MembraneGeometry(projectorPoints, screenPoints)
      mesh.geometry.computeVertexNormals()
      mesh.material.uniforms.opacity.value = line.opacity
      mesh.visible = this._visible
    })

    if (this._visible && this._visibleHelpers) {
      this._createMeshHelpers()
    } else {
      this._destroyMeshHelpers()
    }

    if (this._meshHelpers) {
      this._meshHelpers.forEach(meshHelper => {
        meshHelper.update()
        meshHelper.visible = this._visible && this._visibleHelpers
      })
    }
  }

  set visible(value) {
    this._visible = value
    if (this._meshes) {
      this._meshes.forEach(mesh => mesh.visible = value)
    }
  }

  set showVertexNormals(value) {
    this._visibleHelpers = value
    if (this._meshHelpers) {
      this._meshHelpers.forEach(meshHelper => meshHelper.visible = value)
    }
  }
}
