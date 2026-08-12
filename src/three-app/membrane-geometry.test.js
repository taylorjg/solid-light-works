import { describe, expect, it } from "vitest";
import { Vector3 } from "three";
import { MembraneGeometry } from "./membrane-geometry";

const makeScreenPoints = (count) =>
  Array.from({ length: count }, (_, index) => ({
    x: Math.cos(index) * 2,
    y: Math.sin(index) * 2,
  }));

describe("MembraneGeometry", () => {
  const projector = new Vector3(0, 0, 10);

  it("places projector and screen rows at the expected positions", () => {
    const geometry = new MembraneGeometry({ maxNumPoints: 4 });
    const screenPoints = [
      { x: -1, y: 0 },
      { x: 0, y: 1 },
      { x: 1, y: 0 },
      { x: 0, y: -1 },
    ];

    geometry.update(projector, screenPoints);

    const positions = geometry.getAttribute("position").array;

    expect(positions[0]).toBeCloseTo(projector.x);
    expect(positions[1]).toBeCloseTo(projector.y);
    expect(positions[2]).toBeCloseTo(projector.z);

    const screenRowOffset = 4 * 3;
    expect(positions[screenRowOffset]).toBeCloseTo(-1);
    expect(positions[screenRowOffset + 1]).toBeCloseTo(0);
    expect(positions[screenRowOffset + 2]).toBeCloseTo(0);
  });

  it("produces unit-length normals", () => {
    const geometry = new MembraneGeometry({ maxNumPoints: 8 });
    geometry.update(projector, makeScreenPoints(8));

    const normals = geometry.getAttribute("normal").array;
    for (let i = 0; i < normals.length; i += 3) {
      const length = Math.hypot(normals[i], normals[i + 1], normals[i + 2]);
      expect(length).toBeCloseTo(1, 5);
    }
  });

  it("reuses buffers across updates", () => {
    const geometry = new MembraneGeometry({ maxNumPoints: 8 });
    geometry.update(projector, makeScreenPoints(8));
    const positionBuffer = geometry.getAttribute("position").array;
    const indexBuffer = geometry.getIndex().array;

    geometry.update(projector, makeScreenPoints(8));

    expect(geometry.getAttribute("position").array).toBe(positionBuffer);
    expect(geometry.getIndex().array).toBe(indexBuffer);
  });
});
