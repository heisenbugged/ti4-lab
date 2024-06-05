import { TilePosition } from "~/types";

export type Tier = "low" | "med" | "high" | "red" | "resolved";
export type ChoosableTier = "low" | "med" | "high" | "red";
export type TieredSystems = {
  high: number[];
  med: number[];
  low: number[];
  red: number[];
};
export type SliceChoice = {
  weight: number;
  value: ChoosableTier[];
};

export type TieredSlice = Tier[];

export type DraftType =
  | "heisen"
  | "miltyeq"
  | "miltyeqless"
  | "milty"
  | "wekker";

export type DraftConfig = {
  /**
   * The type of draft this configuration is for.
   */
  type: DraftType;
  /**
   * The 'index locations' of each home screen (clockwise order from 12 o'clock) in the map string.
   */
  homeIdxInMapString: number[];
  /**
   * The index 'locations' of tiles on the map (i.e. not slices) that can be modified during the drafting building process.
   */
  modifiableMapTiles: number[];
  /**
   * The **slice** relative axial positions of each tile in a slice.
   */
  seatTilePositions: TilePosition[];
  /**
   * The **map seat** axial positions of each tile.
   */
  seatTilePlacement: Record<number, [number, number][]>;
  /**
   * The number of systems in each slice.
   */
  numSystemsInSlice: number;
  /**
   * The height (in # hexes) of each slice.
   */
  sliceHeight: number;
  /**
   * The number of concentric circles in each slice.
   */
  sliceConcentricCircles: number;
  /**
   * Multiplier to properly center the slice when rendering (if needed)
   */
  wOffsetMultiplier?: number;

  /**
   * Function to randomly generate slices according to draft-specific rules.
   * @param sliceCount The number of slices to generate.
   * @param availableSystems
   */
  generateSlices?: (
    sliceCount: number,
    availableSystems: number[],
  ) => number[][];
};
