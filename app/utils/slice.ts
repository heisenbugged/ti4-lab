import { systemData } from "~/data/systemData";
import { DraftConfig } from "~/draft";
import { DraftSlice, System, TileRef } from "~/types";

export function emptySlices(
  config: DraftConfig,
  numSlices: number,
): DraftSlice[] {
  return Array.from({ length: numSlices }, (_, idx) =>
    emptySlice(config, `Slice ${idx + 1}`, config.numSystemsInSlice),
  );
}

export function emptySlice(
  config: DraftConfig,
  name: string,
  numSystems: number,
): DraftSlice {
  const tiles: TileRef[] = Array.from({ length: numSystems }, (_, idx) => ({
    idx: idx + 1,
    type: "OPEN",
    position: config.seatTilePositions[idx + 1],
  }));

  return {
    name,
    tiles: [
      {
        idx: 0,
        type: "HOME",
        position: config.seatTilePositions[0],
      },
      ...tiles,
    ],
  };
}

export const systemsInSlice = (slice: DraftSlice): System[] => {
  return slice.tiles.reduce((acc, t) => {
    if (t.type !== "SYSTEM") return acc;
    acc.push(systemData[t.systemId]);
    return acc;
  }, [] as System[]);
};
