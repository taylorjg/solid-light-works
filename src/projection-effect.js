import * as THREE from 'three'
import { MembraneBufferGeometry } from './membrane-geometry'
import { VertexNormalsHelper } from 'three/examples/jsm/helpers/VertexNormalsHelper.js'
import vertexShader from './shaders/vertex-shader.glsl'
import fragmentShader from './shaders/fragment-shader.glsl'
import * as U from './utils'
import * as C from './constants'

export class ProjectionEffect {

  constructor(projectorPosition, meshCount, scene, hazeTexture, applyTransforms) {
    this.projectorPosition = projectorPosition
    this.meshCount = meshCount
    this.scene = scene
    this.meshes = U.range(meshCount).map(() => {
      const geometry = new MembraneBufferGeometry()
      const material = new THREE.ShaderMaterial({
        uniforms: {
          hazeTexture: {
            value: hazeTexture
          },
          projectorPosition: {
            value: projectorPosition
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

  update(vec2ScreenPointsArray) {
    U.range(this.meshCount).forEach(meshIndex => {
      const vec2ScreenPoints = vec2ScreenPointsArray[meshIndex]
      const numPoints = vec2ScreenPoints.length
      const projectorPoints = U.repeat(numPoints, this.projectorPosition)
      const screenPoints = U.vec2sToVec3sHorizontal(vec2ScreenPoints)
      const tempMembraneGeometry = new MembraneBufferGeometry(projectorPoints, screenPoints)
      tempMembraneGeometry.computeFaceNormals()
      tempMembraneGeometry.computeVertexNormals()
      const mesh = this.meshes[meshIndex]
      mesh.geometry.copy(tempMembraneGeometry)
      tempMembraneGeometry.dispose()
      if (this.meshHelpers) {
        this.meshHelpers.forEach(meshHelper => meshHelper.update())
      }
    })
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
      this.meshHelpers = this.meshes.map(mesh => new VertexNormalsHelper(mesh, 0.2, 0xffffff))
      this.meshHelpers.forEach(meshHelper => this.scene.add(meshHelper))
    }
  }
}
