import { BufferGeometry, Float32BufferAttribute, Uint16BufferAttribute, Vector2 } from 'three'
import getNormals from 'polyline-normals'

export class LineGeometry extends BufferGeometry {

  constructor(lineThickness, extendEnds) {
    super()
    this._lineThickness = lineThickness
    this._halfLineThickness = lineThickness / 2
    this._extendEnds = extendEnds
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

    if (!this.getAttribute('position')) {
      const verticesPerPoint = 2
      const attrPositionCount = path.length * verticesPerPoint
      const attrPositionItemSize = 3
      const attrPositionLength = attrPositionCount * attrPositionItemSize
      this.setAttribute('position', new Float32BufferAttribute(attrPositionLength, attrPositionItemSize))
      const attrIndexCount = (path.length - 1) * 6
      const attrIndexItemSize = 1
      const attrIndexLength = attrIndexCount * attrIndexItemSize
      this.setIndex(new Uint16BufferAttribute(attrIndexLength, attrIndexItemSize))
    }

    const attrPosition = this.getAttribute('position')
    const attrIndex = this.getIndex()

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

    attrPosition.needsUpdate = true
    attrIndex.needsUpdate = true
  }
}
