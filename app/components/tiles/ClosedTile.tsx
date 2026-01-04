import { useContext } from "react";
import { MapContext } from "~/contexts/MapContext";
import { Hex } from "../Hex";
import styles from "./Tiles.module.css";

type Props = {
  mapId: string;
  tileIdx: number;
  closeTileMode?: boolean;
};

export function ClosedTile({ mapId, tileIdx, closeTileMode }: Props) {
  const { radius } = useContext(MapContext);

  // X size relative to hex radius
  const xSize = radius * 0.4;
  const strokeWidth = Math.max(2, radius * 0.04);

  return (
    <Hex
      id={`${mapId}-${tileIdx}-closed`}
      radius={radius}
      colorClass={styles.closedTile}
      style={closeTileMode ? { cursor: "pointer" } : undefined}
    >
      {/* X indicator */}
      <svg
        width={xSize * 2}
        height={xSize * 2}
        viewBox={`0 0 ${xSize * 2} ${xSize * 2}`}
        style={{
          pointerEvents: "none",
        }}
      >
        <line
          x1={xSize * 0.3}
          y1={xSize * 0.3}
          x2={xSize * 1.7}
          y2={xSize * 1.7}
          stroke="var(--mantine-color-dark-2)"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          opacity={0.6}
        />
        <line
          x1={xSize * 1.7}
          y1={xSize * 0.3}
          x2={xSize * 0.3}
          y2={xSize * 1.7}
          stroke="var(--mantine-color-dark-2)"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          opacity={0.6}
        />
      </svg>
    </Hex>
  );
}
