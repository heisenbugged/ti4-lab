import { SystemId } from "~/types";

type Props = {
  systemId: SystemId;
  radius: number;
};

export function LegendaryImage({ systemId, radius }: Props) {
  switch (systemId) {
    case "66":
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

    case "65":
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

    case "237":
      return (
        <image
          href="/silence.webp"
          x={-radius * 0.5}
          y={-radius * 0.5}
          width={radius}
          height={radius}
          style={{ imageRendering: "pixelated" }}
        />
      );
    case "240":
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
    case "253":
      return (
        <image
          href="/domna.webp"
          x={-radius * 0.5}
          y={-radius * 0.5}
          width={radius}
          height={radius}
          style={{ imageRendering: "pixelated" }}
        />
      );
    case "239":
      return (
        <image
          href="/tarrock.webp"
          x={-radius * 0.5}
          y={-radius * 0.5}
          width={radius}
          height={radius}
          style={{ imageRendering: "pixelated" }}
        />
      );
    case "238":
      return (
        <image
          href="/echo.webp"
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

export function hasLegendaryImage(systemId: SystemId): boolean {
  return ["66", "240", "65", "237", "253", "239", "238"].includes(systemId);
}
