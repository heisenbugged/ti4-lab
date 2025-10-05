export function EntroficScar({ radius }: { radius: number }) {
  return (
    <image
      href="/entropic.png"
      x={-radius * 1}
      y={-radius * 1}
      width={2 * radius * 1}
      height={2 * radius * 1}
      imageRendering="pixelated"
    />
  );
}
