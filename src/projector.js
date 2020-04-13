import { ProjectionEffect } from './projection-effect'
import { ScreenImage } from './screen-image'
import * as U from './utils'

export class Projector {

  constructor(projectorPosition, screenForm, scene, hazeTexture, applyTransforms) {
    const shapeCount = screenForm.shapeCount
    this.screenForm = screenForm
    this.screenImage = new ScreenImage(shapeCount, scene, applyTransforms)
    this.projectionEffect = new ProjectionEffect(projectorPosition, shapeCount, scene, hazeTexture, applyTransforms)
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
