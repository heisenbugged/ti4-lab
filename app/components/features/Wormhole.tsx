import { Text, darken, lighten } from "@mantine/core";
import { Wormhole as TWormhole } from "~/types";

const wormholeColor: Record<TWormhole, string> = {
  ALPHA: "var(--mantine-color-orange-6)",
  BETA: "var(--mantine-color-green-8)",
  DELTA: "var(--mantine-color-blue-8)",
  GAMMA: "var(--mantine-color-purple-8)",
};

type Props = {
  wormhole: TWormhole;
  size?: number;
  fontSize?: number;
};

export function Wormhole({ wormhole, size = 60, fontSize = 18 }: Props) {
  const swirlColor = wormholeColor[wormhole];
  if (size < 30) {
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

  return (
    <div
      style={{
        borderRadius: 99,
        height: size,
        width: size,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        position: "relative",
        background: "var(--mantine-color-spaceBlue-9)",
      }}
    >
      <div
        style={{
          position: "absolute",
          borderRadius: 99,
          height: size * 0.5,
          width: size * 0.5,
          background: wormholeColor[wormhole],
        }}
      />
      <svg viewBox="15 25 150 200" style={{ zIndex: 1 }}>
        <g>
          <path
            fill={swirlColor}
            strokeWidth="0"
            d="M28.86,135.49c0,2.2,3.12,2.05,3.12-0.05c0-23.44,18.8-51.71,52.05-51.71s45.41,34.77,38.04,50.59c-1.36,2.92,1.12,3.53,2.78,1.42c12.7-16.11,1.81-61.72-41.6-61.72C41.07,74.02,28.86,117.33,28.86,135.49z"
          />
          <path
            fill={swirlColor}
            strokeWidth="0"
            d="M83.87,64.83c-2.2,0-2.05,3.12,0.05,3.12c23.44,0,51.71,18.8,51.71,52.05s-34.77,45.41-50.59,38.04c-2.92-1.36-3.53,1.12-1.42,2.78c16.11,12.7,61.72,1.81,61.72-41.6C145.34,77.04,102.03,64.83,83.87,64.83z"
          />
          <path
            fill={swirlColor}
            strokeWidth="0"
            d="M153.91,120.05c0-2.2-3.12-2.05-3.12,0.05c0,23.44-18.8,51.71-52.05,51.71s-45.41-34.77-38.04-50.59c1.36-2.92-1.12-3.53-2.78-1.42c-12.7,16.11-1.81,61.72,41.6,61.72C141.7,181.52,153.91,138.21,153.91,120.05z"
          />
          <path
            fill={swirlColor}
            strokeWidth="0"
            d="M98.28,190.29c2.2,0,2.05-3.12-0.05-3.12c-23.44,0-51.71-18.8-51.71-52.05S81.28,89.71,97.1,97.08c2.92,1.36,3.53-1.12,1.42-2.78C82.41,81.6,36.8,92.49,36.8,135.9C36.8,178.09,80.11,190.29,98.28,190.29z"
          />

          {wormhole === "GAMMA" && (
            <path
              d="M80.31,104.99v5.19h6.02l10.28,26.17v17.96c0,0,5.3,0.42,7.89-2.18c0-2.8,0-15.78,0-15.78l-11.53-31.36H80.31z
       M109.39,104.99l-5.71,15.26l4.26,10.18l10.28-25.44H109.39z"
              fill="white"
              strokeWidth="0"
              transform="translate(-10, -4)"
            />
          )}

          {wormhole === "ALPHA" && (
            <path
              fill="white"
              strokeWidth="0"
              d="M95.58,115.66c0-5.92-0.88-6.2-8.74-6.2c-2.91,0-9.48,0-9.48,0v-5.57c0,0,5.33,0,17.93,0c7.55,0,8,7.65,8,10.38c0,2.73,0,15.37,0,15.37s-3.69,0-7.7,0c0-7.2-2.82-9.69-8.74-9.69s-6.35,4.09-6.35,7.17c0,4.45,0.57,9.23,6.35,9.23c5.12,0,16.01,0,16.01,0s0.05,1.47,0,5.62c-0.03,2.87,2.09,3.48,6.62,3.48c0,1.14,0,5.5,0,5.5s-2.75,0-6.62,0c-6.03,0-7.27-6.36-7.27-8.99c-2.39,0-1.82,0-8.74,0c-11.18,0-13.5-5.99-13.5-14.85c0-11.5,8.95-12.85,13.5-12.85S95.58,115.66,95.58,115.66z"
            />
          )}

          {wormhole === "BETA" && (
            <path
              fill="white"
              strokeWidth="0"
              x="90"
              y="90"
              d="M53.71,26.63c0,0,4.21,0,13.34,0c15.58,0,15.86,7.4,15.86,10.65c0,3.3-2.61,8.25-6.63,8.25
                c4.22,0,6.79,5.3,6.79,8.22s-0.16,10.68-16.91,10.68c0-4.57,0-5.27,0-5.27s8.75,0.13,8.75-4.6c0-4.73-4.15-5.16-8.75-5.16
                c0-4.73,0-5.19,0-7.78c1.55,0,8.73,0.23,8.73-4.34s-2.52-4.96-6.95-4.96c-4.43,0-7.42,0-7.42,0v41.53h-6.81
                C53.71,53.34,53.43,26.35,53.71,26.63z"
              transform="translate(24, 76)"
            />
          )}
        </g>
      </svg>
    </div>
  );
}
