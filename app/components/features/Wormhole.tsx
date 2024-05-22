import { Title, alpha, darken, lighten } from "@mantine/core";
import { Wormhole as TWormhole } from "~/types";

const wormholeColor: Record<TWormhole, string> = {
  ALPHA: "var(--mantine-color-orange-8)",
  BETA: "var(--mantine-color-green-8)",
  DELTA: "var(--mantine-color-blue-8)",
};

export function Wormhole({ wormhole }: { wormhole: TWormhole }) {
  return (
    <div
      style={{
        borderRadius: 99,
        padding: "2px 8px",
        border: `4px solid ${wormholeColor[wormhole]}`,
        background: lighten(wormholeColor[wormhole], 0.3),
      }}
    >
      <Title order={3} c="white">
        {wormhole.slice(0, 1)}
      </Title>
    </div>
  );
}
