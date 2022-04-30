import { Group } from 'three'
import { Mode } from '../mode'
import { ProjectionEffect } from '../projection-effect'
import { ScreenImage } from '../screen-image'

const SCENERY_GROUP_NAME = "Scenery"

const createRenderables2D = (parent, config) => {
  for (const work of config.works) {
    work.renderables2D = {
      screenImages: work.formConfigs.map(formConfig => new ScreenImage(parent, formConfig.config2D))
    }
  }
}

const createRenderables3D = (parent, config, resources) => {
  // TODO: improve this - put sceneryGroup inside the config somewhere
  const sceneryGroup = new Group()
  sceneryGroup.name = SCENERY_GROUP_NAME
  config.config3D.scenery.forEach(sceneryItem => sceneryItem.create(sceneryGroup))
  parent.add(sceneryGroup)

  for (const work of config.works) {
    work.renderables3D = {
      // TODO: change shape of this
      screenImages: work.formConfigs.map(formConfig => new ScreenImage(parent, formConfig.config3D)),
      projectionEffects: work.formConfigs.map(formConfig => new ProjectionEffect(parent, formConfig.config3D, resources))
    }
  }
}

export class Installation {

  constructor(scene, resources, config) {
    this.config = config
    this.group2d = new Group()
    this.group3d = new Group()
    scene.add(this.group2d)
    scene.add(this.group3d)
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

  _createRenderables(resources) {
    createRenderables2D(this.group2d, this.config)
    createRenderables3D(this.group3d, this.config, resources)
  }

  showScenery() {
    const sceneryGroup = this.group3d.getObjectByName(SCENERY_GROUP_NAME)
    if (sceneryGroup) sceneryGroup.visible = true
  }

  hideScenery() {
    const sceneryGroup = this.group3d.getObjectByName(SCENERY_GROUP_NAME)
    if (sceneryGroup) sceneryGroup.visible = false
  }
}
