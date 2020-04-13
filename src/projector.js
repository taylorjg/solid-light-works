import { ProjectionEffect } from './projection-effect'
import { ScreenImage } from './screen-image'
import * as U from './utils'

export class Projector {

  constructor(projectorPosition, orientation, screenForm, scene, hazeTexture) {
    const shapeCount = screenForm.shapeCount
    this.screenForm = screenForm
    this.screenImage = new ScreenImage(orientation, shapeCount, scene)
    this.projectionEffect = new ProjectionEffect(projectorPosition, orientation, shapeCount, scene, hazeTexture)
  }

  update() {
    const screenShapes = this.screenForm.getUpdatedPoints().map(U.reverse)
    this.screenImage.update(screenShapes)
    this.projectionEffect.update(screenShapes)
  }

  destroy() {
    this.screenImage.destroy()
    this.projectionEffect.destroy()
  }

  toggleVertexNormals() {
    this.projectionEffect.toggleVertexNormals()
  }
}
