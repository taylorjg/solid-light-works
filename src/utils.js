import * as THREE from 'three'

export const range = n =>
  Array.from(Array(n).keys())

export const repeat = (n, x) =>
  range(n).map(() => x)

export const reverse = xs =>
  xs.reverse()

export const vectorsAsArrays = vectors =>
  vectors.map(vector => vector.toArray())

export const vec2sToVec3sHorizontal = (vec2s, distance = 0) =>
  vec2s.map(({ x, y }) => new THREE.Vector3(x, y, distance))

export const vec2sToVec3sVertical = (vec2s, height = 0) =>
  vec2s.map(({ x, y }) => new THREE.Vector3(x, height, y))

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
