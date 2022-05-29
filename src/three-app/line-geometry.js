import { BufferGeometry, Float32BufferAttribute, Uint16BufferAttribute } from 'three'
import { makeLinePointPairs } from './line-point-pairs'

const VERTICES_PER_POINT = 2

export class LineGeometry extends BufferGeometry {

  constructor(lineThickness) {
    super()
    this._lineThickness = lineThickness
    this.setAttribute('position', new Float32BufferAttribute([], 3))
    this.setIndex(new Uint16BufferAttribute([], 1))
    this.update()
  }

  update(path, closed) {
    const linePointPairs = makeLinePointPairs(path, closed, this._lineThickness)

    const attrPosition = this.getAttribute('position')
    const attrIndex = this.getIndex()

    const pathLength = linePointPairs.length

    const attrPositionCount = pathLength * VERTICES_PER_POINT
    const attrIndexCount = Math.max(0, (pathLength - 1) * 6)

    if (!attrPosition.array || (pathLength !== attrPosition.array.length / 3 / VERTICES_PER_POINT)) {
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

    for (const linePointPair of linePointPairs) {

      const a = attrPositionIndex + 0
      const b = attrPositionIndex + 1
      const c = attrPositionIndex + 2
      const d = attrPositionIndex + 3

      attrIndex.array[attrIndexIndex++] = a
      attrIndex.array[attrIndexIndex++] = b
      attrIndex.array[attrIndexIndex++] = c

      attrIndex.array[attrIndexIndex++] = c
      attrIndex.array[attrIndexIndex++] = b
      attrIndex.array[attrIndexIndex++] = d

      const { upperPoint, lowerPoint } = linePointPair
      attrPosition.setXYZ(attrPositionIndex++, upperPoint.x, upperPoint.y, 0)
      attrPosition.setXYZ(attrPositionIndex++, lowerPoint.x, lowerPoint.y, 0)
    }
  }
}
