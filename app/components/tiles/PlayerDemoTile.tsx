import { useContext, useId } from "react";
import { MapContext } from "~/contexts/MapContext";
import { PlayerDemoTile as TPlayerDemoTile } from "~/types";
import { hexVertices } from "../Hex/hexUtils";
import classes from "./PlayerDemoTile.module.css";

type Props = {
  tile: TPlayerDemoTile;
  title: string;
  color: string;
};

function points(radius: number, scale = 0.99) {
  return hexVertices(radius * scale)
    .map((p) => `${p.x},${p.y}`)
    .join(" ");
}

/** A demo-map hex: solid for a home system, outlined in the seat colour for systems drafted with that seat's slice. */
export function PlayerDemoTile({ tile, title, color }: Props) {
  const { radius } = useContext(MapContext);
  const home = tile.isHomeSystem;
  return (
    <div className={classes.tile} style={{ width: radius * 2, height: radius * 2, "--p": `var(--player-${color})` } as React.CSSProperties}>
      <svg width={radius * 2} height={radius * 2} viewBox={`-${radius} -${radius} ${radius * 2} ${radius * 2}`}>
        {home ? (
          <polygon points={points(radius)} className={classes.home} />
        ) : (
          <>
            <polygon points={points(radius)} className={classes.ring} />
            <polygon points={points(radius, 0.88)} className={classes.inner} />
          </>
        )}
      </svg>
      {home && <span className={classes.title} style={{ fontSize: Math.max(11, radius * 0.36) }}>{title}</span>}
    </div>
  );
}

/** A hex that is placed for everyone rather than drafted (preset equidistants, the nucleus). */
export function PresetDemoHex({ radius }: { radius: number }) {
  const id = useId().replace(/:/g, "");
  return (
    <div className={classes.tile} style={{ width: radius * 2, height: radius * 2 }}>
      <svg width={radius * 2} height={radius * 2} viewBox={`-${radius} -${radius} ${radius * 2} ${radius * 2}`}>
        <defs>
          <pattern id={`hatch-${id}`} width="7" height="7" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
            <rect width="7" height="7" className={classes.hatchBg} />
            <rect width="3" height="7" className={classes.hatchLine} />
          </pattern>
        </defs>
        <polygon points={points(radius)} className={classes.presetEdge} />
        <polygon points={points(radius, 0.93)} fill={`url(#hatch-${id})`} />
      </svg>
    </div>
  );
}
