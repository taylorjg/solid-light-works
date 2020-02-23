import * as THREE from 'three'

export const vectorsAsArrays = vectors =>
  vectors.map(vector => vector.toArray())

export const vec2sToVec3s = (vec2s, z = 0) =>
  vec2s.map(({ x, y }) => new THREE.Vector3(x, y, z))

export const loadTexture = url =>
  new Promise((resolve, reject) => {
    const textureLoader = new THREE.TextureLoader()
    textureLoader.load(url, resolve, reject)
  })
