export class SceneryBase {

  constructor() {
    this._visible = false
    this._mesh = null
  }

  set visible(value) {
    this._visible = value
    if (this._mesh) {
      this._mesh.visible = value
    }
  }
}
