import * as C from './constants'

export class Line {

  constructor(points, options = {}) {
    this._points = points
    this._opacity = options.opacity ?? 1.0
    this._closed = options.closed ?? false
    this._clippingPlanes = options.clippingPlanes
    this._lineThickness = options.lineThickness ?? C.LINE_THICKNESS
    this._clipToFormBoundary = options.clipToFormBoundary ?? false
    this._maxNumPoints = options.maxNumPoints
  }

  get points() {
    return this._points
  }

  get opacity() {
    return this._opacity
  }

  get closed() {
    return this._closed
  }

  get clippingPlanes() {
    return this._clippingPlanes
  }

  get lineThickness() {
    return this._lineThickness
  }

  get clipToFormBoundary() {
    return this._clipToFormBoundary
  }

  get maxNumPoints() {
    return this._maxNumPoints
  }
}
