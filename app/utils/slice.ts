import { systemData } from "~/data/systemData";
import { DraftConfig } from "~/draft";
import { valueSlice } from "~/stats";
import { Slice, HomeTile, System, SystemId, Tile } from "~/types";
import { systemsFromIds } from "./system";

const emptyHomeTile = (config: DraftConfig): HomeTile => ({
  idx: 0,
  type: "HOME",
  position: { x: 0, y: 0 },
});

export function emptySlices(config: DraftConfig, numSlices: number): Slice[] {
  return Array.from({ length: numSlices }, (_, idx) =>
    emptySlice(config, `Slice ${idx + 1}`, config.numSystemsInSlice),
  );
}

export function emptySlice(
  config: DraftConfig,
  name: string,
  numSystems: number,
): Slice {
  const tiles: Tile[] = Array.from({ length: numSystems }, (_, idx) => ({
    idx: idx + 1,
    type: "OPEN",
    position: config.seatTilePositions[idx + 1],
  }));

  return {
    name,
    tiles: [emptyHomeTile(config), ...tiles],
  };
}

export const systemsInSlice = (slice: Slice): System[] => {
  if (slice === undefined) debugger;
  return slice.tiles.reduce((acc, t) => {
    if (t.type !== "SYSTEM") return acc;
    acc.push(systemData[t.systemId]);
    return acc;
  }, [] as System[]);
};

export const systemIdsInSlice = (slice: Slice): SystemId[] => {
  return slice.tiles.reduce((acc, t) => {
    if (t.type !== "SYSTEM") return acc;
    acc.push(t.systemId);
    return acc;
  }, [] as SystemId[]);
};

/**
 * Given a set of system ids. Returns a proper 'slice'
 * that includes the home system as well as positioning data for each tile.
 */
export const systemIdsToSlice = (
  config: DraftConfig,
  sliceName: string,
  systemIds: SystemId[],
): Slice => {
  return {
    name: sliceName,
    tiles: [
      emptyHomeTile(config),
      ...systemIds.map((id, idx) => ({
        idx: idx + 1,
        position: config.seatTilePositions[idx + 1],
        type: "SYSTEM" as const,
        systemId: id,
      })),
    ],
  };
};

/**
 * Given a set of system ids, returns a list of slices.
 * Slices are sorted by value, and named in order of value.
 */
export const systemIdsToSlices = (
  config: DraftConfig,
  rawSlices: SystemId[][],
): Slice[] => {
  const sorted = [...rawSlices].sort(
    (a, b) => valueSlice(systemsFromIds(b)) - valueSlice(systemsFromIds(a)),
  );
  return sorted.map((systemIds, idx) =>
    systemIdsToSlice(config, `Slice ${idx + 1}`, systemIds),
  );
};
