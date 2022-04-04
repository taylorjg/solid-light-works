import { Mode } from '../mode'
import { ProjectionEffect } from '../projection-effect'
import { ScreenImage } from '../screen-image'
import { IntersectionPoints } from '../intersection-points'

const createRenderables2D = (scene, installation) => {
  const screenForms = installation.installationData2D.screenForms
  return {
    screenImages: screenForms.map(screenForm => new ScreenImage(scene, screenForm)),
    intersectionPointss: screenForms.map(screenForm => new IntersectionPoints(scene, screenForm))
  }
}

const createRenderables3D = (scene, installation, resources) => {
  const screenForms = installation.installationData3D.screenForms
  const projectedForms = installation.installationData3D.projectedForms
  const scenery = installation.installationData3D.scenery
  scenery.forEach(sceneryItem => sceneryItem.create(scene))
  return {
    screenImages: screenForms.map(screenForm => new ScreenImage(scene, screenForm)),
    projectionEffects: projectedForms.map(projectedForm => new ProjectionEffect(scene, projectedForm, resources)),
    scenery
  }
}

export class InstallationBase {

  updateVisibility(mode, showVertexNormals, showIntersectionPoints, isCurrentInstallation) {

    const visible2D = isCurrentInstallation && mode === Mode.Mode2D
    this.renderables2D.screenImages.forEach(screenImage => screenImage.visible = visible2D)
    this.renderables2D.intersectionPointss.forEach(intersectionPoints => intersectionPoints.visible = visible2D && showIntersectionPoints)

    const visible3D = isCurrentInstallation && mode === Mode.Mode3D
    this.renderables3D.screenImages.forEach(screenImage => screenImage.visible = visible3D)
    this.renderables3D.projectionEffects.forEach(projectionEffect => {
      projectionEffect.visible = visible3D
      projectionEffect.showVertexNormals = visible3D && showVertexNormals
    })
    this.renderables3D.scenery.forEach(sceneryItem => sceneryItem.visible = visible3D)
  }

  updateRenderables(mode) {
    this.forms.forEach((form, index) => {
      const lines = form.getLines()
      switch (mode) {
        case Mode.Mode2D:
          this.renderables2D.screenImages[index].update(lines)
          if (this.renderables2D.intersectionPointss[index].visible) {
            if (lines.intersectionPoints) {
              this.renderables2D.intersectionPointss[index].update(lines.intersectionPoints)
            }
          }
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
    this.renderables2D = createRenderables2D(scene, this)
    this.renderables3D = createRenderables3D(scene, this, resources)
    return this
  }

  showScenery() {
    for (const sceneryItem of this.renderables3D.scenery) {
      sceneryItem.visible = true
    }
  }

  hideScenery() {
    for (const sceneryItem of this.renderables3D.scenery) {
      sceneryItem.visible = false
    }
  }
}
