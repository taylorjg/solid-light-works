import { ProjectionEffect } from './projection-effect'
import { ScreenImage } from './screen-image'

export class Line {

  constructor(points, opacity = 1) {
    this._points = points
    this._opacity = opacity
  }

  get points() {
    return this._points
  }

  get opacity() {
    return this._opacity
  }
}

// struct Line {
//   let points: [simd_float2]
//   let opacity: Float
//   init(points: [simd_float2], opacity: Float = 1) {
//       self.points = points
//       self.opacity = opacity
//   }
// }

// struct ScreenForm {
//   let lines: [Line]
//   let transform: matrix_float4x4
// }

// struct ProjectedForm {
//   let lines: [Line]
//   let transform: matrix_float4x4
//   let projectorPosition: vector_float3
// }

// struct Screen {
//   let width: Float
//   let height: Float
// }

// struct Floor {
//   let width: Float
//   let depth: Float
// }

// struct LeftWall {
//   let length: Float
//   let height: Float
//   let distance: Float
// }

// struct CameraPose {
//   let position: simd_float3
//   let target: simd_float3
// }

// struct InstallationData2D {
//   let screenForms: [ScreenForm]
//   let cameraPose: CameraPose
// }

// struct InstallationData3D {
//   let screenForms: [ScreenForm]
//   let projectedForms: [ProjectedForm]
//   let cameraPoses: [CameraPose]
//   let screen: Screen?
//   let floor: Floor?
//   let leftWall: LeftWall?
// }

// protocol Installation {
//   func getInstallationData2D() -> InstallationData2D
//   func getInstallationData3D() -> InstallationData3D
// }

export class Projector {

  constructor(projectorPosition, screenForm, scene, hazeTexture, applyTransforms) {
    const lineCount = screenForm.shapeCount
    this.screenForm = screenForm
    this.screenImage = new ScreenImage(lineCount, scene, applyTransforms)
    this.projectionEffect = new ProjectionEffect(projectorPosition, lineCount, scene, hazeTexture, applyTransforms)
  }

  update() {
    const lines = this.screenForm.getLines()
    this.screenImage.update(lines)
    this.projectionEffect.update(lines)
  }

  destroy() {
    this.screenImage.destroy()
    this.projectionEffect.destroy()
  }

  toggleVertexNormals() {
    this.projectionEffect.toggleVertexNormals()
  }
}
