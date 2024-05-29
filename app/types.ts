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
  legendary?: boolean;
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

  totalSpend: { resources: number; influence: number };
  optimalSpend: { resources: number; influence: number; flex: number };
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

export type PlayerDemoTile = BaseTile & {
  type: "PLAYER_DEMO";
  playerNumber: number;
  isHomeSystem: boolean;
};

export type OpenTile = BaseTile & {
  type: "OPEN";
};

export type EmptyTile = BaseTile & {
  type: "EMPTY";
};

export type Tile =
  | HomeTile
  | OpenTile
  | ({ type: "CLOSED" } & BaseTile)
  | ({ type: "WARP" } & BaseTile)
  | PlayerDemoTile
  | SystemTile;

export type Map = Tile[];

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
  speakerOrder?: number;
};

export type PersistedDraft = {
  mapType: MapType;
  factions: FactionId[];
  players: Player[];
  slices: string[][];
  mapString: string;
  currentPick: number;
  pickOrder: number[];
  lastEvent?: string;
  draftSpeaker: boolean;
};

export type SystemStats = {
  tileColor: "RED" | "BLUE" | undefined;
  totalResources: number;
  totalInfluence: number;
  totalTech: string[];
  redTraits: number;
  greenTraits: number;
  blueTraits: number;
};

export type MapStats = {
  redTiles: number;
  blueTiles: number;
  totalResources: number;
  totalInfluence: number;
  totalTech: string[];
  redTraits: number;
  greenTraits: number;
  blueTraits: number;
};

export type Variance = "low" | "medium" | "high" | "extreme";
export type Opulence = "poverty" | "low" | "medium" | "high" | "wealthy";

export type MapType = "heisen" | "miltyeq" | "miltyeqless" | "milty";
