import { create } from "zustand";
import {
  FactionId,
  Map,
  MapStats,
  MapType,
  Opulence,
  PersistedDraft,
  Player,
  System,
  SystemStats,
  Variance,
} from "./types";
import {
  MapConfig,
  hydrateMap,
  mapConfig,
  parseMapString,
  playerSpeakerOrder,
  sliceMap,
} from "./utils/map";
import { mapStringOrder } from "./data/mapStringOrder";
import { systemData } from "./data/systemData";
import { factionIds, factions } from "./data/factionData";
import { fisherYatesShuffle, randomizeSlices } from "./stats";

const MECATOL_REX_ID = 18;

const EMPTY_MAP_STRING =
  "0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0".split(
    " ",
  );
const EMPTY_MAP = parseMapString(mapConfig.heisen, EMPTY_MAP_STRING);

type DraftsState = {
  initialized: boolean;
  config: MapConfig;
  mapString: string[];
  hydratedMap: Map;
  players: Player[];
  slices: string[][];
  factions: FactionId[];
  currentPick: number;
  pickOrder: number[];
  lastEvent: string;
  draftSpeaker: boolean;
  selectSlice: (playerId: number, sliceIdx: number) => void;
  selectSeat: (playerId: number, seatIdx: number) => void;
  selectFaction: (playerId: number, factionId: FactionId) => void;
  selectSpeakerOrder: (playerId: number, speakerOrder: number) => void;
  hydrate: (draft: PersistedDraft) => void;
  getPersisted: () => PersistedDraft;
};

export const useDraft = create<DraftsState>((set, get) => ({
  initialized: false,
  config: mapConfig.milty,
  mapString: EMPTY_MAP_STRING,
  hydratedMap: EMPTY_MAP,
  players: [],
  slices: [],
  factions: [],
  currentPick: 0,
  pickOrder: [],
  lastEvent: "",
  draftSpeaker: false,
  getPersisted: () => ({
    mapType: get().config.type,
    mapString: get().mapString.join(" "),
    players: get().players,
    slices: get().slices,
    factions: get().factions,
    currentPick: get().currentPick,
    pickOrder: get().pickOrder,
    lastEvent: get().lastEvent,
    draftSpeaker: get().draftSpeaker,
  }),
  selectFaction: (playerId: number, factionId: FactionId) =>
    set((state) => {
      const players = state.players.map((p) =>
        p.id === playerId ? { ...p, faction: factionId } : p,
      );
      const hydratedMap = hydrateMap(
        state.config,
        state.hydratedMap,
        players,
        state.slices,
      );
      const activePlayerName = state.players.find(
        (p) => p.id === playerId,
      )?.name;

      return {
        players,
        hydratedMap: hydratedMap,
        currentPick: state.currentPick + 1,
        lastEvent:
          activePlayerName &&
          `${activePlayerName} selected ${factions[factionId].name}`,
      };
    }),
  selectSlice: (playerId: number, sliceIdx: number) =>
    set((state) => {
      const players = state.players.map((p) =>
        p.id === playerId ? { ...p, sliceIdx } : p,
      );
      const hydratedMap = hydrateMap(
        state.config,
        state.hydratedMap,
        players,
        state.slices,
      );
      const activePlayerName = state.players.find(
        (p) => p.id === playerId,
      )?.name;
      return {
        players,
        hydratedMap: hydratedMap,
        currentPick: state.currentPick + 1,
        lastEvent:
          activePlayerName &&
          `${activePlayerName} selected Slice ${sliceIdx + 1}`,
      };
    }),

  selectSeat: (playerId: number, seatIdx: number) =>
    set((state) => {
      const players = state.players.map((p) =>
        p.id === playerId
          ? {
              ...p,
              seatIdx: seatIdx,
              // if not drafting speaker, then selecfting a seat is the same as selecting speaker order
              speakerOrder: state.draftSpeaker ? p.speakerOrder : seatIdx,
            }
          : p,
      );

      const parsedMap = parseMapString(
        state.config,
        state.mapString,
        mapStringOrder,
        false,
      );
      const hydratedMap = hydrateMap(
        state.config,
        parsedMap,
        players,
        state.slices,
      );
      const activePlayerName = state.players.find(
        (p) => p.id === playerId,
      )?.name;

      return {
        players,
        hydratedMap: hydratedMap,
        currentPick: state.currentPick + 1,
        lastEvent:
          activePlayerName &&
          `${activePlayerName} selected Seat ${seatIdx + 1}`,
      };
    }),
  selectSpeakerOrder: (playerId: number, speakerOrder: number) =>
    set((state) => {
      const players = state.players.map((p) =>
        p.id === playerId ? { ...p, speakerOrder } : p,
      );
      const activePlayerName = state.players.find(
        (p) => p.id === playerId,
      )?.name;
      return {
        players,
        currentPick: state.currentPick + 1,
        lastEvent:
          activePlayerName &&
          `${activePlayerName} selected ${playerSpeakerOrder[speakerOrder]} on the speaker order.`,
      };
    }),
  hydrate: (draft: PersistedDraft) =>
    set(() => {
      const config = mapConfig[draft.mapType];
      const parsedMap = parseMapString(
        config,
        draft.mapString.split(" "),
        mapStringOrder,
        false,
      );
      const hydratedMap = hydrateMap(
        config,
        parsedMap,
        draft.players,
        draft.slices,
      );

      return {
        initialized: true,
        config,
        hydratedMap: hydratedMap,
        mapString: draft.mapString.split(" "),
        players: draft.players,
        slices: draft.slices,
        factions: draft.factions,
        currentPick: draft.currentPick,
        pickOrder: draft.pickOrder,
        lastEvent: draft.lastEvent,
        draftSpeaker: draft.draftSpeaker,
      };
    }),
}));

type NewDraftState = {
  initialized: boolean;
  config: MapConfig;
  map: Map;
  slices: string[][];
  numFactionsToDraft: number;
  draftSpeaker: boolean;
  availableFactions: FactionId[];
  players: Player[];
  varianceValue: Variance;
  opulenceValue: Opulence;
  setDraftSpeaker: (draftSpeaker: boolean) => void;
  randomizeSlices: (
    numSlices: number,
    varianceValue: Variance,
    opulenceValue: Opulence,
    excludeMapTiles: boolean,
  ) => void;
  randomizeSlice: (sliceIdx: number) => void;
  clearSlice: (sliceIdx: number) => void;
  initializeMap: (args: {
    mapType: MapType;
    numFactions: number;
    numSlices: number;
    players: Player[];
    randomizeSlices: boolean;
    randomizeMap: boolean;
  }) => void;
  validationErrors: () => string[]; // TODO: Move derived data to hook.
  exportableMapString: () => string; // TODO: Move derived data to hook.
  mapStats: () => MapStats; // TODO: Move derived data to hook.
  setNumFactionsToDraft: (num: number | undefined) => void;
  updatePlayer: (playerIdx: number, player: Partial<Player>) => void;
  clearMap: () => void;
  randomizeMap: () => void;
  importMap: (mapString: string) => void;
  addSystemToMap: (tileIdx: number, system: System) => void;
  removeSystemFromMap: (tileIdx: number) => void;
  addSystemToSlice: (sliceIdx: number, tileIdx: number, system: System) => void;
  removeSystemFromSlice: (sliceIdx: number, tileIdx: number) => void;
  addNewSlice: () => void;
  addFaction: (id: FactionId) => void;
  addRandomFaction: () => void;
  removeLastFaction: () => void;
  removeFaction: (id: FactionId) => void;
};

export const useNewDraft = create<NewDraftState>((set, get) => ({
  initialized: false,
  config: mapConfig.heisen,
  map: EMPTY_MAP,
  slices: [
    "-1 0 0 0".split(" "),
    "-1 0 0 0".split(" "),
    "-1 0 0 0".split(" "),
    "-1 0 0 0".split(" "),
    "-1 0 0 0".split(" "),
    "-1 0 0 0".split(" "),
  ],
  availableFactions: [...factionIds],
  players: [
    ...[0, 1, 2, 3, 4, 5].map((i) => ({
      id: i,
      name: "",
    })),
  ],
  numFactionsToDraft: 6,
  draftSpeaker: false,
  varianceValue: "medium",
  opulenceValue: "medium",

  initializeMap: ({
    mapType,
    numFactions,
    numSlices,
    players,
    randomizeSlices,
    randomizeMap,
  }: {
    mapType: MapType;
    numFactions: number;
    numSlices: number;
    players: Player[];
    randomizeSlices: boolean;
    randomizeMap: boolean;
  }) => {
    const config = mapConfig[mapType];
    let slices = [];
    for (let i = 0; i < numSlices; i++) {
      slices.push([
        "-1",
        ...Array.from({ length: config.numSystemsInSlice }, () => "0"),
      ]);
    }

    // randomly pull factions from the list of all factions
    const availableFactions: FactionId[] = fisherYatesShuffle(
      factionIds,
      numFactions,
    );

    // if randomize slices, do a randomized draft of slices!
    if (randomizeSlices) {
      get().randomizeSlices(numSlices, "medium", "medium", false);
      slices = get().slices;
    }
    if (randomizeMap) {
      get().randomizeMap();
    }

    set({
      config,
      map: randomizeMap ? get().map : [...EMPTY_MAP],
      slices,
      players,
      initialized: true,
      availableFactions,
      numFactionsToDraft: numFactions,
    });
  },

  setDraftSpeaker: (draftSpeaker: boolean) => set({ draftSpeaker }),

  randomizeSlice: (sliceIdx: number) =>
    set((state) => {
      // get all used system ids of other tiles to exclude from the random pull.
      const usedSliceSystems = state.slices
        .filter((_, idx) => idx !== sliceIdx)
        .flat(1)
        .filter((i) => i !== "-1");

      const usedMapSystems: string[] = [];
      state.config.modifiableMapTiles.forEach((idx) => {
        const system = state.map[idx].system;
        if (system) {
          usedMapSystems.push(system.id.toString());
        }
      });
      const usedSystemIds = [...usedSliceSystems, ...usedMapSystems];

      const availableSystems = Object.values(systemData).filter(
        (s) =>
          s.id !== MECATOL_REX_ID && !usedSystemIds.includes(s.id.toString()),
      );

      // now generate a single slice with the saved variance/opulence,
      // excluding systems used by other slices and the map
      const slice = randomizeSlices(
        1,
        availableSystems,
        state.varianceValue,
        state.opulenceValue,
        state.config.numSystemsInSlice,
      )[0].systems.map((sys) => sys.id.toString());

      // update slice in array
      const slices = [...state.slices];
      slices[sliceIdx] = ["-1", ...slice];

      return { slices };
    }),

  clearSlice: (sliceIdx: number) =>
    set((state) => {
      const slices = [...state.slices];
      slices[sliceIdx] = [
        "-1",
        ...Array.from({ length: state.config.numSystemsInSlice }, () => "0"),
      ];
      return { slices };
    }),

  randomizeSlices: (
    numSlices: number,
    varianceValue: Variance,
    opulenceValue: Opulence,
    excludeMapTiles: boolean,
  ) => {
    const systemIdsOnMap = get()
      .map.map((tile) => tile.system?.id)
      .filter(Boolean);

    let systems = Object.values(systemData).filter(
      (s) => s.id !== MECATOL_REX_ID,
    );
    if (excludeMapTiles) {
      systems = systems.filter((s) => !systemIdsOnMap.includes(s.id));
    }

    const slices = randomizeSlices(
      numSlices,
      systems,
      varianceValue,
      opulenceValue,
      get().config.numSystemsInSlice,
    )
      .map((s) => s.systems.map((sys) => sys.id.toString()))
      .map((s) => ["-1", ...s]);

    set({ slices, varianceValue, opulenceValue });
  },

  validationErrors: () => {
    const errors = [];
    const numFactionsToDraft = get().numFactionsToDraft;

    if (numFactionsToDraft !== undefined && numFactionsToDraft < 6) {
      errors.push("Number of factions to draft must be 6 or more");
    }

    // if there are any zeroes in slices except for the first value in the slice, return false
    const slices = get().slices.map((slice) => slice.slice(1));
    slices.forEach((slice, idx) => {
      if (slice.some((tile) => tile === "0")) {
        errors.push(`Slice ${idx} has empty tiles`);
      }
    });

    // we pretend as if all players have seated.
    const hydratedMap = hydrateMap(
      get().config,
      get().map,
      get().players.map((p, idx) => ({ ...p, seatIdx: idx, sliceIdx: idx })),
      get().slices,
    );

    // if there are any zeroes on the map, return false.
    const mapType = get().config.type;
    if (
      hydratedMap.some((tile) => tile.type === "OPEN") &&
      mapType !== "miltyeqless"
    ) {
      errors.push("Map has empty tiles");
    }

    return errors;
  },
  exportableMapString: () => {
    // we pretend as if all players have seated.
    const hydratedMap = hydrateMap(
      get().config,
      get().map,
      get().players.map((p, idx) => ({ ...p, seatIdx: idx, sliceIdx: idx })),
      get().slices,
    );

    return hydratedMap
      .map((tile) => tile.system?.id ?? "0")
      .slice(1, hydratedMap.length)
      .join(" ");
  },
  mapStats: () => {
    const stats: SystemStats[] = [];
    get().slices.forEach((slice) => {
      slice.forEach((t) => {
        const system = systemData[parseInt(t)];
        if (!system) return;
        stats.push(systemStats(system));
      });
    });
    get().map.forEach((tile) => {
      if (tile.type !== "SYSTEM") return;
      stats.push(systemStats(tile.system));
    });

    return stats.reduce(
      (acc, s) => {
        acc.totalResources += s.totalResources;
        acc.totalInfluence += s.totalInfluence;
        acc.totalTech = acc.totalTech.concat(s.totalTech).sort();
        acc.redTraits += s.redTraits;
        acc.greenTraits += s.greenTraits;
        acc.blueTraits += s.blueTraits;
        if (s.tileColor !== undefined)
          s.tileColor === "RED" ? acc.redTiles++ : acc.blueTiles++;
        return acc;
      },
      {
        redTiles: 0,
        blueTiles: 0,
        totalResources: 0,
        totalInfluence: 0,
        totalTech: [] as string[],
        redTraits: 0,
        greenTraits: 0,
        blueTraits: 0,
      },
    );
  },
  setNumFactionsToDraft: (num) => set({ numFactionsToDraft: num }),
  updatePlayer: (playerIdx: number, player: Partial<Player>) =>
    set(({ players }) => ({
      players: players.map((p, idx) =>
        idx === playerIdx ? { ...p, ...player } : p,
      ),
    })),
  importMap: (mapString: string) =>
    set((state) => {
      const rawMap = parseMapString(state.config, mapString.split(" "));
      const { slices, map: slicedMap } = sliceMap(state.config, rawMap);
      return {
        map: slicedMap,
        slices,
      };
    }),

  clearMap: () =>
    set((state) => {
      const map = [...state.map];
      state.config.modifiableMapTiles.forEach((idx) => {
        map[idx] = {
          position: state.map[idx].position,
          idx: state.map[idx].idx,
          system: undefined,
          type: "OPEN",
        };
      });
      return { map };
    }),

  randomizeMap: () => {
    // updated slices.
    const slices = get().slices;
    const config = get().config;

    let mapString = [...EMPTY_MAP_STRING];
    const numMapTiles = config.modifiableMapTiles.length;
    const usedSystemIds = slices.flat(1).filter((i) => i !== "-1");
    const availableSystemIds = fisherYatesShuffle(
      Object.keys(systemData).filter((id) => !usedSystemIds.includes(id)),
      numMapTiles,
    );

    config.modifiableMapTiles.forEach((idx) => {
      // idx - 1 to account for mecatol
      mapString[idx - 1] = availableSystemIds.pop()!!;
    });

    return set({ map: parseMapString(config, mapString) });
  },

  addSystemToMap: (tileIdx: number, system: System) =>
    set((state) => {
      const map = [...state.map];
      map[tileIdx] = {
        ...state.map[tileIdx],
        type: "SYSTEM",
        system,
      };

      return { map };
    }),

  removeSystemFromMap: (tileIdx: number) =>
    set((state) => {
      const map = [...state.map];
      map[tileIdx] = {
        position: state.map[tileIdx].position,
        idx: state.map[tileIdx].idx,
        system: undefined,
        type: "OPEN",
      };
      return { map };
    }),

  addSystemToSlice: (sliceIdx: number, tileIdx: number, system: System) =>
    set((state) => {
      const slices = [...state.slices];
      slices[sliceIdx] = [...slices[sliceIdx]];
      slices[sliceIdx][tileIdx] = system.id.toString();
      return { slices };
    }),

  removeSystemFromSlice: (sliceIdx: number, tileIdx: number) =>
    set((state) => {
      const slices = [...state.slices];
      slices[sliceIdx] = [...slices[sliceIdx]];
      slices[sliceIdx][tileIdx] = "0";
      return { slices };
    }),

  addNewSlice: () =>
    set((state) => ({
      slices: [
        [
          "-1",
          ...Array.from({ length: state.config.numSystemsInSlice }, () => "0"),
        ],
        ...state.slices,
      ],
    })),

  addFaction: (id: FactionId) =>
    set(({ availableFactions }) => ({
      availableFactions: [...availableFactions, id],
    })),

  addRandomFaction: () =>
    set((state) => {
      const availableFactions = factionIds.filter(
        (f) => !state.availableFactions.includes(f),
      );
      const idx = Math.floor(Math.random() * availableFactions.length);
      const faction = availableFactions[idx];
      return {
        availableFactions: [...state.availableFactions, faction],
        numFactionsToDraft: state.numFactionsToDraft + 1,
      };
    }),

  removeLastFaction: () =>
    set((state) => {
      const availableFactions = state.availableFactions.slice(0, -1);
      return {
        availableFactions,
        numFactionsToDraft: availableFactions.length,
      };
    }),

  removeFaction: (id: FactionId) =>
    set(({ availableFactions }) => ({
      numFactionsToDraft: availableFactions.length - 1,
      availableFactions: availableFactions.filter((f) => f !== id),
    })),
}));

function tileColor(system: System): "RED" | "BLUE" | undefined {
  if (system.id == MECATOL_REX_ID) return undefined;
  if (system.planets.length === 0) return "RED";
  if (system.anomaly) return "RED";
  return "BLUE";
}

function systemStats(system: System): SystemStats {
  const techSpecialtyMap = {
    BIOTIC: "G",
    CYBERNETIC: "Y",
    WARFARE: "R",
    PROPULSION: "B",
  } as const;

  const traitCount = {
    HAZARDOUS: "redTraits",
    INDUSTRIAL: "greenTraits",
    CULTURAL: "blueTraits",
  } as const;

  return system.planets.reduce(
    (stats, p) => {
      stats.totalResources += p.resources;
      stats.totalInfluence += p.influence;

      if (p.techSpecialty) {
        stats.totalTech.push(techSpecialtyMap[p.techSpecialty]);
      }

      if (p.trait) {
        stats[traitCount[p.trait]]++;
      }

      return stats;
    },
    {
      tileColor: tileColor(system),
      totalResources: 0,
      totalInfluence: 0,
      totalTech: [] as string[],
      redTraits: 0,
      greenTraits: 0,
      blueTraits: 0,
    },
  );
}
