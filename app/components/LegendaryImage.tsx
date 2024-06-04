type Props = {
  systemId: number;
  radius: number;
};

export function LegendaryImage({ systemId, radius }: Props) {
  switch (systemId) {
    case 66:
      return (
        <image
          href="/hopesend.webp"
          x={-radius * 0.85}
          y={-radius * 0.85}
          width={radius * 1.75}
          height={radius * 1.75}
          style={{ imageRendering: "pixelated" }}
        />
      );

    case 240:
      return (
        <image
          href="/prism.png"
          x={-radius * 0.5}
          y={-radius * 0.5}
          width={radius}
          height={radius}
          style={{ imageRendering: "pixelated" }}
        />
      );

    case 65:
      return (
        <image
          href="/primor.png"
          x={-radius * 0.5}
          y={-radius * 0.5}
          width={radius}
          height={radius}
          style={{ imageRendering: "pixelated" }}
        />
      );
    default:
      return null;
  }
}

export function hasLegendaryImage(systemId: number): boolean {
  return [66, 240, 65].includes(systemId);
}
