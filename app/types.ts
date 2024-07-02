import { DraftType } from "./draft";

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
};

export type PlayerDemoTile = BaseTile & {
  type: "PLAYER_DEMO";
  playerNumber: number;
  isHomeSystem: boolean;
};

export type DemoTile = PlayerDemoTile | SystemTile | OpenTile | ClosedTile;

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

export type SystemIds = SystemId[];
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
  numPreassignedFactions?: number;
};

export type DiscordPlayer =
  | {
      type: "identified";
      playerId: number;
      username: string;
      memberId?: string;
      nickname?: string;
    }
  | {
      type: "unidentified";
      playerId: number;
      name: string;
    };

export type DiscordData = {
  guildId: string;
  channelId: string;
  players: DiscordPlayer[];
};

export type DraftIntegrations = {
  discord?: DiscordData;
};

export type Player = {
  id: number;
  name: string;
};

export type Slice = {
  name: string;
  tiles: Tile[];
};

type BaseTile = {
  idx: number;
  position: TilePosition;
};

export type SystemTile = BaseTile & {
  type: "SYSTEM";
  systemId: SystemId;
  rotation?: number;
};

export type HomeTile = BaseTile & {
  type: "HOME";
  seat?: number;
  playerId?: PlayerId;
};

export type OpenTile = BaseTile & {
  type: "OPEN";
};

export type ClosedTile = BaseTile & {
  type: "CLOSED";
};

export type Tile = SystemTile | HomeTile | OpenTile | ClosedTile;

export type Map = Tile[];

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
    }
  | {
      type: "SELECT_FACTION";
      playerId: PlayerId;
      factionId: FactionId;
    }
  | {
      type: "SELECT_SEAT";
      playerId: PlayerId;
      seatIdx: number;
    };

export type Draft = {
  settings: DraftSettings;
  integrations: DraftIntegrations;
  players: Player[];
  slices: Slice[];
  presetMap: Map;
  availableFactions: FactionId[];
  pickOrder: PlayerId[];
  selections: DraftSelection[];
  playerFactionPool?: Record<PlayerId, FactionId[]>;
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
