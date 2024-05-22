// System from data. To be processed into a proper 'System' object.
export type RawSystem = {
  id: number;
  planets: string[];
  home?: boolean;
  anomaly?: Anomaly;
  wormhole?: Wormhole;
};

export type TechSpecialty = "BIOTIC" | "WARFARE" | "PROPULSION" | "CYBERNETIC";
export type PlanetTrait = "INDUSTRIAL" | "HAZARDOUS" | "CULTURAL";
export type Planet = {
  name: string;
  trait?: PlanetTrait;
  techSpecialty?: TechSpecialty;
  resources: number;
  influence: number;
};
export type Anomaly =
  | "NEBULA"
  | "GRAVITY_RIFT"
  | "ASTEROID_FIELD"
  | "SUPERNOVA";
export type Wormhole = "ALPHA" | "BETA" | "DELTA";
export type System = {
  id: number;
  planets: Planet[];
  home?: boolean;
  anomaly?: Anomaly;
  wormhole?: Wormhole;
};

export type MapSpaceType = "SYSTEM" | "HOME" | "OPEN" | "CLOSED" | "WARP";

export type TilePosition = {
  x: number;
  y: number;
  // z: number;
};

type BaseTile = {
  idx: number;
  position: TilePosition;
  system?: System;
};

export type SystemTile = BaseTile & {
  position: TilePosition;
  type: "SYSTEM";
  system: System;
};

export type HomeTile = BaseTile & {
  type: "HOME";
  seatIdx: number;
  player?: Player;
};

export type Tile =
  | HomeTile
  | ({ type: "OPEN" } & BaseTile)
  | ({ type: "CLOSED" } & BaseTile)
  | ({ type: "WARP" } & BaseTile)
  | SystemTile;

export type Map = {
  tiles: Tile[];
};

// TODO: Finish filling out
export type FactionId =
  | "sardakk"
  | "arborec"
  | "barony"
  | "saar"
  | "muaat"
  | "hacan"
  | "sol"
  | "creuss"
  | "l1z1x"
  | "mentak"
  | "naalu"
  | "nekro"
  | "jolnar"
  | "winnu"
  | "xxcha"
  | "yin"
  | "yssaril"
  | "argent"
  | "empyrean"
  | "mahact"
  | "naazrokha"
  | "nomad"
  | "titans"
  | "vulraith"
  | "keleres";

export type Faction = {
  id: FactionId;
  iconPath: string;
  name: string;
};

export type Player = {
  id: number;
  name: string;
  faction?: FactionId;
  seatIdx?: number;
  sliceIdx?: number;
};

export type Draft = {
  rawMap: Map;
  hydratedMap: Map;
  activePlayer: number;
  factions: FactionId[];
  players: Player[];
  slices: string[][];
};
