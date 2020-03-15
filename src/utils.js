import * as THREE from 'three'

export const range = n =>
  Array.from(Array(n).keys())

export const repeat = (n, x) =>
  range(n).map(() => x)

export const reverse = xs =>
  xs.reverse()

export const vectorsAsArrays = vectors =>
  vectors.map(vector => vector.toArray())

export const vec2sToVec3s = (vec2s, z = 0) =>
  vec2s.map(({ x, y }) => new THREE.Vector3(x, y, z))

export const loadTexture = url =>
  new Promise((resolve, reject) => {
    const textureLoader = new THREE.TextureLoader()
    textureLoader.load(url, resolve, reject)
  })

export const disposeMesh = (scene, mesh) => {
  scene.remove(mesh)
  mesh.geometry.dispose()
  mesh.material.dispose()
}
