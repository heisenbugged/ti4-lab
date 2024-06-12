export const hexVertices = (radius: number) =>
  Array.from({ length: 6 }).map((_, i) => {
    const angle = (i * Math.PI) / 3;
    return { x: radius * Math.cos(angle), y: radius * Math.sin(angle) };
  });

export function interpolatePoint(
  a: { x: number; y: number },
  b: { x: number; y: number },
  t: number,
) {
  const x = (1 - t) * a.x + t * b.x;
  const y = (1 - t) * a.y + t * b.y;
  return { x, y };
}

/**
 * Convert a list of hex 'points' (i.e. the pointy end of the hex)
 * to a list of points representing the sides of the hex.
 */
export const hexSides = (hexPoints: { x: number; y: number }[]) => [
  interpolatePoint(hexPoints[4], hexPoints[5], 0.5),
  interpolatePoint(hexPoints[5], hexPoints[0], 0.5),
  interpolatePoint(hexPoints[0], hexPoints[1], 0.5),
  interpolatePoint(hexPoints[1], hexPoints[2], 0.5),
  interpolatePoint(hexPoints[2], hexPoints[3], 0.5),
  interpolatePoint(hexPoints[3], hexPoints[4], 0.5),
];
