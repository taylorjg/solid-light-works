import * as THREE from 'three'
import { MembraneBufferGeometry } from './membrane-geometry'
import { VertexNormalsHelper } from 'three/examples/jsm/helpers/VertexNormalsHelper.js'
import vertexShader from './shaders/vertex-shader.glsl'
import fragmentShader from './shaders/fragment-shader.glsl'
import * as U from './utils'

export class ProjectionEffect {

  constructor(projectedForm, scene, resources) {
    this.projectedForm = projectedForm
    this.scene = scene
    this.resources = resources
    this.meshes = undefined
    this.meshHelpers = undefined
    this._visible = false
  }

  createMeshes(lineCount) {
    return U.range(lineCount).map(() => {
      const geometry = new MembraneBufferGeometry()
      const material = new THREE.ShaderMaterial({
        uniforms: {
          hazeTexture: {
            value: this.resources.hazeTexture
          },
          projectorPosition: {
            value: this.projectedForm.projectorPosition
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
      mesh.applyMatrix4(this.projectedForm.transform)
      mesh.visible = this._visible
      this.scene.add(mesh)
      return mesh
    })
  }

  update(lines) {
    if (!this.meshes) {
      const lineCount = lines.length
      this.meshes = this.createMeshes(lineCount)
    }
    this.meshes.forEach((mesh, index) => {
      const line = lines[index]
      if (line) {
        const numPoints = line.points.length
        const projectorPoints = U.repeat(numPoints, this.projectedForm.projectorPosition)
        const screenPoints = U.vec2sToVec3sHorizontal(line.points)
        const tempMembraneGeometry = new MembraneBufferGeometry(projectorPoints, screenPoints)
        tempMembraneGeometry.computeFaceNormals()
        tempMembraneGeometry.computeVertexNormals()
        mesh.geometry.copy(tempMembraneGeometry)
        tempMembraneGeometry.dispose()
        mesh.material.uniforms.opacity.value = line.opacity
        mesh.visible = this._visible
      }
    })
    if (this.meshHelpers) {
      this.meshHelpers.forEach(meshHelper => meshHelper.update())
    }
  }

  set visible(value) {
    this._visible = value
    if (this.meshes) {
      this.meshes.forEach(mesh => mesh.visible = value)
    }
  }

  set showVertexNormals(value) {
    if (value) {
      if (!this.meshHelpers && this.meshes) {
        this.meshHelpers = this.meshes.map(mesh => new VertexNormalsHelper(mesh, 0.2, 0x0000ff))
        this.meshHelpers.forEach(meshHelper => this.scene.add(meshHelper))
      }
    } else {
      if (this.meshHelpers) {
        this.meshHelpers.forEach(meshHelper => this.scene.remove(meshHelper))
        this.meshHelpers = undefined
      }
    }
  }
}
