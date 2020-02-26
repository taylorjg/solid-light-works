import * as THREE from 'three'
import { MembraneBufferGeometry } from './membrane-geometry'
import { VertexNormalsHelper } from 'three/examples/jsm/helpers/VertexNormalsHelper.js'
import vertexShader from './shaders/vertex-shader.glsl'
import fragmentShader from './shaders/fragment-shader.glsl'
import * as U from './utils'
import * as C from './constants'

const MEMBRANE_SEGMENT_COUNT = 1

export class ProjectionEffect {

  constructor(scene, hazeTexture) {
    this.scene = scene
    this.membraneGeometry = new MembraneBufferGeometry()
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
    this.membraneMesh = new THREE.Mesh(this.membraneGeometry, membraneMaterial)
    scene.add(this.membraneMesh)
  }

  update(vec2ProjectorPoints, vec2ScreenPoints) {

    const projectorPoints = U.vec2sToVec3s(vec2ProjectorPoints, C.MEMBRANE_LENGTH)
    const screenPoints = U.vec2sToVec3s(vec2ScreenPoints)

    const tempMembraneGeometry = new MembraneBufferGeometry(projectorPoints, screenPoints, MEMBRANE_SEGMENT_COUNT)
    tempMembraneGeometry.computeFaceNormals()
    tempMembraneGeometry.computeVertexNormals()
    const normalAttribute = tempMembraneGeometry.getAttribute('normal')
    const array = normalAttribute.array
    array.forEach((_, index) => array[index] *= -1)
    this.membraneGeometry.copy(tempMembraneGeometry)
    tempMembraneGeometry.dispose()

    if (this.membraneMeshHelper) {
      this.membraneMeshHelper.update()
    }
  }

  toggleHelpers() {
    if (this.membraneMeshHelper) {
      this.scene.remove(this.membraneMeshHelper)
      this.membraneMeshHelper = undefined
    }
    else {
      this.membraneMeshHelper = new VertexNormalsHelper(this.membraneMesh, 0.2, 0xffffff)
      this.scene.add(this.membraneMeshHelper)
    }
  }
}
