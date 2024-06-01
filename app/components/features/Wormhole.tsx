import { Text, lighten } from "@mantine/core";
import { Wormhole as TWormhole } from "~/types";

const wormholeColor: Record<TWormhole, string> = {
  ALPHA: "var(--mantine-color-orange-8)",
  BETA: "var(--mantine-color-green-8)",
  DELTA: "var(--mantine-color-blue-8)",
  GAMMA: "var(--mantine-color-purple-8)",
};

type Props = {
  wormhole: TWormhole;
  size?: number;
  fontSize?: number;
};

export function Wormhole({ wormhole, size = 40, fontSize = 18 }: Props) {
  return (
    <div
      style={{
        borderRadius: 99,
        height: size,
        width: size,
        border: `4px solid ${wormholeColor[wormhole]}`,
        background: lighten(wormholeColor[wormhole], 0.3),
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Text ff="heading" fw="bold" size={`${fontSize}px`} c="white">
        {wormhole.slice(0, 1)}
      </Text>
    </div>
  );
}
