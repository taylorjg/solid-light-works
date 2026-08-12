import {
  BufferGeometry,
  Float32BufferAttribute,
  Uint16BufferAttribute,
  Vector3,
} from "three";

const _edge1 = new Vector3();
const _edge2 = new Vector3();
const _faceNormal = new Vector3();

// ps (projectorPoints): array of Vector3 representing the small shape at the projector end of the membrane
// qs (screenPoints): array of Vector3 representing the large shape at the screen end of the membrane
// This class is heavily inspired by THREE.CylinderGeometry
export class MembraneGeometry extends BufferGeometry {
  constructor(options = {}) {
    super();

    this.type = "MembraneGeometry";

    this._numSegments = Math.floor(options.numSegments) || 1;
    this._capacity = 0;
    this._currentNumPoints = 0;

    const maxNumPoints = options.maxNumPoints;
    if (maxNumPoints >= 2) {
      this._ensureCapacity(maxNumPoints);
    }
  }

  _vertexCount(numPoints) {
    return (this._numSegments + 1) * numPoints;
  }

  _indexCount(numPoints) {
    return Math.max(0, numPoints - 1) * this._numSegments * 6;
  }

  _ensureCapacity(numPoints) {
    if (numPoints <= this._capacity) {
      return;
    }

    this._capacity = numPoints;

    const vertexCount = this._vertexCount(numPoints);
    const indexCount = this._indexCount(numPoints);

    this.setAttribute(
      "position",
      new Float32BufferAttribute(vertexCount * 3, 3)
    );
    this.setAttribute("normal", new Float32BufferAttribute(vertexCount * 3, 3));
    this.setAttribute("uv", new Float32BufferAttribute(vertexCount * 2, 2));
    this.setIndex(new Uint16BufferAttribute(indexCount, 1));
  }

  _writeIndices(numPoints) {
    if (numPoints < 2) {
      this.setDrawRange(0, 0);
      return;
    }

    const attrIndex = this.getIndex();
    const numSegments = this._numSegments;
    let index = 0;
    const indexArray = [];

    for (let y = 0; y <= numSegments; y++) {
      const indexRow = [];
      for (let x = 0; x < numPoints; x++) {
        indexRow.push(index++);
      }
      indexArray.push(indexRow);
    }

    let indexIndex = 0;
    for (let x = 0; x < numPoints - 1; x++) {
      for (let y = 0; y < numSegments; y++) {
        const a = indexArray[y][x];
        const b = indexArray[y + 1][x];
        const c = indexArray[y + 1][x + 1];
        const d = indexArray[y][x + 1];

        attrIndex.array[indexIndex++] = a;
        attrIndex.array[indexIndex++] = b;
        attrIndex.array[indexIndex++] = d;
        attrIndex.array[indexIndex++] = b;
        attrIndex.array[indexIndex++] = c;
        attrIndex.array[indexIndex++] = d;
      }
    }

    attrIndex.needsUpdate = true;
    this.setDrawRange(0, this._indexCount(numPoints));
  }

  _accumulateFaceNormal(
    normals,
    i0,
    i1,
    i2,
    px,
    py,
    pz,
    q0x,
    q0y,
    q0z,
    q1x,
    q1y,
    q1z
  ) {
    _edge1.set(q0x - px, q0y - py, q0z - pz);
    _edge2.set(q1x - px, q1y - py, q1z - pz);
    _faceNormal.crossVectors(_edge1, _edge2);

    const len = _faceNormal.length();
    if (len === 0) {
      return;
    }
    _faceNormal.multiplyScalar(1 / len);

    const i0i = i0 * 3;
    const i1i = i1 * 3;
    const i2i = i2 * 3;

    normals[i0i] += _faceNormal.x;
    normals[i0i + 1] += _faceNormal.y;
    normals[i0i + 2] += _faceNormal.z;

    normals[i1i] += _faceNormal.x;
    normals[i1i + 1] += _faceNormal.y;
    normals[i1i + 2] += _faceNormal.z;

    normals[i2i] += _faceNormal.x;
    normals[i2i + 1] += _faceNormal.y;
    normals[i2i + 2] += _faceNormal.z;
  }

  _normalizeNormals(normals, vertexCount) {
    for (let i = 0; i < vertexCount; i++) {
      const idx = i * 3;
      const nx = normals[idx];
      const ny = normals[idx + 1];
      const nz = normals[idx + 2];
      const len = Math.hypot(nx, ny, nz);
      if (len === 0) {
        normals[idx] = 0;
        normals[idx + 1] = 0;
        normals[idx + 2] = 1;
        continue;
      }
      normals[idx] = nx / len;
      normals[idx + 1] = ny / len;
      normals[idx + 2] = nz / len;
    }
  }

  update(projector, screenPoints) {
    const numPoints = screenPoints.length;
    if (numPoints === 0) {
      this.setDrawRange(0, 0);
      this._currentNumPoints = 0;
      return;
    }

    this._ensureCapacity(numPoints);

    if (numPoints !== this._currentNumPoints) {
      this._writeIndices(numPoints);
      this._currentNumPoints = numPoints;
    }

    const numSegments = this._numSegments;
    const px = projector.x;
    const py = projector.y;
    const pz = projector.z;

    const attrPosition = this.getAttribute("position");
    const attrNormal = this.getAttribute("normal");
    const attrUv = this.getAttribute("uv");
    const positions = attrPosition.array;
    const normals = attrNormal.array;
    const uvs = attrUv.array;

    normals.fill(0);

    let vertexIndex = 0;

    for (let y = 0; y <= numSegments; y++) {
      const v = y / numSegments;

      for (let x = 0; x < numPoints; x++) {
        const point = screenPoints[x];
        const u = x / numPoints;

        const sx = point.x;
        const sy = point.y;
        const sz = point.z ?? 0;

        const pi = vertexIndex * 3;
        positions[pi] = px + (sx - px) * v;
        positions[pi + 1] = py + (sy - py) * v;
        positions[pi + 2] = pz + (sz - pz) * v;

        const ui = vertexIndex * 2;
        uvs[ui] = u;
        uvs[ui + 1] = v;

        vertexIndex++;
      }
    }

    const rowStride = numPoints;

    for (let x = 0; x < numPoints - 1; x++) {
      for (let y = 0; y < numSegments; y++) {
        const a = y * rowStride + x;
        const b = (y + 1) * rowStride + x;
        const c = (y + 1) * rowStride + x + 1;
        const d = y * rowStride + x + 1;

        const bi = b * 3;
        const ci = c * 3;
        const q0x = positions[bi];
        const q0y = positions[bi + 1];
        const q0z = positions[bi + 2];
        const q1x = positions[ci];
        const q1y = positions[ci + 1];
        const q1z = positions[ci + 2];

        this._accumulateFaceNormal(
          normals,
          a,
          b,
          d,
          px,
          py,
          pz,
          q0x,
          q0y,
          q0z,
          q1x,
          q1y,
          q1z
        );
        this._accumulateFaceNormal(
          normals,
          b,
          c,
          d,
          px,
          py,
          pz,
          q0x,
          q0y,
          q0z,
          q1x,
          q1y,
          q1z
        );
      }
    }

    this._normalizeNormals(normals, this._vertexCount(numPoints));

    attrPosition.needsUpdate = true;
    attrNormal.needsUpdate = true;
    attrUv.needsUpdate = true;
  }
}
