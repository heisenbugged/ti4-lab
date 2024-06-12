import { systemData } from "~/data/systemData";
import { DraftConfig } from "~/draft";
import { valueSlice } from "~/stats";
import { DraftSlice, System, SystemId, TileRef } from "~/types";

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

export const systemIdsToSlice = (
  config: DraftConfig,
  sliceName: string,
  systemIds: SystemId[],
): DraftSlice => {
  return {
    name: sliceName,
    tiles: [
      {
        idx: 0,
        type: "HOME",
        position: config.seatTilePositions[0],
      },
      ...systemIds.map((id, idx) => ({
        idx: idx + 1,
        position: config.seatTilePositions[idx + 1],
        type: "SYSTEM" as const,
        systemId: id,
      })),
    ],
  };
};

export const systemIdsToSlices = (
  config: DraftConfig,
  rawSlices: SystemId[][],
): DraftSlice[] => {
  const sorted = [...rawSlices].sort(
    (a, b) => valueSlice(systemsFromIds(b)) - valueSlice(systemsFromIds(a)),
  );
  return sorted.map((systemIds, idx) =>
    systemIdsToSlice(config, `Slice ${idx + 1}`, systemIds),
  );
};

const systemsFromIds = (ids: SystemId[]): System[] =>
  ids.map((id) => systemData[id]);
