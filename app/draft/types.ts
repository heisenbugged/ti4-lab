import { TilePosition } from "~/types";

export type Tier = "low" | "med" | "high" | "red" | "resolved";
export type ChoosableTier = "low" | "med" | "high" | "red";
export type TieredSystems = {
  high: number[];
  med: number[];
  low: number[];
  red: number[];
};

export type TieredSlice = Tier[];

export type DraftType =
  | "heisen"
  | "miltyeq"
  | "miltyeqless"
  | "milty"
  | "wekker";

export type DraftConfig = {
  type: DraftType;
  homeIdxInMapString: number[];
  modifiableMapTiles: number[];
  seatTilePlacement: TilePosition[];
  seatTilePositions: Record<number, [number, number][]>;
  numSystemsInSlice: number;
  sliceHeight: number;
  sliceConcentricCircles: number;
  wOffsetMultiplier?: number;
};
