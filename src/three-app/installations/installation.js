import { Group } from 'three'
import { Mode } from '../mode'
import { ProjectionEffect } from '../projection-effect'
import { ScreenImage } from '../screen-image'

export class Installation {

  constructor(scene, resources, config) {
    this.config = config
    this._createGroups(scene)
    this._createRenderables(resources)
  }

  updateVisibility(mode, isCurrentInstallation, options) {
    this.group2d.visible = isCurrentInstallation && mode === Mode.Mode2D
    this.group3d.visible = isCurrentInstallation && mode === Mode.Mode3D

    const {
      vertexNormalsEnabled,
      intersectionPointsEnabled,
      formBoundariesEnabled
    } = options

    for (const work of this.config.works) {
      work.renderables2D.screenImages.forEach(screenImage => {
        screenImage.intersectionPointsVisible = intersectionPointsEnabled
        screenImage.formBoundaryVisible = formBoundariesEnabled
      })
      work.renderables3D.screenImages.forEach(screenImage => {
        screenImage.intersectionPointsVisible = intersectionPointsEnabled
        screenImage.formBoundaryVisible = formBoundariesEnabled
      })
      work.renderables3D.projectionEffects.forEach(projectionEffect => {
        projectionEffect.showVertexNormals = vertexNormalsEnabled
      })
    }
  }

  updateRenderables(mode) {
    for (const work of this.config.works) {
      work.formConfigs.forEach((formConfig, index) => {
        const lines = formConfig.form.getLines()
        switch (mode) {
          case Mode.Mode2D:
            work.renderables2D.screenImages[index].update(lines)
            break
          case Mode.Mode3D:
            work.renderables3D.screenImages[index].update(lines)
            work.renderables3D.projectionEffects[index].update(lines)
            break
          default:
            break
        }
      })
    }
  }

  showScenery() {
    this.sceneryGroup.visible = true
  }

  hideScenery() {
    this.sceneryGroup.visible = false
  }

  _createGroups(scene) {
    this.group2d = new Group()
    this.group3d = new Group()
    this.sceneryGroup = new Group()
    scene.add(this.group2d)
    scene.add(this.group3d)
    this.group3d.add(this.sceneryGroup)
  }

  _createRenderables(resources) {
    this._createRenderables2D()
    this._createRenderables3D(resources)
  }

  _getFormBoundary(form) {
    return {
      width: form.width,
      height: form.height
    }
  }

  _createRenderables2D() {
    const mode = this.config.config2D.mode ?? 0

    for (const work of this.config.works) {
      work.renderables2D = {
        screenImages: work.formConfigs.map(formConfig => {
          const config = { ...formConfig.config2D, mode }
          const formBoundary = this._getFormBoundary(formConfig.form)
          return new ScreenImage(this.group2d, config, formBoundary)
        })
      }
    }
  }

  _createRenderables3D(resources) {
    const mode = this.config.config3D.mode ?? 1
    this.config.config3D.scenery.forEach(sceneryItem => sceneryItem.create(this.sceneryGroup))

    for (const work of this.config.works) {
      work.renderables3D = {
        screenImages: work.formConfigs.map(formConfig => {
          const config = { ...formConfig.config3D, mode }
          const formBoundary = this._getFormBoundary(formConfig.form)
          return new ScreenImage(this.group3d, config, formBoundary)
        }),
        projectionEffects: work.formConfigs.map(formConfig => {
          const formBoundary = this._getFormBoundary(formConfig.form)
          return new ProjectionEffect(this.group3d, formConfig.config3D, formBoundary, resources)
        })
      }
    }
  }
}
