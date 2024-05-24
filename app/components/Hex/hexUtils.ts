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
