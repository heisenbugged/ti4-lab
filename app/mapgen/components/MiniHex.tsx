import { hexVertices } from "~/components/Hex/hexUtils";

type Props = {
  color: string;
};

export function MiniHex({ color }: Props) {
  const radius = 8;
  const points = hexVertices(radius);
  const pointsString = points.map((point) => `${point.x},${point.y}`).join(" ");

  return (
    <svg
      width={radius * 2}
      height={radius * 2}
      viewBox={`-${radius} -${radius} ${radius * 2} ${radius * 2}`}
      style={{ display: "block" }}
    >
      <polygon points={pointsString} fill={color} />
    </svg>
  );
}
