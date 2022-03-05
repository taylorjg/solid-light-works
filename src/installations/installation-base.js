import * as THREE from 'three'
import { Mode } from '../mode'
import { ProjectionEffect } from '../projection-effect'
import { ScreenImage } from '../screen-image'
import * as C from '../constants'

const createRenderables2D = (scene, installation) => {
  const screenForms = installation.installationData2D.screenForms
  return {
    screenImages: screenForms.map(screenForm => new ScreenImage(scene, screenForm))
  }
}

const createRenderables3D = (scene, installation, resources) => {
  const screenForms = installation.installationData3D.screenForms
  const projectedForms = installation.installationData3D.projectedForms
  return {
    screenImages: screenForms.map(screenForm => new ScreenImage(scene, screenForm)),
    projectionEffects: projectedForms.map(projectedForm => new ProjectionEffect(scene, projectedForm, resources)),
    surfaces: createSurfaces(scene, installation)
  }
}

const createSurfaces = (scene, installation) => {

  const surfaces = []

  const { screen, leftWall, rightWall, floor } = installation.installationData3D

  if (screen) {
    const geometry = new THREE.PlaneGeometry(screen.width, screen.height)
    geometry.translate(0, screen.height / 2, 0)
    const material = new THREE.MeshBasicMaterial({
      color: 0xC0C0C0,
      transparent: true,
      opacity: 0.2
    })
    const mesh = new THREE.Mesh(geometry, material)
    scene.add(mesh)
    surfaces.push(mesh)
  }

  if (leftWall) {
    const geometry = new THREE.PlaneGeometry(leftWall.length, leftWall.height)
    geometry.rotateY(C.HALF_PI)
    geometry.translate(leftWall.distance, leftWall.height / 2, leftWall.length / 2)
    const material = new THREE.MeshBasicMaterial({
      color: 0xA0A0A0,
      transparent: true,
      opacity: 0.2
    })
    const mesh = new THREE.Mesh(geometry, material)
    scene.add(mesh)
    surfaces.push(mesh)
  }

  if (rightWall) {
    const geometry = new THREE.PlaneGeometry(rightWall.length, rightWall.height)
    geometry.rotateY(-C.HALF_PI)
    geometry.translate(rightWall.distance, rightWall.height / 2, rightWall.length / 2)
    const material = new THREE.MeshBasicMaterial({
      color: 0xE0E0E0,
      transparent: true,
      opacity: 0.5
    })
    const mesh = new THREE.Mesh(geometry, material)
    scene.add(mesh)
    surfaces.push(mesh)
  }

  if (floor) {
    const geometry = new THREE.PlaneGeometry(floor.width, floor.depth)
    geometry.rotateX(-C.HALF_PI)
    geometry.translate(0, 0, floor.depth / 2)
    const material = new THREE.MeshBasicMaterial({
      color: 0xD0D0D0,
      transparent: true,
      opacity: 0.2
    })
    const mesh = new THREE.Mesh(geometry, material)
    scene.add(mesh)
    surfaces.push(mesh)
  }

  return surfaces
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
