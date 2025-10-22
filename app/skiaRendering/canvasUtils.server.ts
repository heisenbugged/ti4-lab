/**
 * Execute a function with save/restore context wrapper
 */
export function withContext(
  ctx: CanvasRenderingContext2D,
  fn: () => void,
): void {
  ctx.save();
  fn();
  ctx.restore();
}

/**
 * Draw a centered image at the given position
 */
export function drawCenteredImage(
  ctx: CanvasRenderingContext2D,
  image: any,
  centerX: number,
  centerY: number,
  size: number,
): void {
  ctx.drawImage(image, centerX - size / 2, centerY - size / 2, size, size);
}

/**
 * Draw a rotated image at the given position
 */
export function drawRotatedImage(
  ctx: CanvasRenderingContext2D,
  image: any,
  centerX: number,
  centerY: number,
  size: number,
  rotationDegrees: number,
): void {
  withContext(ctx, () => {
    ctx.translate(centerX, centerY);
    ctx.rotate((rotationDegrees * Math.PI) / 180);
    ctx.drawImage(image, -size / 2, -size / 2, size, size);
  });
}

/**
 * Set common text styling properties
 */
export function setTextStyle(
  ctx: CanvasRenderingContext2D,
  options: {
    font?: string;
    fillStyle?: string;
    textAlign?: CanvasTextAlign;
    textBaseline?: CanvasTextBaseline;
  },
): void {
  if (options.font) ctx.font = options.font;
  if (options.fillStyle) ctx.fillStyle = options.fillStyle;
  if (options.textAlign) ctx.textAlign = options.textAlign;
  if (options.textBaseline) ctx.textBaseline = options.textBaseline;
}

/**
 * Measure and truncate text to fit within a maximum width
 */
export function measureAndTruncateText(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number,
  fontSize: number,
  smallerFontSize: number,
  fontFamily: string,
): { displayText: string; fontSize: number; width: number } {
  let currentFontSize = fontSize;
  ctx.font = `bold small-caps ${currentFontSize}px ${fontFamily}`;

  let displayText = text;
  let textMetrics = ctx.measureText(displayText);
  let textWidth = textMetrics.width;

  // If text is too long, try reducing font size first
  if (textWidth > maxWidth) {
    currentFontSize = smallerFontSize;
    ctx.font = `bold small-caps ${currentFontSize}px ${fontFamily}`;
    textMetrics = ctx.measureText(displayText);
    textWidth = textMetrics.width;

    // If still too long, truncate with ellipsis
    if (textWidth > maxWidth) {
      let truncated = displayText;
      while (textWidth > maxWidth && truncated.length > 3) {
        truncated = truncated.slice(0, -1);
        const testName = truncated + "...";
        textMetrics = ctx.measureText(testName);
        textWidth = textMetrics.width;
        displayText = testName;
      }
    }
  }

  return { displayText, fontSize: currentFontSize, width: textWidth };
}

/**
 * Draw a rounded rectangle (pill shape)
 */
export function drawRoundedRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number,
  fillStyle: string,
): void {
  ctx.fillStyle = fillStyle;
  ctx.beginPath();
  ctx.roundRect(x, y, width, height, radius);
  ctx.fill();
}
