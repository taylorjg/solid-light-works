export class Line {

  constructor(points, options = {}) {
    this._points = points
    this._opacity = options.opacity ?? 1.0
    this._closed = options.closed ?? false
    this._clippingPlanes = options.clippingPlanes
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
}
