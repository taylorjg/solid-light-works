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

        // if (!mesh.material.planeHelper) {
        //   mesh.material.planeHelper = new THREE.PlaneHelper(firstClippingPlane, 20)
        //   this._parent.add(mesh.material.planeHelper)
        //   const sphereGeometry1 = new THREE.SphereBufferGeometry(0.05, 16, 16)
        //   const sphereGeometry2 = new THREE.SphereBufferGeometry(0.05, 16, 16)
        //   const sphereMaterial1 = new THREE.LineBasicMaterial({ color: 'brown' })
        //   const sphereMaterial2 = new THREE.LineBasicMaterial({ color: 'pink' })
        //   mesh.material.sphereMesh1 = new THREE.Mesh(sphereGeometry1, sphereMaterial1)
        //   mesh.material.sphereMesh2 = new THREE.Mesh(sphereGeometry2, sphereMaterial2)
        //   this._parent.add(mesh.material.sphereMesh1)
        //   this._parent.add(mesh.material.sphereMesh2)
        // } else {
        //   mesh.material.planeHelper.plane = firstClippingPlane
        // }

        const firstClippingPlane = mesh.material.clippingPlanes[0]
        const p1 = new THREE.Vector3(2, 2, 0).applyMatrix4(this._config3D.transform)
        const p2 = new THREE.Vector3(2, -2, 0).applyMatrix4(this._config3D.transform)
        const p3 = new THREE.Vector3()
        const p4 = new THREE.Vector3()
        firstClippingPlane.projectPoint(p1, p3)
        firstClippingPlane.projectPoint(p2, p4)
        const translation = new THREE.Matrix4().makeTranslation(...this._config3D.projectorPosition.toArray())
        const transform = translation.premultiply(this._config3D.transform)
        const p5 = new THREE.Vector3().applyMatrix4(transform)

        const oldNormal = firstClippingPlane.normal.clone()
        firstClippingPlane.setFromCoplanarPoints(p3, p4, p5)
        const newNormal = firstClippingPlane.normal.clone()
        const dotProduct = oldNormal.dot(newNormal)
        if (dotProduct < 0) {
          firstClippingPlane.negate()
        }
        // console.log(`oldNormal: ${oldNormal.toArray()}; newNormal: ${newNormal.toArray()}; dotProduct: ${dotProduct}`)
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
