import { BufferGeometry, BufferAttribute } from 'three'
import getNormals from 'polyline-normals'

const VERTS_PER_POINT = 2

export class LineGeometry extends BufferGeometry {

  constructor(path, opt) {

    super()

    if (Array.isArray(path)) {
      opt = opt || {}
    } else if (typeof path === 'object') {
      opt = path
      path = []
    }

    opt = opt || {}

    this.setAttribute('position', new BufferAttribute(undefined, 3))
    this.setAttribute('lineNormal', new BufferAttribute(undefined, 2))
    this.setAttribute('lineMiter', new BufferAttribute(undefined, 1))
    if (opt.distances) {
      this.setAttribute('lineDistance', new BufferAttribute(undefined, 1))
    }
    this.setIndex(new BufferAttribute(undefined, 1))
    this.update(path, opt.closed)
  }

  update(path, closed) {
    path = path || []
    var normals = getNormals(path, closed)

    if (closed) {
      path = path.slice()
      path.push(path[0])
      normals.push(normals[0])
    }

    var attrPosition = this.getAttribute('position')
    var attrNormal = this.getAttribute('lineNormal')
    var attrMiter = this.getAttribute('lineMiter')
    var attrDistance = this.getAttribute('lineDistance')
    var attrIndex = typeof this.getIndex === 'function' ? this.getIndex() : this.getAttribute('index')

    var indexCount = Math.max(0, (path.length - 1) * 6)
    if (!attrPosition.array ||
      (path.length !== attrPosition.array.length / 3 / VERTS_PER_POINT)) {
      var count = path.length * VERTS_PER_POINT
      attrPosition.array = new Float32Array(count * 3)
      attrNormal.array = new Float32Array(count * 2)
      attrMiter.array = new Float32Array(count)
      attrIndex.array = new Uint16Array(indexCount)

      if (attrDistance) {
        attrDistance.array = new Float32Array(count)
      }
    }

    if (undefined !== attrPosition.count) {
      attrPosition.count = count
    }
    attrPosition.needsUpdate = true

    if (undefined !== attrNormal.count) {
      attrNormal.count = count
    }
    attrNormal.needsUpdate = true

    if (undefined !== attrMiter.count) {
      attrMiter.count = count
    }
    attrMiter.needsUpdate = true

    if (undefined !== attrIndex.count) {
      attrIndex.count = indexCount
    }
    attrIndex.needsUpdate = true

    if (attrDistance) {
      if (undefined !== attrDistance.count) {
        attrDistance.count = count
      }
      attrDistance.needsUpdate = true
    }

    var index = 0
    var c = 0
    var dIndex = 0
    var indexArray = attrIndex.array

    path.forEach(function (point, pointIndex, list) {
      var i = index
      indexArray[c++] = i + 0
      indexArray[c++] = i + 1
      indexArray[c++] = i + 2
      indexArray[c++] = i + 2
      indexArray[c++] = i + 1
      indexArray[c++] = i + 3

      attrPosition.setXYZ(index++, point[0], point[1], 0)
      attrPosition.setXYZ(index++, point[0], point[1], 0)

      if (attrDistance) {
        var d = pointIndex / (list.length - 1)
        attrDistance.setX(dIndex++, d)
        attrDistance.setX(dIndex++, d)
      }
    })

    var nIndex = 0
    var mIndex = 0
    normals.forEach(function (n) {
      var norm = n[0]
      var miter = n[1]
      attrNormal.setXY(nIndex++, norm[0], norm[1])
      attrNormal.setXY(nIndex++, norm[0], norm[1])

      attrMiter.setX(mIndex++, -miter)
      attrMiter.setX(mIndex++, miter)
    })
  }
}
