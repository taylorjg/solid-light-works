import * as THREE from "three";
import * as C from "./constants";

// Find (t1, t2) such that curve 1 and curve 2 meet at the same point:
//
//   f1(t1) = f2(t2)
//   g1(t1) = g2(t2)
//
// Define the residual F = [f1 - f2, g1 - g2]. An intersection is F = 0.
//
// Newton-Raphson (https://en.wikipedia.org/wiki/Newton%27s_method) solves this
// by repeated linear approximation. Each iteration solves:
//
//   J · Δt = -F
//
// where J is the Jacobian matrix (https://en.wikipedia.org/wiki/Jacobian_matrix_and_determinant):
//
//   J = [ df1/dt1   -df2/dt2 ]
//       [ dg1/dt1   -dg2/dt2 ]
//
// Intuition: at the current (t1, t2), each curve is moving along its tangent.
// J describes how the gap F changes if we nudge t1 or t2. Solving J·Δt = -F
// asks "how much should each parameter move to cancel out the current gap?"
// We apply that step, re-evaluate, and repeat until the curves meet.
//
// Background on this approach for parametric curve intersection:
// https://www.mathworks.com/matlabcentral/answers/318475-how-to-find-the-intersection-of-two-curves

const DEFAULT_TOLERANCE = 1e-3;

// Domain-specific guards for our ellipse / travelling-wave geometry.
//
// t1 is typically an ellipse angle (radians). Limit each step to ±π/4 so a bad
// intermediate guess cannot jump to the far side of the ellipse in one go.
const MAX_T1_ADJUSTMENT = C.QUARTER_PI;

// t2 is typically a travelling-wave x-position along the form width. Its scale
// and units differ from t1, so it gets a separate, wider clamp (±2).
const MAX_T2_ADJUSTMENT = 2;

// Animation forms call this every frame with a warm guess from the previous
// frame, so 20 iterations is ample. Callers such as breath-iii and skirt-iii
// catch failures and skip the intersection for that frame.
const MAX_ITERATION_COUNT = 20;

// Solve [a b; c d] · [x y]ᵀ = [bx by]ᵀ
const solve2x2 = (a, b, c, d, bx, by) => {
  const det = a * d - b * c;
  if (Math.abs(det) < Number.EPSILON) {
    // Curves are locally parallel — the tangents do not span the gap direction.
    throw new Error("[newtonRaphsonMethod] singular Jacobian");
  }
  return {
    dt1: (bx * d - by * b) / det,
    dt2: (a * by - c * bx) / det,
  };
};

export const newtonRaphsonMethod = ({
  f1,
  g1,
  f2,
  g2,
  df1dt1,
  dg1dt1,
  df2dt2,
  dg2dt2,
  t1Guess,
  t2Guess,
  tolerance = DEFAULT_TOLERANCE,
}) => {
  let t1 = t1Guess;
  let t2 = t2Guess;

  for (let iteration = 1; ; iteration += 1) {
    const x1 = f1(t1);
    const y1 = g1(t1);
    const x2 = f2(t2);
    const y2 = g2(t2);

    const gapX = x1 - x2; // F₁
    const gapY = y1 - y2; // F₂
    const distance = Math.hypot(gapX, gapY);

    if (distance <= tolerance) {
      break;
    }
    if (iteration > MAX_ITERATION_COUNT) {
      throw new Error("[newtonRaphsonMethod] too many iterations!");
    }

    const { dt1, dt2 } = solve2x2(
      df1dt1(t1),
      -df2dt2(t2),
      dg1dt1(t1),
      -dg2dt2(t2),
      -gapX,
      -gapY
    );

    // Clamp the Newton step — see MAX_T1_ADJUSTMENT / MAX_T2_ADJUSTMENT above.
    t1 += THREE.MathUtils.clamp(dt1, -MAX_T1_ADJUSTMENT, MAX_T1_ADJUSTMENT);
    t2 += THREE.MathUtils.clamp(dt2, -MAX_T2_ADJUSTMENT, MAX_T2_ADJUSTMENT);
  }

  return { t1, t2 };
};
