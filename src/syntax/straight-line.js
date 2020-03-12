export class StraightLine {

  constructor(point1, point2) {
    this.point1 = point1
    this.point2 = point2
  }

  getPoints() {
    return [
      this.point1,
      this.point2
    ]
  }
}
