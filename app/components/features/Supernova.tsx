export function Supernova({ radius }: { radius: number }) {
  return (
    <image
      href="/supernova.webp"
      x={-radius * 1}
      y={-radius * 1}
      width={2 * radius * 1}
      height={2 * radius * 1}
    />
  );
}
