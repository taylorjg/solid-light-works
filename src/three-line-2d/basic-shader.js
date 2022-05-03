import { Color } from 'three'

export function basicShader(opt) {
  opt = opt || {}
  var thickness = typeof opt.thickness === 'number' ? opt.thickness : 0.1
  var opacity = typeof opt.opacity === 'number' ? opt.opacity : 1.0
  var diffuse = opt.diffuse !== null ? opt.diffuse : 0xffffff

  // remove to satisfy r73
  delete opt.thickness
  delete opt.opacity
  delete opt.diffuse
  delete opt.precision

  // https://stackoverflow.com/questions/42532545/add-clipping-to-three-shadermaterial

  var ret = {
    uniforms: {
      thickness: { type: 'f', value: thickness },
      opacity: { type: 'f', value: opacity },
      diffuse: { type: 'c', value: new Color(diffuse) }
    },
    vertexShader: [
      '#include <clipping_planes_pars_vertex>',
      'uniform float thickness;',
      'attribute float lineMiter;',
      'attribute vec2 lineNormal;',
      'void main() {',
      '#include <begin_vertex>',
      'float lineMiterClamped = clamp(lineMiter, -2.0, 2.0);',
      'vec3 pointPos = position.xyz + vec3(lineNormal * thickness / 2.0 * lineMiterClamped, 0.0);',
      // '#include <project_vertex>',
      'vec4 mvPosition = modelViewMatrix * vec4(pointPos, 1.0);',
      '#include <clipping_planes_vertex>',
      'gl_Position = projectionMatrix * modelViewMatrix * vec4(pointPos, 1.0);',
      '}'
    ].join('\n'),
    fragmentShader: [
      '#include <clipping_planes_pars_fragment>',
      'uniform vec3 diffuse;',
      'uniform float opacity;',
      'void main() {',
      '#include <clipping_planes_fragment>',
      'gl_FragColor = vec4(diffuse, opacity);',
      '}'
    ].join('\n'),
    ...opt
  }

  return ret
}
