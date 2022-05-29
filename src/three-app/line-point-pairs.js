import { Vector2 } from 'three'
import getNormals from 'polyline-normals'

// path: [[x, y], [x, y], ...]
export const makeLinePointPairs = (path, closed, lineThickness) => {
  path = path || []
  const normals = getNormals(path, closed)

  if (closed) {
    path = path.slice()
    path.push(path[0])
    normals.push(normals[0])
  }

  const linePointPairs = []

  const halfLineThickness = lineThickness / 2

  path.forEach((point, index) => {
    const [px, py] = point
    const [[nx, ny], miter] = normals[index]
    const v = new Vector2(px, py)
    const n = new Vector2(nx, ny)
    const upperPoint = v.clone().add(n.clone().multiplyScalar(halfLineThickness * +miter))
    const lowerPoint = v.clone().add(n.clone().multiplyScalar(halfLineThickness * -miter))
    linePointPairs.push({ point, upperPoint, lowerPoint })
  })

  return linePointPairs
}
