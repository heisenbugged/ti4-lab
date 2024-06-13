import { mapStringOrder } from "./data/mapStringOrder";
import { DraftConfig, DraftType } from "./draft";

export type GameSet =
  | "base"
  | "pok"
  | "discordant"
  | "discordantexp"
  | "unchartedstars";

// green = home
// blue = planet tile
// hyperlane = hyperlane
// red = no planet tile / anomaly.
export type SystemType = "GREEN" | "BLUE" | "RED" | "HYPERLANE";

// System from data. To be processed into a proper 'System' object.
export type RawSystem = {
  id: SystemId;
  faction?: FactionId;
  planets: Planet[];
  type: SystemType;
  anomalies: Anomaly[];
  wormholes: Wormhole[];
  hyperlanes?: number[][];
};

export type System = RawSystem & {
  totalSpend: { resources: number; influence: number };
  optimalSpend: { resources: number; influence: number; flex: number };
};

export type TechSpecialty = "BIOTIC" | "WARFARE" | "PROPULSION" | "CYBERNETIC";
export type PlanetTrait = "INDUSTRIAL" | "HAZARDOUS" | "CULTURAL";
export type Planet = {
  name: string;
  trait?: PlanetTrait;
  tech?: TechSpecialty;
  resources: number;
  influence: number;
  legendary?: boolean;
};
export type Anomaly =
  | "NEBULA"
  | "GRAVITY_RIFT"
  | "ASTEROID_FIELD"
  | "SUPERNOVA";
export type Wormhole = "ALPHA" | "BETA" | "DELTA" | "GAMMA";

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

export type Tile = HomeTile | OpenTile | SystemTile;

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
  | "keleres"
  | "axis"
  | "bentor"
  | "celdauri"
  | "cheiran"
  | "cymiae"
  | "dihmohn"
  | "edyn"
  | "florzen"
  | "freesystems"
  | "ghemina"
  | "ghoti"
  | "gledge"
  | "ilyxum"
  | "khrask"
  | "kjalengard"
  | "kollecc"
  | "kolume"
  | "kortali"
  | "kyro"
  | "lanefir"
  | "lizho"
  | "mahact"
  | "mirveda"
  | "mortheus"
  | "myko"
  | "nivyn"
  | "nokar"
  | "olradin"
  | "rhodun"
  | "rohdina"
  | "tnelis"
  | "vaden"
  | "vaylerian"
  | "veldyr"
  | "zelian";

export type Faction = {
  id: FactionId;
  iconPath: string;
  name: string;
  wiki?: string;
  set: GameSet;
};

export type Player = {
  id: number;
  name: string;
  discordName?: string;
  discordMemberId?: string;

  faction?: FactionId;
  seatIdx?: number;
  sliceIdx?: number;
  speakerOrder?: number;
};

export type PersistedDraft = {
  mapType: DraftType;
  factions: FactionId[];
  players: Player[];
  slices: Slice[];
  mapString: string;
  currentPick: number;
  pickOrder: number[];
  lastEvent?: string;
  draftSpeaker: boolean;
  discordData?: DiscordData;
};

export type SystemStats = {
  systemType: SystemType;
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

export type Slice = SystemId[];

export type DiscordPlayer = {
  name: string;
  memberId?: string;
};

export type DiscordData = {
  players: DiscordPlayer[];
  guildId: string;
  channelId: string;
};

export type SystemId = string;

export type PlayerId = number;

/// V2
export type DraftSettings = {
  type: DraftType;
  gameSets: GameSet[];
  draftSpeaker: boolean;
  allowEmptyTiles: boolean;
  allowHomePlanetSearch: boolean;
  numFactions: number;
  numSlices: number;

  randomizeMap: boolean;
  randomizeSlices: boolean;
};

export type DraftIntegrations = {
  discord?: {
    guildId: string;
    channelId: string;
    players: {
      playerId: number;
      memberId: string;
      nickname: string;
      username: string;
    }[];
  };
};

export type DraftPlayer = {
  id: number;
  name: string;
};

export type DraftSlice = {
  name: string;
  tiles: TileRef[];
};

type BaseTileRef = {
  idx: number;
  position: TilePosition;
};

export type SystemTileRef = BaseTileRef & {
  type: "SYSTEM";
  systemId: SystemId;
};

export type HomeTileRef = BaseTileRef & {
  type: "HOME";
  seat?: number;
  playerId?: PlayerId;
};

export type OpenTileRef = BaseTileRef & {
  type: "OPEN";
};

export type TileRef = SystemTileRef | HomeTileRef | OpenTileRef;

export type MapV2 = TileRef[];

export type DraftSelection =
  | {
      type: "SELECT_SPEAKER_ORDER";
      playerId: PlayerId;
      speakerOrder: number;
    }
  | {
      type: "SELECT_SLICE";
      playerId: PlayerId;
      sliceIdx: number;
    };

export type Draft = {
  settings: DraftSettings;
  integrations: DraftIntegrations;
  players: DraftPlayer[];
  slices: DraftSlice[];
  presetMap: MapV2;
  availableFactions: FactionId[];
  pickOrder: PlayerId[];
  selections: DraftSelection[];
};

export type HydratedPlayer = {
  id: number;
  name: string;
  faction?: FactionId;
  seatIdx?: number;
  sliceIdx?: number;
  speakerOrder?: number;
};

export type PlayerSelection = {
  playerId: PlayerId;
  sliceIdx?: number;
  seatIdx?: number;
};
