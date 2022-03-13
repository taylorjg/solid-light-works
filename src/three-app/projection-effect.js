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

  _createMeshes(lineCount) {
    this._meshes = U.range(lineCount).map(() => {
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
    })
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
    if (!this._meshes) {
      this._createMeshes(lines.length)
    }

    this._meshes.forEach((mesh, index) => {
      const line = lines[index]
      if (line) {
        const numPoints = line.points.length
        const projectorPoints = U.repeat(numPoints, this._projectedForm.projectorPosition)
        const screenPoints = U.vec2sToVec3sHorizontal(line.points)
        const tempMembraneGeometry = new MembraneGeometry(projectorPoints, screenPoints)
        tempMembraneGeometry.computeVertexNormals()
        mesh.geometry.copy(tempMembraneGeometry)
        tempMembraneGeometry.dispose()
        mesh.material.uniforms.opacity.value = line.opacity
        mesh.visible = this._visible
      }
    })

    if (this._visible && this._visibleHelpers) {
      this._createMeshHelpers()
    } else {
      this._destroyMeshHelpers()
    }

    if (this._meshHelpers) {
      this._meshHelpers.forEach(meshHelper => meshHelper.update())
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
