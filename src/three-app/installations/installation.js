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

  updateVisibility(mode, showVertexNormals, showIntersectionPoints, isCurrentInstallation) {

    const visible2D = isCurrentInstallation && mode === Mode.Mode2D
    this.group2d.visible = visible2D
    for (const work of this.config.works) {
      work.renderables2D.screenImages.forEach(screenImage => screenImage.intersectionPointsVisible = showIntersectionPoints)
    }

    const visible3D = isCurrentInstallation && mode === Mode.Mode3D
    this.group3d.visible = visible3D
    for (const work of this.config.works) {
      work.renderables3D.screenImages.forEach(screenImage => screenImage.intersectionPointsVisible = showIntersectionPoints)
      work.renderables3D.projectionEffects.forEach(projectionEffect => projectionEffect.showVertexNormals = showVertexNormals)
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

  _createRenderables2D() {
    for (const work of this.config.works) {
      work.renderables2D = {
        screenImages: work.formConfigs.map(formConfig => new ScreenImage(this.group2d, formConfig.config2D))
      }
    }
  }

  _createRenderables3D(resources) {
    this.config.config3D.scenery.forEach(sceneryItem => sceneryItem.create(this.sceneryGroup))

    for (const work of this.config.works) {
      work.renderables3D = {
        // TODO: change shape of this
        screenImages: work.formConfigs.map(formConfig => new ScreenImage(this.group3d, formConfig.config3D)),
        projectionEffects: work.formConfigs.map(formConfig => new ProjectionEffect(this.group3d, formConfig.config3D, resources))
      }
    }
  }
}
