import { DemoTile } from "~/types";
import {
  calcHexHeight,
  calculateConcentricCircles,
  calculateMaxHexRadius,
  calculateMaxHexWidthRadius,
  getHexPosition,
} from "~/utils/positioning";
import { useDimensions } from "~/hooks/useDimensions";
import { useContext } from "react";
import { MapContext } from "~/contexts/MapContext";
import { PlayerDemoTile, PresetDemoHex } from "./tiles/PlayerDemoTile";
import { Hex } from "./Hex";
import { MecatolTile } from "./tiles/MecatolTile";

import classes from "./tiles/Tiles.module.css";
import { SystemTile } from "./tiles/SystemTile";
import { playerColors } from "~/data/factionData";
import legend from "./DemoMap.module.css";

type Props = {
  id: string;
  map: DemoTile[];
  padding: number;
  titles: string[];
};

export function DemoMap({ id, map, padding, titles }: Props) {
  const { ref, width, height } = useDimensions<HTMLDivElement>();
  const n = calculateConcentricCircles(map.length);
  const gap = 3;
  const initRadius = calculateMaxHexWidthRadius(n, width, gap);
  const initHeight = calcHexHeight(initRadius) * 7 + 6 * gap;
  const clampedHeight = Math.min(initHeight, 1000);
  const radius = calculateMaxHexRadius(n, width, clampedHeight, gap);

  return (
    <MapContext.Provider
      value={{
        radius,
        gap,
        hOffset: -radius + height * 0.5 + padding,
        wOffset: -radius + width * 0.5 + padding,
        disabled: false,
        animateChanges: false,
      }}
    >
      <div ref={ref} style={{ width: "100%", height: `${clampedHeight}px` }}>
        {width > 0 &&
          map
            .filter((t) => !!t.position)
            .map((tile, idx) => (
              <DemoMapTile key={idx} mapId={id} tile={tile} titles={titles} />
            ))}
      </div>
      <DemoLegend hasPreset={map.some((t) => t.type === "OPEN")} />
    </MapContext.Provider>
  );
}

type DemoMapTileProps = {
  mapId: string;
  tile: DemoTile;
  titles: string[];
};

function DemoMapTile({
  mapId,
  tile,
  tile: { position },
  titles,
}: DemoMapTileProps) {
  const { radius, gap, hOffset, wOffset } = useContext(MapContext);
  const { x, y } = getHexPosition(position.x, position.y, radius, gap);

  let Tile: React.ReactNode;
  if (tile.type === "PLAYER_DEMO") {
    Tile = (
      <PlayerDemoTile
        tile={tile}
        title={titles[tile.playerNumber]}
        color={playerColors[tile.playerNumber]}
      />
    );
  } else if (tile.type === "SYSTEM" && tile.systemId === "18") {
    Tile = <MecatolTile mapId={`${mapId}-mecatol`} tile={tile} hideValues />;
  } else if (tile.type === "SYSTEM") {
    Tile = <SystemTile mapId={`${mapId}-system`} tile={tile} hideValues />;
  } else if (tile.type === "CLOSED") {
    Tile = null;
  } else if (tile.type === "OPEN") {
    Tile = <PresetDemoHex radius={radius} />;
  } else {
    Tile = (
      <Hex
        id={`${mapId}-empty`}
        radius={radius}
        colorClass={classes.demoEmpty}
        borderColorClass={classes.demoBorder}
        showBorder
        borderRadius={4}
      />
    );
  }

  return (
    <div
      style={{
        position: "absolute",
        left: x + wOffset,
        top: y + hOffset,
      }}
    >
      {Tile}
    </div>
  );
}

/** Explains the three hex treatments: home, drafted with a slice, preset for everyone. */
function DemoLegend({ hasPreset }: { hasPreset: boolean }) {
  return (
    <ul className={legend.legend}>
      <li>
        <i className={`${legend.swatch} ${legend.home}`} />
        Home system
      </li>
      <li>
        <i className={`${legend.swatch} ${legend.drafted}`} />
        Drafted in a slice
      </li>
      <li className={hasPreset ? undefined : legend.off}>
        <i className={`${legend.swatch} ${legend.preset}`} />
        {hasPreset ? "Preset, shared" : "Nothing preset"}
      </li>
    </ul>
  );
}
