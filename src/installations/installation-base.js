import { Mode } from '../mode'
import { ProjectionEffect } from '../projection-effect'
import { ScreenImage } from '../screen-image'

const createRenderables2D = (scene, installation) => {
  const screenForms = installation.installationData2D.screenForms
  return {
    screenImages: screenForms.map(screenForm => new ScreenImage(scene, screenForm))
  }
}

const createRenderables3D = (scene, installation, resources) => {
  const screenForms = installation.installationData3D.screenForms
  const projectedForms = installation.installationData3D.projectedForms
  const surfaces = installation.installationData3D.surfaces
  surfaces.forEach(surface => surface.create(scene))
  return {
    screenImages: screenForms.map(screenForm => new ScreenImage(scene, screenForm)),
    projectionEffects: projectedForms.map(projectedForm => new ProjectionEffect(scene, projectedForm, resources)),
    surfaces
  }
}

export class InstallationBase {

  updateVisibility(mode, showVertexNormals, isCurrentInstallation) {

    const visible2D = isCurrentInstallation && mode === Mode.Mode2D
    this.renderables2D.screenImages.forEach(screenImage => screenImage.visible = visible2D)

    const visible3D = isCurrentInstallation && mode === Mode.Mode3D
    this.renderables3D.screenImages.forEach(screenImage => screenImage.visible = visible3D)
    this.renderables3D.projectionEffects.forEach(projectionEffect => {
      projectionEffect.visible = visible3D
      projectionEffect.showVertexNormals = showVertexNormals
    })
    this.renderables3D.surfaces.forEach(surface => surface.visible = visible3D)
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
      }
    })
  }

  createRenderables(scene, resources) {
    this.renderables2D = createRenderables2D(scene, this)
    this.renderables3D = createRenderables3D(scene, this, resources)
    return this
  }
}
