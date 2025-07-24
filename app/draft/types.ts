import {
  SystemIds,
  SystemId,
  TilePosition,
  DraftSettings,
  Map,
  FactionId,
} from "~/types";

export type Tier = "low" | "med" | "high" | "red" | "resolved";
export type ChoosableTier = "low" | "med" | "high" | "red";
export type TieredSystems = {
  high: SystemId[];
  med: SystemId[];
  low: SystemId[];
  red: SystemId[];
};
export type SliceChoice = {
  weight: number;
  value: ChoosableTier[];
};

export type TieredSlice = Tier[];

export type DraftType =
  | "milty4p"
  | "milty5p"
  | "milty"
  | "milty7p"
  | "milty8p"
  | "miltyeq8p"
  | "heisen"
  | "heisen8p"
  | "miltyeq"
  | "miltyeq5p"
  | "miltyeq4p"
  | "miltyeq7p"
  | "miltyeqless"
  | "miltyeq7plarge"
  | "wekker"
  | "std4p";

export type MapSize = 3 | 4;

export type SliceGenerationConfig = {
  numAlphas?: number;
  numBetas?: number;
  numLegendaries?: number;
  maxOptimal?: number;
  minOptimal?: number;
  safePathToMecatol?: number;
  highQualityAdjacent?: number;
  hasMinorFactions?: boolean;
  minorFactionPool?: FactionId[];
};

export type DraftConfig = {
  numPlayers: number;

  /**
   * The index locations of tiles on the map that are occupied by minor factions in the equidistant variant.
   */
  minorFactionsEqPositions?: number[];

  /**
   * The type of draft this configuration is for.
   */
  type: DraftType;

  /**
   * The number of concentric circles in the map.
   */
  mapSize?: MapSize;

  /**
   * The 'index locations' of each home screen (clockwise order from 12 o'clock) in the map string.
   */
  homeIdxInMapString: number[];
  /**
   * The index 'locations' of tiles on the map (i.e. not slices) that can be modified during the drafting building process.
   */
  modifiableMapTiles: number[];
  /**
   * Tiles that are preset on the map. (Mostly used for preset hyperlanes for 7p and 8p variants)
   */
  presetTiles: Record<
    number,
    {
      systemId: SystemId;
      rotation?: number;
    }
  >;
  /**
   * The index locations of tiles on the map that are closed off
   */
  closedMapTiles: number[];
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
   * Whether to allow independent map randomization.
   */
  allowIndependentMapRandomization?: boolean;

  generateMap?: (
    settings: DraftSettings,
    systemPool: SystemId[],
    minorFactionPool?: FactionId[],
  ) =>
    | {
        map: Map;
        slices: SystemIds[];
      }
    | undefined;

  /**
   * Function to randomly generate slices according to draft-specific rules.
   * @param sliceCount The number of slices to generate.
   * @param availableSystems
   */
  generateSlices: (
    sliceCount: number,
    availableSystems: SystemId[],
    configuration?: SliceGenerationConfig,
  ) => SystemIds[] | undefined;
};
