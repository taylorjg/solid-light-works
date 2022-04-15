import { Group } from 'three'
import { Mode } from '../mode'
import { ProjectionEffect } from '../projection-effect'
import { ScreenImage } from '../screen-image'

const createRenderables2D = (parent, installation) => {
  const screenForms = installation.installationData2D.screenForms
  return {
    screenImages: screenForms.map(screenForm => new ScreenImage(parent, screenForm)),
  }
}

const createRenderables3D = (parent, installation, resources) => {
  const screenForms = installation.installationData3D.screenForms
  const projectedForms = installation.installationData3D.projectedForms
  const scenery = installation.installationData3D.scenery
  scenery.forEach(sceneryItem => sceneryItem.create(parent))
  return {
    screenImages: screenForms.map(screenForm => new ScreenImage(parent, screenForm)),
    projectionEffects: projectedForms.map(projectedForm => new ProjectionEffect(parent, projectedForm, resources)),
    scenery
  }
}

export class InstallationBase {

  constructor() {
    this.group2d = undefined
    this.group3d = undefined
  }

  updateVisibility(mode, showVertexNormals, showIntersectionPoints, isCurrentInstallation) {

    const visible2D = isCurrentInstallation && mode === Mode.Mode2D
    this.group2d.visible = visible2D
    this.renderables2D.screenImages.forEach(screenImage => screenImage.intersectionPointsVisible = showIntersectionPoints)

    const visible3D = isCurrentInstallation && mode === Mode.Mode3D
    this.group3d.visible = visible3D
    this.renderables3D.screenImages.forEach(screenImage => screenImage.intersectionPointsVisible = showIntersectionPoints)
    this.renderables3D.projectionEffects.forEach(projectionEffect => projectionEffect.showVertexNormals = showVertexNormals)
  }

  updateRenderables(mode) {
    this.forms.forEach((form, index) => {
      const lines = form.getLines()
      switch (mode) {
        case Mode.Mode2D:
          this.renderables2D.screenImages[index].update(lines)
          break
        case Mode.Mode3D:
          this.renderables3D.screenImages[index].update(lines)
          this.renderables3D.projectionEffects[index].update(lines)
          break
        default:
          break
      }
    })
  }

  createRenderables(scene, resources) {
    this.group2d = new Group()
    this.group3d = new Group()
    this.renderables2D = createRenderables2D(this.group2d, this)
    this.renderables3D = createRenderables3D(this.group3d, this, resources)
    scene.add(this.group2d)
    scene.add(this.group3d)
    return this
  }
}
