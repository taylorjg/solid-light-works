import * as THREE from 'three'
import { MembraneBufferGeometry } from './membrane-geometry'
import { VertexNormalsHelper } from 'three/examples/jsm/helpers/VertexNormalsHelper.js'
import vertexShader from './shaders/vertex-shader.glsl'
import fragmentShader from './shaders/fragment-shader.glsl'
import * as U from './utils'
import * as C from './constants'

const MEMBRANE_SEGMENT_COUNT = 1

export class ProjectionEffect {

  constructor(scene, meshCount, hazeTexture) {
    this.scene = scene
    this.meshCount = meshCount
    this.meshes = U.range(meshCount).map(() => {
      const membraneGeometry = new MembraneBufferGeometry()
      const membraneMaterial = new THREE.ShaderMaterial({
        uniforms: {
          hazeTexture: {
            value: hazeTexture
          }
        },
        vertexShader,
        fragmentShader,
        side: THREE.DoubleSide,
        blending: THREE.AdditiveBlending
      })
      const membraneMesh = new THREE.Mesh(membraneGeometry, membraneMaterial)
      scene.add(membraneMesh)
      return membraneMesh
    })
    this.meshHelpers = null
  }

  update(vec2ProjectorPointsArray, vec2ScreenPointsArray) {
    U.range(this.meshCount).forEach(meshIndex => {
      const projectorPoints = U.vec2sToVec3s(vec2ProjectorPointsArray[meshIndex], C.MEMBRANE_LENGTH)
      const screenPoints = U.vec2sToVec3s(vec2ScreenPointsArray[meshIndex])
      const tempMembraneGeometry = new MembraneBufferGeometry(projectorPoints, screenPoints, MEMBRANE_SEGMENT_COUNT)
      tempMembraneGeometry.computeFaceNormals()
      tempMembraneGeometry.computeVertexNormals()
      const normalAttribute = tempMembraneGeometry.getAttribute('normal')
      const array = normalAttribute.array
      array.forEach((_, index) => array[index] *= -1)
      this.meshes[meshIndex].geometry.copy(tempMembraneGeometry)
      tempMembraneGeometry.dispose()
      if (this.membraneMeshHelper) {
        this.membraneMeshHelper.update()
      }
    })
  }

  toggleHelpers() {
    if (this.meshHelpers) {
      this.meshHelpers.forEach(meshHelper => this.scene.remove(meshHelper))
      this.meshHelpers = null
    } else {
      this.meshHelpers = this.meshes.map(mesh => new VertexNormalsHelper(mesh, 0.2, 0xffffff))
      this.meshHelpers.forEach(meshHelper => this.scene.add(meshHelper))
    }
  }
}
