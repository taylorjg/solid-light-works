import * as THREE from "three";
import { MembraneGeometry } from "./membrane-geometry";
import { VertexNormalsHelper } from "three/examples/jsm/helpers/VertexNormalsHelper.js";
import vertexShader from "@app/three-app/shaders/vertex-shader.glsl?raw";
import fragmentShader from "@app/three-app/shaders/fragment-shader.glsl?raw";
import * as U from "./utils";

export class ProjectionEffect {
  constructor(parent, config, formBoundary, resources) {
    this._parent = parent;
    this._config = config;
    this._formBoundary = formBoundary;
    this._resources = resources;
    this._meshes = undefined;
    this._meshHelpers = undefined;
    this._visibleHelpers = false;
    this._formBoundaryClippingPlanes = undefined;
    this._lineClippingPlanes = undefined;
    this._meshClippingPlaneArrays = undefined;
    this._worldProjector = new THREE.Vector3();
    this._scratch = {
      zaxis: new THREE.Vector3(0, 0, 1),
      tangent: new THREE.Vector3(),
      point1: new THREE.Vector3(),
      point2: new THREE.Vector3(),
      projector: new THREE.Vector3(),
      savedNormal: new THREE.Vector3(),
    };
  }

  _createMesh(maxNumPoints) {
    const geometryOptions = maxNumPoints >= 2 ? { maxNumPoints } : undefined;
    const geometry = new MembraneGeometry(geometryOptions);
    const beamLength =
      this._config.beamLength ?? this._config.projectorPosition.length();
    // Membrane shading: see fragment-shader.glsl (Henyey–Greenstein + edge term).
    const material = new THREE.ShaderMaterial({
      uniforms: {
        hazeTexture: {
          value: this._resources.hazeTexture,
        },
        projectorPosition: {
          value: new THREE.Vector3(),
        },
        beamLength: {
          value: beamLength,
        },
        scatterG: {
          // HG asymmetry g: forward scatter in haze (0 = isotropic, ~0.85 = strong).
          value: 0.72,
        },
        edgeMix: {
          // 0 = rim/edge only, 1 = phase only.
          value: 0.35,
        },
        falloffK: {
          // exp(-falloffK * t^2) along beam; t = dist / beamLength.
          value: 0.5,
        },
        glareStrength: {
          // Suppress white-out when viewing back along beam toward projector.
          value: 0.55,
        },
        opacity: {
          value: 1,
        },
      },
      vertexShader,
      fragmentShader,
      side: THREE.DoubleSide,
      blending: THREE.AdditiveBlending,
      transparent: true,
      depthWrite: false,
    });
    const mesh = new THREE.Mesh(geometry, material);
    mesh.applyMatrix4(this._config.transform);
    this._parent.add(mesh);
    return mesh;
  }

  _createMeshes(lineCount, lines) {
    this._destroyMeshHelpers();
    this._destroyMeshes();
    this._lineClippingPlanes = undefined;
    this._meshClippingPlaneArrays = undefined;
    this._meshes = U.range(lineCount).map((index) =>
      this._createMesh(lines[index]?.maxNumPoints)
    );
  }

  _destroyMeshes() {
    if (this._meshes) {
      this._meshes.forEach(U.disposeMesh);
      this._meshes = undefined;
    }
  }

  _createMeshHelpers() {
    if (this._meshes && !this._meshHelpers) {
      this._meshHelpers = this._meshes.map(
        (mesh) => new VertexNormalsHelper(mesh, 0.2, 0x0000ff)
      );
      this._meshHelpers.forEach((meshHelper) => this._parent.add(meshHelper));
    }
  }

  _destroyMeshHelpers() {
    if (this._meshHelpers) {
      this._meshHelpers.forEach(U.disposeMesh);
      this._meshHelpers = undefined;
    }
  }

  _tiltClippingPlane(newClippingPlane, oldClippingPlane) {
    const { zaxis, tangent, point1, point2, projector, savedNormal } =
      this._scratch;

    oldClippingPlane.coplanarPoint(point1);
    tangent.crossVectors(zaxis, oldClippingPlane.normal).normalize();
    point2.copy(point1).add(tangent);

    point1.applyMatrix4(this._config.transform);
    point2.applyMatrix4(this._config.transform);
    projector
      .copy(this._config.projectorPosition)
      .applyMatrix4(this._config.transform);

    savedNormal.copy(newClippingPlane.normal);
    newClippingPlane.setFromCoplanarPoints(point1, point2, projector);

    if (savedNormal.dot(newClippingPlane.normal) < 0) {
      newClippingPlane.negate();
    }
  }

  _getLineClippingPlanes(meshIndex, line) {
    const source = line.clippingPlanes;
    if (!source?.length) {
      return [];
    }

    if (!this._lineClippingPlanes) {
      this._lineClippingPlanes = [];
    }

    let pool = this._lineClippingPlanes[meshIndex];
    if (!pool || pool.length < source.length) {
      pool = Array.from({ length: source.length }, () => new THREE.Plane());
      this._lineClippingPlanes[meshIndex] = pool;
    }

    const active = [];
    for (let i = 0; i < source.length; i++) {
      pool[i].copy(source[i]).applyMatrix4(this._config.transform);
      this._tiltClippingPlane(pool[i], source[i]);
      active.push(pool[i]);
    }

    return active;
  }

  _getMeshClippingPlaneArray(meshIndex) {
    if (!this._meshClippingPlaneArrays) {
      this._meshClippingPlaneArrays = [];
    }
    if (!this._meshClippingPlaneArrays[meshIndex]) {
      this._meshClippingPlaneArrays[meshIndex] = [];
    }
    const clippingPlanes = this._meshClippingPlaneArrays[meshIndex];
    clippingPlanes.length = 0;
    return clippingPlanes;
  }

  update(footprintData) {
    const { lines } = footprintData;
    const lineCount = lines.length;
    const meshCount = this._meshes?.length ?? 0;

    if (meshCount !== lineCount) {
      this._createMeshes(lineCount, lines);
    }

    this._worldProjector
      .copy(this._config.projectorPosition)
      .applyMatrix4(this._config.transform);
    const beamLength =
      this._config.beamLength ?? this._config.projectorPosition.length();

    this._meshes.forEach((mesh, index) => {
      const line = lines[index];
      mesh.geometry.update(this._config.projectorPosition, line.points);
      mesh.material.uniforms.projectorPosition.value.copy(this._worldProjector);
      mesh.material.uniforms.beamLength.value = beamLength;
      mesh.material.uniforms.opacity.value = line.opacity;

      const clippingPlanes = this._getMeshClippingPlaneArray(index);

      if (line.clipToFormBoundary) {
        this._ensureFormBoundaryClippingPlanes();
        clippingPlanes.push(...this._formBoundaryClippingPlanes);
      }

      const lineClippingPlanes = this._getLineClippingPlanes(index, line);
      if (lineClippingPlanes.length) {
        clippingPlanes.push(...lineClippingPlanes);
      }

      if (clippingPlanes.length) {
        mesh.material.clippingPlanes = clippingPlanes;
        mesh.material.clipping = true;
      } else {
        mesh.material.clippingPlanes = null;
        mesh.material.clipping = false;
      }
    });

    if (this._visibleHelpers) {
      if (!this._meshHelpers) {
        this._createMeshHelpers();
      }
      this._meshHelpers.forEach((meshHelper, index) => {
        const mesh = this._meshes[index];
        const clippingPlanes = mesh.material.clippingPlanes ?? [];
        const formBoundaryClippingPlanes =
          this._formBoundaryClippingPlanes ?? [];
        for (const clippingPlane of clippingPlanes) {
          if (formBoundaryClippingPlanes.indexOf(clippingPlane) < 0) {
            meshHelper.material.clippingPlanes = mesh.material.clippingPlanes;
          }
          meshHelper.material.clipping = mesh.material.clipping;
        }
        meshHelper.update();
      });
    } else {
      if (this._meshHelpers) {
        this._destroyMeshHelpers();
      }
    }
  }

  set showVertexNormals(value) {
    this._visibleHelpers = value;
  }

  _ensureFormBoundaryClippingPlanes() {
    if (!this._formBoundaryClippingPlanes) {
      const makeClippingPlane = (x, y, constant) => {
        const normal = new THREE.Vector3(x, y, 0);
        const oldClippingPlane = new THREE.Plane(normal, constant);
        const newClippingPlane = new THREE.Plane();
        newClippingPlane
          .copy(oldClippingPlane)
          .applyMatrix4(this._config.transform);
        this._tiltClippingPlane(newClippingPlane, oldClippingPlane);
        return newClippingPlane;
      };
      const { width, height } = this._formBoundary;
      const topClippingPlane = makeClippingPlane(0, -1, height / 2);
      const bottomClippingPlane = makeClippingPlane(0, 1, height / 2);
      const leftClippingPlane = makeClippingPlane(1, 0, width / 2);
      const rightClippingPlane = makeClippingPlane(-1, 0, width / 2);
      this._formBoundaryClippingPlanes = [
        topClippingPlane,
        bottomClippingPlane,
        leftClippingPlane,
        rightClippingPlane,
      ];
    }
  }
}
