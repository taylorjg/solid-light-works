import { BufferGeometry, Float32BufferAttribute, Uint16BufferAttribute, Vector2 } from 'three'
import getNormals from 'polyline-normals'

const VERTS_PER_POINT = 2

export class LineGeometry extends BufferGeometry {

  constructor(lineThickness, extendEnds) {
    super()
    this._lineThickness = lineThickness
    this._halfLineThickness = lineThickness / 2
    this._extendEnds = extendEnds
    this.setAttribute('position', new Float32BufferAttribute([], 3))
    this.setIndex(new Uint16BufferAttribute([], 1))
    this.update()
  }

  update(path, closed) {
    path = path || []

    if (!closed && this._extendEnds && path.length >= 2) {
      const v1 = new Vector2(...path[0])
      const v2 = new Vector2(...path[1])
      const vExtendStartDirection = v1.clone().sub(v2).normalize()
      const pExtendedStart = v1.clone().addScaledVector(vExtendStartDirection, this._lineThickness).toArray()
      path.unshift(pExtendedStart)

      const numPoints = path.length
      const v3 = new Vector2(...path[numPoints - 2])
      const v4 = new Vector2(...path[numPoints - 1])
      const vExtendEndDirection = v4.clone().sub(v3).normalize()
      const pExtendedEnd = v4.clone().addScaledVector(vExtendEndDirection, this._lineThickness).toArray()
      path.push(pExtendedEnd)
    }

    const normals = getNormals(path, closed)

    if (closed) {
      path = path.slice()
      path.push(path[0])
      normals.push(normals[0])
    }

    const attrPosition = this.getAttribute('position')
    const attrIndex = this.getIndex()

    const attrPositionCount = path.length * VERTS_PER_POINT
    const attrIndexCount = Math.max(0, (path.length - 1) * 6)

    if (!attrPosition.array || (path.length !== attrPosition.array.length / 3 / VERTS_PER_POINT)) {
      attrPosition.array = new Float32Array(attrPositionCount * 3)
      attrIndex.array = new Uint16Array(attrIndexCount)
    }

    if (attrPosition.count !== undefined) {
      attrPosition.count = attrPositionCount
    }
    attrPosition.needsUpdate = true

    if (attrIndex.count !== undefined) {
      attrIndex.count = attrIndexCount
    }
    attrIndex.needsUpdate = true

    let attrPositionIndex = 0
    let attrIndexIndex = 0

    path.forEach((point, pointIndex) => {
      attrIndex.array[attrIndexIndex++] = attrPositionIndex + 0
      attrIndex.array[attrIndexIndex++] = attrPositionIndex + 1
      attrIndex.array[attrIndexIndex++] = attrPositionIndex + 2
      attrIndex.array[attrIndexIndex++] = attrPositionIndex + 2
      attrIndex.array[attrIndexIndex++] = attrPositionIndex + 1
      attrIndex.array[attrIndexIndex++] = attrPositionIndex + 3

      const [px, py] = point
      const [[nx, ny], miter] = normals[pointIndex]
      const p1 = new Vector2(px, py)
      const p2 = new Vector2(px, py)
      p1.add(new Vector2(nx, ny).multiplyScalar(this._halfLineThickness * -miter))
      p2.add(new Vector2(nx, ny).multiplyScalar(this._halfLineThickness * miter))
      attrPosition.setXYZ(attrPositionIndex++, p1.x, p1.y, 0)
      attrPosition.setXYZ(attrPositionIndex++, p2.x, p2.y, 0)
    })
  }
}
