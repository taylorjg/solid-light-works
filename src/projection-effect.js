import * as THREE from 'three'
import { MembraneBufferGeometry } from './membrane-geometry'
import { VertexNormalsHelper } from 'three/examples/jsm/helpers/VertexNormalsHelper.js'
import vertexShader from './shaders/vertex-shader.glsl'
import fragmentShader from './shaders/fragment-shader.glsl'
import * as U from './utils'

export class ProjectionEffect {

  constructor(lineCount, scene, applyTransforms, projectorPosition, hazeTexture) {
    this.projectorPosition = projectorPosition
    this.scene = scene
    this.meshes = U.range(lineCount).map(() => {
      const geometry = new MembraneBufferGeometry()
      const material = new THREE.ShaderMaterial({
        uniforms: {
          hazeTexture: {
            value: hazeTexture
          },
          projectorPosition: {
            value: projectorPosition
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
      applyTransforms && applyTransforms(mesh)
      return mesh
    })
    this.meshes.forEach(mesh => scene.add(mesh))
    this.meshHelpers = null
  }

  update(lines) {
    this.meshes.forEach((mesh, index) => {
      const line = lines[index]
      if (line) {
        const numPoints = line.points.length
        const projectorPoints = U.repeat(numPoints, this.projectorPosition)
        const screenPoints = U.vec2sToVec3sHorizontal(line.points)
        const tempMembraneGeometry = new MembraneBufferGeometry(projectorPoints, screenPoints)
        tempMembraneGeometry.computeFaceNormals()
        tempMembraneGeometry.computeVertexNormals()
        mesh.geometry.copy(tempMembraneGeometry)
        tempMembraneGeometry.dispose()
        mesh.material.uniforms.opacity.value = line.opacity
      }
    })
    if (this.meshHelpers) {
      this.meshHelpers.forEach(meshHelper => meshHelper.update())
    }
  }

  destroy() {
    if (this.meshHelpers) {
      this.meshHelpers.forEach(meshHelper => this.scene.remove(meshHelper))
    }
    this.meshes.forEach(mesh => U.disposeMesh(this.scene, mesh))
  }

  toggleVertexNormals() {
    if (this.meshHelpers) {
      this.meshHelpers.forEach(meshHelper => this.scene.remove(meshHelper))
      this.meshHelpers = null
    } else {
      this.meshHelpers = this.meshes.map(mesh => new VertexNormalsHelper(mesh, 0.2, 0x0000ff))
      this.meshHelpers.forEach(meshHelper => this.scene.add(meshHelper))
    }
  }
}
