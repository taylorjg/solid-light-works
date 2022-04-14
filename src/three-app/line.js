export class Line {

  constructor(points, options = {}) {
    this._points = points
    this._opacity = options.opacity ?? 1.0
    this._closed = options.closed ?? false
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
}
