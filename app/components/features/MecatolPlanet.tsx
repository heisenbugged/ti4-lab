export function MecatolPlanet({ radius }: { radius: number }) {
  return (
    <image
      href="/mecatol.png"
      x={-radius * 0.75}
      y={-radius * 0.75}
      width={1.5 * radius}
      height={1.5 * radius}
    />
  );
}
