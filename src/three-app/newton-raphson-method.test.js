import { describe, expect, it } from "vitest";
import { newtonRaphsonMethod } from "./newton-raphson-method";

describe("newtonRaphsonMethod", () => {
  const circleX = (t) => Math.cos(t);
  const circleY = (t) => Math.sin(t);
  const circleXd = (t) => -Math.sin(t);
  const circleYd = (t) => Math.cos(t);

  const lineX = (s) => s;
  const lineY = () => 0;
  const lineXd = () => 1;
  const lineYd = () => 0;

  const circleAndLine = {
    f1: circleX,
    g1: circleY,
    f2: lineX,
    g2: lineY,
    df1dt1: circleXd,
    dg1dt1: circleYd,
    df2dt2: lineXd,
    dg2dt2: lineYd,
  };

  it("finds the intersection of a unit circle and the x-axis", () => {
    const { t1, t2 } = newtonRaphsonMethod({
      ...circleAndLine,
      t1Guess: 0.5,
      t2Guess: 0.5,
    });

    expect(circleX(t1)).toBeCloseTo(lineX(t2), 5);
    expect(circleY(t1)).toBeCloseTo(lineY(t2), 5);
    expect(t1).toBeCloseTo(0, 5);
    expect(t2).toBeCloseTo(1, 5);
  });

  it("returns immediately when the initial guess is already at an intersection", () => {
    const { t1, t2 } = newtonRaphsonMethod({
      ...circleAndLine,
      t1Guess: 0,
      t2Guess: 1,
    });

    expect(t1).toBe(0);
    expect(t2).toBe(1);
  });

  it("finds a second intersection on the opposite side of the circle", () => {
    const { t1, t2 } = newtonRaphsonMethod({
      ...circleAndLine,
      t1Guess: Math.PI - 0.5,
      t2Guess: -0.5,
    });

    expect(circleX(t1)).toBeCloseTo(lineX(t2), 5);
    expect(circleY(t1)).toBeCloseTo(lineY(t2), 5);
    expect(t1).toBeCloseTo(Math.PI, 5);
    expect(t2).toBeCloseTo(-1, 5);
  });

  it("respects a custom tolerance", () => {
    const { t1, t2 } = newtonRaphsonMethod({
      ...circleAndLine,
      t1Guess: 0.5,
      t2Guess: 0.5,
      tolerance: 1e-6,
    });

    const distance = Math.hypot(
      circleX(t1) - lineX(t2),
      circleY(t1) - lineY(t2)
    );
    expect(distance).toBeLessThanOrEqual(1e-6);
  });

  it("throws when curves do not converge within the iteration limit", () => {
    const parabolaX = (t) => t;
    const parabolaY = (t) => t * t;
    const parabolaXd = () => 1;
    const parabolaYd = (t) => 2 * t;

    const belowLineX = (s) => s;
    const belowLineY = () => -5;
    const belowLineXd = () => 1;
    const belowLineYd = () => 0;

    expect(() =>
      newtonRaphsonMethod({
        f1: parabolaX,
        g1: parabolaY,
        f2: belowLineX,
        g2: belowLineY,
        df1dt1: parabolaXd,
        dg1dt1: parabolaYd,
        df2dt2: belowLineXd,
        dg2dt2: belowLineYd,
        t1Guess: 1,
        t2Guess: 1,
      })
    ).toThrow("[newtonRaphsonMethod] too many iterations!");
  });
});
