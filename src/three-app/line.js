export class Line {

  constructor(points, opacity = 1) {
    this._points = points
    this._opacity = opacity
  }

  get points() {
    return this._points
  }

  get opacity() {
    return this._opacity
  }
}
