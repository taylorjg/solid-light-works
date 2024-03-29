import * as THREE from 'three'

export const sum = xs =>
  xs.reduce((acc, x) => acc + x, 0)

export const sumBy = (xs, selector) =>
  sum(xs.map(selector))

export const range = n =>
  Array.from(Array(n).keys())

export const reverse = xs =>
  xs.reverse()

export const bestBy = (xs, valueFn, comparisonFn) => {
  const seed = {
    currentIndex: -1,
    currentBestValue: undefined
  }

  const finalAcc = xs.reduce((acc, x, index) => {
    const value = valueFn(x)
    if (acc.currentIndex < 0 || comparisonFn(value, acc.currentBestValue)) {
      return {
        currentIndex: index,
        currentBestValue: value
      }
    }
    return acc
  }, seed)

  return finalAcc.currentIndex >= 0 ? xs[finalAcc.currentIndex] : undefined
}

export const minBy = (xs, valueFn) =>
  bestBy(xs, valueFn, (value, currentBestValue) => value < currentBestValue)

export const maxBy = (xs, valueFn) =>
  bestBy(xs, valueFn, (value, currentBestValue) => value > currentBestValue)

export const vectorsAsArrays = vectors =>
  vectors.map(vector => vector.toArray())

export const vec2sToVec3s = (vec2s, z = 0) =>
  vec2s.map(({ x, y }) => new THREE.Vector3(x, y, z))

export const loadTexture = url => {
  const textureLoader = new THREE.TextureLoader()
  return textureLoader.loadAsync(url)
}

export const disposeMesh = mesh => {
  mesh.removeFromParent()
  mesh.geometry.dispose()
  mesh.material.dispose()
}

export const last = xs => xs[xs.length - 1]

export const concatAll = xss => [].concat(...xss)

export const combinePoints = (...setsOfPoints) => {
  const [firstSetOfPoints, ...remainingSetsOfPoints] = setsOfPoints
  const segments = [firstSetOfPoints]
  for (const setOfPoints of remainingSetsOfPoints) {
    const lastSegment = last(segments)
    const lastPoint = last(lastSegment)
    const distanceToFirst = lastPoint.distanceToSquared(setOfPoints[0])
    const distanceToLast = lastPoint.distanceToSquared(last(setOfPoints))
    if (distanceToFirst < distanceToLast) {
      segments.push(setOfPoints.slice(1))
    } else {
      segments.push(setOfPoints.slice().reverse().slice(1))
    }
  }
  const combinedSegments = concatAll(segments)
  return combinedSegments
}

export const isClose = (a, b, tolerance = 0.01) =>
  Math.abs(a - b) <= tolerance

export const isCloseVec = (a, b, tolerance) => {
  const componentsA = a.toArray()
  const componentsB = b.toArray()
  const length = Math.min(componentsA.length, componentsB.length)
  return range(length).every(index => isClose(componentsA[index], componentsB[index], tolerance))
}
