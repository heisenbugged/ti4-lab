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

export type SystemTile = {
  position: TilePosition;
  type: "SYSTEM";
  system: System;
};

type BaseTile = {
  position: TilePosition;
  system?: System;
};

// TODO: Finish filling out
export type Faction = "mentak" | "yssaril";

export type Player = {
  id: string;
  name: string;
  faction: Faction; // TODO: Make nullable
  seat?: number;
  sliceIdx?: number;
};

export type HomeTile = {
  position: TilePosition;
  type: "HOME";
  player?: Player;
};

export type Draft = {
  players: Player[];
  slices: string[]; // TODO: Should I make them the actual objects?
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
