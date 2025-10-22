type Point = { x: number; y: number };

/**
 * Generate vertices for a flat-topped hexagon
 */
export function generateHexVertices(
  centerX: number,
  centerY: number,
  radius: number,
): Point[] {
  return Array.from({ length: 6 }).map((_, i) => {
    const angle = (i * Math.PI) / 3;
    return {
      x: centerX + radius * Math.cos(angle),
      y: centerY + radius * Math.sin(angle),
    };
  });
}

/**
 * Create a hexagon path on the canvas context
 */
export function createHexPath(
  ctx: CanvasRenderingContext2D,
  vertices: Point[],
): void {
  ctx.beginPath();
  ctx.moveTo(vertices[0].x, vertices[0].y);
  for (let i = 1; i < vertices.length; i++) {
    ctx.lineTo(vertices[i].x, vertices[i].y);
  }
  ctx.closePath();
}

/**
 * Set up hex clipping for the context
 */
export function clipToHex(
  ctx: CanvasRenderingContext2D,
  centerX: number,
  centerY: number,
  radius: number,
): void {
  const vertices = generateHexVertices(centerX, centerY, radius);
  createHexPath(ctx, vertices);
  ctx.clip();
}

/**
 * Interpolate between two points
 */
export function interpolatePoint(a: Point, b: Point, t: number): Point {
  return {
    x: (1 - t) * a.x + t * b.x,
    y: (1 - t) * a.y + t * b.y,
  };
}
