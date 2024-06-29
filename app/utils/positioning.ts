/**
 * Hexagonal grids are often represented using three coordinates (q, r, s) where:
 * - col: The column coordinate, also known as the axial coordinate.
 * - row: The row coordinate, also known as the axial coordinate.
 * - s: The third coordinate, calculated as -col - row. In a valid hexagonal grid, col + row + s should always equal zero.
 *
 * These coordinates are used to ensure that the hexagons are arranged in a proper hexagonal pattern.
 *
 * The calculation of x and y positions for each hexagon is based on these coordinates:
 * - x = (radius * 3/2 + gap) * q
 * - y = (hexHeight + gap) * (r + q/2)
 *
 * This ensures that each hexagon is correctly spaced relative to its neighbors, including the specified gap.
 */
export const getHexPositions = (
  n: number, // number of circles
  r: number, // radius of hexagon
  gap: number,
) => {
  const positions = [];
  for (let col = -n; col <= n; col++) {
    for (let row = -n; row <= n; row++) {
      const s = -col - row;
      // The condition ensures we are within the bounds of a hexagon grid
      if (Math.abs(s) <= n) {
        positions.push(getHexPosition(col, row, r, gap));
      }
    }
  }
  return positions;
};

export const getHexPosition = (
  col: number, // column coordinate
  row: number, // row coordinate
  radius: number,
  gap: number,
) => {
  const hexHeight = calcHexHeight(radius);
  const x = ((radius * 3) / 2 + gap) * col;
  const y = (hexHeight + gap) * (row + col / 2);
  return { x, y };
};

export const calcHexHeight = (r: number) => Math.sqrt(3) * r;

/**
 * Given a viewport width and height, calculate the maximum radius for a hexagon
 * grid with n concentric circles.
 *
 */
export const calculateMaxHexRadius = (
  concentricCircles: number, // number of concentric circles
  width: number,
  height: number,
  gap: number,
) => {
  const radiusFromWidth = calculateMaxHexWidthRadius(
    concentricCircles,
    width,
    gap,
  );
  const numTiles = concentricCircles * 2 + 1;
  // a tile height is radius * sqrt(3)
  // so total height = numTiles * radius * sqrt(3)
  // solving for r, we get: r = height / (numTiles * sqrt(3))
  // Adjust effective height to account for gaps between hexagons
  const effectiveHeight = height - (numTiles - 1) * gap;
  const radiusFromHeight = effectiveHeight / (numTiles * Math.sqrt(3));

  return Math.min(radiusFromWidth, radiusFromHeight);
};

export const calculateMaxHexWidthRadius = (
  concentricCircles: number, // number of concentric circles
  width: number,
  gap: number,
) => {
  // There are 2n + 1 hexagons in each row
  // The width of each hexagon is 2r
  // The overlap between two hexagons is r
  // Thus the total allowed width is:
  //   width = (2n + 1) * 2r - r * n
  //   width = (2n + 1) * r(2 - n)
  // Solving for r, we get: r = width / (numTiles * 2 - n)
  const numTiles = concentricCircles * 2 + 1;
  // Adjust effective width to account for gaps between hexagons
  const effectiveWidth = width - (numTiles - 1) * gap;
  return effectiveWidth / (numTiles * 2 - concentricCircles);
};

/**
 *
 * For a given 'width', calculate the height of the map bounding box.
 * Where it cannot exceed 'maxHeight'.
 */
export function getBoundedMapHeight(
  width: number,
  maxHeight: number,
  concentricCircles: number = 4,
) {
  const numVerticalTiles = concentricCircles * 2 + 1;
  const numGaps = numVerticalTiles - 1;
  const gap = 6;
  // Calculate preliminary height and radius bounded by width.
  const initialRadius = calculateMaxHexWidthRadius(
    concentricCircles,
    width,
    gap,
  );
  const initialHeight =
    numVerticalTiles * calcHexHeight(initialRadius) + numGaps * gap;

  // Once preliminary height has been calculated.
  // we impose a maximum height (so that the map does not overflow)
  // and then recalculate the radius based on the new height.
  const height = Math.min(initialHeight, maxHeight);
  const newRadius = calculateMaxHexRadius(
    concentricCircles,
    width,
    height,
    gap,
  );
  const newHeight = numVerticalTiles * calcHexHeight(newRadius) + numGaps * gap;
  return newHeight;
}

export const calculateConcentricCircles = (length: number) => {
  if (length > 37) return 4;
  return 3;
};
