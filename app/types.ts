import { DraftType, SliceGenerationConfig } from "./draft";

export type GameSet =
  | "base"
  | "pok"
  | "te"
  | "discordant"
  | "discordantexp"
  | "unchartedstars"
  | "drahn";

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
  rotation?: number; // only for hyperlanes
};

export type TechSpecialty = "BIOTIC" | "WARFARE" | "PROPULSION" | "CYBERNETIC";
export type PlanetTrait = "INDUSTRIAL" | "HAZARDOUS" | "CULTURAL";
export type Planet = {
  name: string;
  trait?: PlanetTrait[];
  tech?: TechSpecialty[];
  resources: number;
  influence: number;
  legendary?: boolean;
  legendaryTitle?: string;
  legendaryDescription?: string;
  tradeStation?: boolean;
};
export type Anomaly =
  | "NEBULA"
  | "GRAVITY_RIFT"
  | "ASTEROID_FIELD"
  | "ENTROPIC_SCAR"
  | "SUPERNOVA";
export type Wormhole = "ALPHA" | "BETA" | "DELTA" | "GAMMA" | "EPSILON";

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
  | "bastion"
  | "crimson"
  | "ralnel"
  | "dws"
  | "firmament"
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
  | "zelian"
  | "drahn";

export type Faction = {
  id: FactionId;
  iconPath: string;
  name: string;
  wiki?: string;
  set: GameSet;
  priorityOrder?: number; // For Twilight's Fall - determines speaker order
  fleetComposition?: any; // For Twilight's Fall - starting units (stubbed for now)
};

export type SystemStats = {
  systemType: SystemType;
  totalResources: number;
  totalInfluence: number;
  totalTech: string[];
  redTraits: number;
  greenTraits: number;
  blueTraits: number;
  totalLegendary: number;
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

/// V
export type FactionStratification = {
  ["base|pok|te"]?: number;
  ["discordant|discordantexp"]?: number;
};

export type MinorFactionsMode =
  | { mode: "random" }
  | { mode: "sharedPool" }
  | { mode: "separatePool"; numMinorFactions: number };

export type FactionReferenceCardPack = FactionId[]; // Array of 3 faction IDs

export type DraftSettings = {
  type: DraftType;
  factionGameSets: GameSet[];
  tileGameSets: GameSet[];
  draftSpeaker: boolean;

  /** If specified, only these factions are allowed in the draft */
  allowedFactions?: FactionId[];
  /** If specified, these factions are required in the draft */
  requiredFactions?: FactionId[];
  factionStratification?: FactionStratification;

  allowHomePlanetSearch: boolean;
  numFactions: number;
  numSlices: number;
  /**
   * If true, preset map tiles will be populated.
   * Generally only turned off for minor factions variant.
   * */
  randomizeMap: boolean;

  /** For faction bags. # of factions in each 'bag' */
  numPreassignedFactions?: number;

  modifiers?: {
    banFactions?: {
      numFactions: number;
    };
  };
  draftPlayerColors?: boolean;
  adminPassword?: string;

  /** Configuration for slice generation */
  sliceGenerationConfig?: SliceGenerationConfig;

  /** Minor factions variant. */
  minorFactionsMode?: MinorFactionsMode;

  /** Twilight's Fall game mode */
  isTwilightsFall?: boolean;

  // Legacy settings
  allowEmptyTiles: boolean;
  randomizeSlices: boolean;
  minOptimal?: number; // now in sliceGenerationConfig
  maxOptimal?: number; // now in sliceGenerationConfig
  numMinorFactions?: number; // now in minorFactionsMode
  minorFactionsInSharedPool?: boolean; // now in minorFactionsMode
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
      type: "BAN_FACTION";
      playerId: PlayerId;
      factionId: FactionId;
    }
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
      type: "SELECT_MINOR_FACTION";
      playerId: PlayerId;
      minorFactionId: FactionId;
    }
  | {
      type: "SELECT_REFERENCE_CARD";
      playerId: PlayerId;
      referenceFactionId: FactionId;
    }
  | {
      type: "SELECT_SEAT";
      playerId: PlayerId;
      seatIdx: number;
    }
  | {
      type: "SELECT_PLAYER_COLOR";
      playerId: PlayerId;
      color: InGameColor;
    };

export type Draft = {
  settings: DraftSettings;
  integrations: DraftIntegrations;
  players: Player[];
  slices: Slice[];
  presetMap: Map;
  availableFactions: FactionId[];
  availableMinorFactions?: FactionId[];
  availableReferenceCardPacks?: FactionReferenceCardPack[]; // For Twilight's Fall
  pickOrder: PlayerId[];
  selections: DraftSelection[];
  playerFactionPool?: Record<PlayerId, FactionId[]>;
  bannedFactions?: Record<PlayerId, FactionId[]>;
};

export type HydratedPlayer = {
  id: number;
  name: string;
  hasDiscord?: boolean;
  faction?: FactionId;
  minorFaction?: FactionId;
  referenceFaction?: FactionId; // For Twilight's Fall - starting units/home/priority
  seatIdx?: number;
  sliceIdx?: number;
  speakerOrder?: number;
  factionColor?: string;
  bannedFactions?: FactionId[];
};

export type PlayerSelection = {
  playerId: PlayerId;
  sliceIdx?: number;
  seatIdx?: number;
  minorFaction?: FactionId;
};

export type InGameColor =
  | "Green"
  | "Blue"
  | "Yellow"
  | "Red"
  | "Purple"
  | "Black"
  | "Orange"
  | "Magenta";
