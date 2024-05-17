// System from data. To be processed into a proper 'System' object.
export type RawSystem = {
  id: number;
  planets: string[];
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
  anomaly?: Anomaly;
  wormhole?: Wormhole;
};

export type MapSpaceType = "SYSTEM" | "HOME" | "OPEN" | "CLOSED" | "WARP";

export type TilePosition = {
  x: number;
  y: number;
  z: number;
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

export type Tile =
  | ({ type: "HOME" } & BaseTile)
  | ({ type: "OPEN" } & BaseTile)
  | ({ type: "CLOSED" } & BaseTile)
  | ({ type: "WARP" } & BaseTile)
  | SystemTile;

export type Map = {
  tiles: Tile[];
};
