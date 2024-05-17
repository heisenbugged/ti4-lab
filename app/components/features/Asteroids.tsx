export function Asteroids({ radius }: { radius: number }) {
  return (
    <image
      href="/asteroids.webp"
      x={-radius * 1}
      y={-radius * 1}
      width={2 * radius * 1}
      height={2 * radius * 1}
    />
  );
}
