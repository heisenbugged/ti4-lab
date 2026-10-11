import { PLANET_RADIUS, PLANET_GAP } from "./constants";

export type ItemPosition = { x: number; y: number };

/**
 * Calculate positions for 1, 2, or 3 items in a hex tile
 */
export function calculateItemPositions(
  totalItems: number,
  centerX: number,
  centerY: number,
): ItemPosition[] {
  if (totalItems === 1) {
    // Single item: centered
    return [{ x: centerX, y: centerY }];
  } else if (totalItems === 2) {
    // Two items: side by side, centered as a row
    const totalWidth = PLANET_RADIUS * 2 * 2 + PLANET_GAP;
    const startX = centerX - totalWidth / 2 + PLANET_RADIUS;
    return [
      { x: startX, y: centerY },
      { x: startX + PLANET_RADIUS * 2 + PLANET_GAP, y: centerY },
    ];
  } else if (totalItems === 3) {
    // Three items: first row has 2 items (centered), second row has 1 item (centered)
    const rowGap = PLANET_RADIUS * 2 + PLANET_GAP;
    const firstRowY = centerY - rowGap / 2;
    const secondRowY = centerY + rowGap / 2;

    const totalWidth = PLANET_RADIUS * 2 * 2 + PLANET_GAP;
    const startX = centerX - totalWidth / 2 + PLANET_RADIUS;

    return [
      { x: startX, y: firstRowY },
      { x: startX + PLANET_RADIUS * 2 + PLANET_GAP, y: firstRowY },
      { x: centerX, y: secondRowY },
    ];
  }

  return [];
}
