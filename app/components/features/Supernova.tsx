export function Supernova({ radius }: { radius: number }) {
  return (
    <image
      href="/supernova.webp"
      x={-radius * 0.9}
      y={-radius * 0.9}
      width={2 * radius * 0.9}
      height={2 * radius * 0.9}
      imageRendering="pixelated"
    />
  );
}
