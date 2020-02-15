import * as THREE from "three"

const NUM_PARTICLES = 10000

const geometry = new THREE.SphereBufferGeometry(0.01, 4, 4)
const material = new THREE.MeshPhongMaterial()
const particle = new THREE.Mesh(geometry, material)

export const createDust = (scene, cx) => {
  // for (let i = 0; i < NUM_PARTICLES; i++) {
  //   const clonedParticle = particle.clone()
  //   clonedParticle.position.x = cx + Math.random() * 6 - 3
  //   clonedParticle.position.y = Math.random() * 5
  //   clonedParticle.position.z = Math.random() * 18
  //   scene.add(clonedParticle)
  // }
}
