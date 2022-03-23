export class Line {

  constructor(points, opacity = 1, closed = false) {
    this._points = points
    this._opacity = opacity
    this._closed = closed
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
