import { describe, expect, it } from "vitest";
import { newtonRaphsonMethod } from "./newton-raphson-method";

describe("newtonRaphsonMethod", () => {
  const circle = {
    x: (t) => Math.cos(t),
    y: (t) => Math.sin(t),
    dx: (t) => -Math.sin(t),
    dy: (t) => Math.cos(t),
  };

  const line = {
    x: (s) => s,
    y: () => 0,
    dx: () => 1,
    dy: () => 0,
  };

  it("finds the intersection of a unit circle and the x-axis", () => {
    const { t1, t2 } = newtonRaphsonMethod({
      curve1: circle,
      curve2: line,
      t1Guess: 0.5,
      t2Guess: 0.5,
    });

    expect(circle.x(t1)).toBeCloseTo(line.x(t2), 5);
    expect(circle.y(t1)).toBeCloseTo(line.y(t2), 5);
    expect(t1).toBeCloseTo(0, 5);
    expect(t2).toBeCloseTo(1, 5);
  });

  it("returns immediately when the initial guess is already at an intersection", () => {
    const { t1, t2 } = newtonRaphsonMethod({
      curve1: circle,
      curve2: line,
      t1Guess: 0,
      t2Guess: 1,
    });

    expect(t1).toBe(0);
    expect(t2).toBe(1);
  });

  it("finds a second intersection on the opposite side of the circle", () => {
    const { t1, t2 } = newtonRaphsonMethod({
      curve1: circle,
      curve2: line,
      t1Guess: Math.PI - 0.5,
      t2Guess: -0.5,
    });

    expect(circle.x(t1)).toBeCloseTo(line.x(t2), 5);
    expect(circle.y(t1)).toBeCloseTo(line.y(t2), 5);
    expect(t1).toBeCloseTo(Math.PI, 5);
    expect(t2).toBeCloseTo(-1, 5);
  });

  it("respects a custom tolerance", () => {
    const { t1, t2 } = newtonRaphsonMethod({
      curve1: circle,
      curve2: line,
      t1Guess: 0.5,
      t2Guess: 0.5,
      tolerance: 1e-6,
    });

    const distance = Math.hypot(
      circle.x(t1) - line.x(t2),
      circle.y(t1) - line.y(t2)
    );
    expect(distance).toBeLessThanOrEqual(1e-6);
  });

  it("throws when curves do not converge within the iteration limit", () => {
    expect(() =>
      newtonRaphsonMethod({
        curve1: {
          x: (t) => t,
          y: (t) => t * t,
          dx: () => 1,
          dy: (t) => 2 * t,
        },
        curve2: {
          x: (s) => s,
          y: () => -5,
          dx: () => 1,
          dy: () => 0,
        },
        t1Guess: 1,
        t2Guess: 1,
      })
    ).toThrow("[newtonRaphsonMethod] too many iterations!");
  });

  it("throws when the Jacobian is singular", () => {
    expect(() =>
      newtonRaphsonMethod({
        curve1: circle,
        curve2: {
          x: (t) => Math.cos(t) + 4,
          y: (t) => Math.sin(t),
          dx: circle.dx,
          dy: circle.dy,
        },
        t1Guess: 0,
        t2Guess: 0,
      })
    ).toThrow("[newtonRaphsonMethod] singular Jacobian");
  });
});
