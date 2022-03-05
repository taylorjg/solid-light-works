import { Mode } from '../mode'

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
}
