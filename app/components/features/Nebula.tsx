export function Nebula({ radius }: { radius: number }) {
  return (
    <image
      href="/nebula.webp"
      x={-radius * 1.25}
      y={-radius * 1.25}
      width={2 * radius * 1.25}
      height={2 * radius * 1.25}
    />
  );
}
