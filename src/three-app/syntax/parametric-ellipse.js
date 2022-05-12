// https://en.wikipedia.org/wiki/Parametric_equation#Ellipse
// Parametric equation of an ellipse:
// x = a * cos(t)
// y = b * sin(t)

export const parametricEllipseX = rx =>
  t => rx * Math.cos(t)

export const parametricEllipseY = ry =>
  t => ry * Math.sin(t)

// The following online tool was very useful for finding the derivatives:
// https://www.symbolab.com/solver/derivative-calculator

export const parametricEllipseXDerivative = rx =>
  t => -rx * Math.sin(t)

export const parametricEllipseYDerivative = ry =>
  t => ry * Math.cos(t)
