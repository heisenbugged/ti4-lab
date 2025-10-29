import { Text } from "@mantine/core";
import { hexVertices } from "~/components/Hex/hexUtils";

type Props = {
  value: number;
  size?: number;
  color?: string;
};

export function SmallNumberHex({ value, size = 20, color = "#1c7ed6" }: Props) {
  const radius = size / 2;
  const points = hexVertices(radius);
  const pointsString = points.map((p) => `${p.x},${p.y}`).join(" ");

  return (
    <div
      style={{
        position: "relative",
        width: size,
        height: size,
        display: "inline-block",
      }}
    >
      <svg
        width={size}
        height={size}
        viewBox={`-${radius} -${radius} ${size} ${size}`}
        style={{ display: "block" }}
      >
        <polygon points={pointsString} fill={color} />
      </svg>
      <Text
        fz="sm"
        fw="bold"
        c="white"
        style={{
          position: "absolute",
          left: "50%",
          top: "50%",
          transform: "translate(-50%, -55%)",
          lineHeight: 1,
        }}
      >
        {value}
      </Text>
    </div>
  );
}
