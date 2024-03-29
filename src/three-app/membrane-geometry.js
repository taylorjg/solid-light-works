import { BufferGeometry, Float32BufferAttribute } from 'three'

// ps (projectorPoints): array of Vector3 representing the small shape at the projector end of the membrane
// qs (screenPoints): array of Vector3 representing the large shape at the screen end of the membrane
// This class is heavily inspired by THREE.CylinderGeometry
export class MembraneGeometry extends BufferGeometry {

  constructor(ps = [], qs = [], numSegments = 1) {

    super()

    this.type = 'MembraneGeometry'

    numSegments = Math.floor(numSegments) || 1

    // buffers
    const indices = []
    const vertices = []
    const normals = []
    const uvs = []

    // helper variables
    const indexArray = []
    let index = 0

    // generate geometry
    generateTorso()

    // build geometry
    this.setIndex(indices)
    this.setAttribute('position', new Float32BufferAttribute(vertices, 3))
    this.setAttribute('normal', new Float32BufferAttribute(normals, 3))
    this.setAttribute('uv', new Float32BufferAttribute(uvs, 2))

    function generateTorso() {

      const pslen = ps.length
      const qslen = qs.length

      if (pslen === 0 || qslen === 0 || pslen !== qslen) {
        return
      }

      const numPoints = ps.length

      // generate vertices, normals and uvs
      for (let y = 0; y <= numSegments; y++) {
        const v = y / numSegments
        const indexRow = []

        for (let x = 0; x < numPoints; x++) {
          const u = x / numPoints

          // vertex
          const clone = ps[x].clone()
          clone.lerp(qs[x], v)
          vertices.push(clone.x, clone.y, clone.z)

          // normal
          normals.push(0, 0, 0)

          // uv
          uvs.push(u, v)

          // save index of vertex in respective row
          indexRow.push(index++)
        }

        // now save vertices of the row in our index array
        indexArray.push(indexRow)
      }

      // generate indices
      for (let x = 0; x < numPoints; x++) {

        for (let y = 0; y < numSegments; y++) {

          // we use the index array to access the correct indices
          const a = indexArray[y][x]
          const b = indexArray[y + 1][x]
          const c = indexArray[y + 1][x + 1]
          const d = indexArray[y][x + 1]

          // faces
          indices.push(a, b, d)
          indices.push(b, c, d)
        }
      }
    }
  }
}
