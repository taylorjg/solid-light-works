import * as THREE from 'three'
import * as math from 'mathjs'
import * as C from './constants'

// https://uk.mathworks.com/help/matlab/ref/mldivide.html
const mldivide = (A, b) => {
  return math.multiply(math.inv(A), b)
}

// https://en.wikipedia.org/wiki/Newton%27s_method
// https://www.mathworks.com/matlabcentral/answers/318475-how-to-find-the-intersection-of-two-curves#answer_249066
//
// [start excerpt]
// You can use a modified version of the Newton-Raphson method for finding the intersection
// of two parameterized curves, provided the parameter functions defining the curves can be
// differentiated. For each intersection point the method requires an estimated value for
// each of the two parameters that would yield that point.
//
// Let x1 = f1(t1), y1 = g1(t1) define one curve and x2 = f2(t2), y2 = g2(t2) define the
// second curve. Let their respective derivative functions be called df1dt1, dg1dt1,
// df2dt2, and dg2dt2. Let t1e and t2e be the respective estimated values of t1 and t2
// for some intersection point. Then do this:
//
// t1 = t1e; t2 = t2e;
// tol = 1e-13 % Define acceptable error tolerance
// rpt = true; % Pass through while-loop at least once
// while rpt % Repeat while-loop until rpt is false
//   x1 = f1(t1); y1 = g1(t1);
//   x2 = f2(t2); y2 = g2(t2);
//   rpt = sqrt((x2-x1)^2+(y2-y1)^2)>=tol; % Euclidean distance apart
//   dt = [df1dt1(t1),-df2dt2(t2);dg1dt1(t1),-dg2dt2(t2)]\[x2-x1;y2-y1];
//   t1 = t1+dt(1); t2 = t2+dt(2);
// end
// x1 = f1(t1); y1 = g1(t1); % <-- These last two lines added later
// x2 = f2(t2); y2 = g2(t2);
// [end excerpt]

const TOLERANCE = 1e-3
const MAX_T1_ADJUSTMENT = C.QUARTER_PI
const MAX_T2_ADJUSTMENT = 2
const MAX_ITERATION_COUNT = 20

export const newtonsMethod = (f1, g1, f2, g2, df1dt1, dg1dt1, df2dt2, dg2dt2, t1e, t2e) => {
  let t1 = t1e
  let t2 = t2e
  let iterationCount = 1
  for (; ;) {
    const x1 = f1(t1)
    const y1 = g1(t1)
    const x2 = f2(t2)
    const y2 = g2(t2)
    const dx = x2 - x1
    const dy = y2 - y1
    const h = Math.hypot(dx, dy)
    // console.log(`t1: ${t1}; t2: ${t2}; x1: ${x1}; y1: ${y1}; x2: ${x2}; y2: ${y2}; h: ${h}`)
    if (h <= TOLERANCE) {
      // console.log('-'.repeat(80))
      break
    }
    if (iterationCount > MAX_ITERATION_COUNT) {
      throw new Error('[newtonsMethod] too many iterations!')
    }
    const A = [
      [df1dt1(t1), -df2dt2(t2)],
      [dg1dt1(t1), -dg2dt2(t2)]
    ]
    const b = [x2 - x1, y2 - y1]
    const dt = mldivide(A, b)
    const dt1 = THREE.MathUtils.clamp(dt[0], -MAX_T1_ADJUSTMENT, +MAX_T1_ADJUSTMENT)
    const dt2 = THREE.MathUtils.clamp(dt[1], -MAX_T2_ADJUSTMENT, +MAX_T2_ADJUSTMENT)
    t1 += dt1
    t2 += dt2
    iterationCount += 1
  }
  return { t1, t2 }
}
