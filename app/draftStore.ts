import { create } from "zustand";
import {
  DiscordData,
  Draft,
  DraftSettings,
  DraftSlice,
  FactionId,
  Map,
  MapV2,
  PersistedDraft,
  Player,
  Slice,
  System,
  SystemId,
} from "./types";
import {
  generateEmptyMap,
  parseMapString,
  playerSpeakerOrder,
} from "./utils/map";
import { factions } from "./data/factionData";
import { fisherYatesShuffle } from "./stats";
import { draftConfig } from "./draft/draftConfig";
import { DraftConfig } from "./draft/types";
import { generateMap as generateHeisenMap } from "./draft/heisen/generateMap";
import { immer } from "zustand/middleware/immer";
import {
  emptySlice,
  emptySlices,
  systemIdsToSlice,
  systemIdsToSlices,
} from "./utils/slice";
import { getSystemPool, systemStats } from "./utils/system";
import { getFactionPool } from "./utils/factions";
import { mapStringOrder } from "./data/mapStringOrder";

const EMPTY_MAP_STRING =
  "0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0".split(
    " ",
  );

const EMPTY_MAP = parseMapString(draftConfig.heisen, EMPTY_MAP_STRING);

type DraftsState = {
  initialized: boolean;
  draftUrl: string;
  config: DraftConfig;
  mapString: SystemId[];
  hydratedMap: Map;
  players: Player[];
  slices: Slice[];
  factions: FactionId[];
  currentPick: number;
  pickOrder: number[];
  lastEvent: string;
  draftSpeaker: boolean;
  discordData?: DiscordData;
  updatePlayer: (playerIdx: number, player: Partial<Player>) => void;
  selectSlice: (playerId: number, sliceIdx: number) => void;
  selectSeat: (playerId: number, seatIdx: number) => void;
  selectFaction: (playerId: number, factionId: FactionId) => void;
  selectSpeakerOrder: (playerId: number, speakerOrder: number) => void;
  addSystemToMap: (tileIdx: number, system: System) => void;
  removeSystemFromMap: (tileIdx: number) => void;
  hydrate: (draft: PersistedDraft, draftUrlName: string) => void;
  getPersisted: () => PersistedDraft;
  refreshMap: (options: {
    config?: DraftConfig;
    mapString?: SystemId[];
    players?: Player[];
    slices?: Slice[];
  }) => {
    hydratedMap: Map;
    mapString: SystemId[];
    players: Player[];
    slices: Slice[];
  };
};

export const useDraft = create<DraftsState>((set, get) => ({
  initialized: false,
  draftUrl: "",
  config: draftConfig.milty,
  mapString: EMPTY_MAP_STRING,
  hydratedMap: EMPTY_MAP,
  players: [],
  slices: [],
  factions: [],
  currentPick: 0,
  pickOrder: [],
  lastEvent: "",
  draftSpeaker: false,
  discordData: undefined,
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
    discordData: get().discordData,
  }),
  selectFaction: (playerId: number, factionId: FactionId) =>
    set((state) => {
      const players = state.players.map((p) =>
        p.id === playerId ? { ...p, faction: factionId } : p,
      );
      const activePlayerName = state.players.find(
        (p) => p.id === playerId,
      )?.name;

      return {
        ...state.refreshMap({ players }),
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

      const activePlayerName = state.players.find(
        (p) => p.id === playerId,
      )?.name;
      return {
        ...state.refreshMap({ players }),
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

      const activePlayerName = state.players.find(
        (p) => p.id === playerId,
      )?.name;

      return {
        ...state.refreshMap({ players }),
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
  hydrate: (draft: PersistedDraft, draftUrlName: string) =>
    set((state) => {
      let mapString = draft.mapString.split(" ");

      // NOTE: Some old drafts have 'mecatol' at the start of the map string. This is not great, but we fix it here.
      // TODO: Eventually clean up all the old drafts
      if (mapString[0] === "18") mapString = mapString.slice(1);
      const config = draftConfig[draft.mapType];

      return {
        initialized: true,
        config,
        draftUrl: draftUrlName,
        factions: draft.factions,
        currentPick: draft.currentPick,
        pickOrder: draft.pickOrder,
        lastEvent: draft.lastEvent,
        draftSpeaker: draft.draftSpeaker,
        discordData: draft.discordData,
        ...state.refreshMap({
          config,
          mapString,
          players: draft.players,
          slices: draft.slices,
        }),
      };
    }),

  addSystemToMap: (tileIdx: number, system: System) =>
    set((state) => {
      const mapString = [...state.mapString];
      mapString[tileIdx - 1] = system.id;
      return state.refreshMap({ mapString });
    }),
  removeSystemFromMap: (tileIdx: number) =>
    set((state) => {
      const mapString = [...state.mapString];
      mapString[tileIdx - 1] = "0";
      return state.refreshMap({ mapString });
    }),

  refreshMap: ({ config, mapString, players, slices }) => {
    const newConfig = config ?? get().config;
    const newMapString = mapString ?? get().mapString;
    const newPlayers = players ?? get().players;
    const newSlices = slices ?? get().slices;
    const parsedMap = parseMapString(newConfig, newMapString);
    const hydratedMap = hydrateMapOld(
      newConfig,
      parsedMap,
      newPlayers,
      newSlices,
    );

    return {
      hydratedMap,
      config: newConfig,
      mapString: newMapString,
      players: newPlayers,
      slices: newSlices,
    };
  },

  updatePlayer: (playerIdx: number, player: Partial<Player>) =>
    set(({ players }) => ({
      players: players.map((p, idx) =>
        idx === playerIdx ? { ...p, ...player } : p,
      ),
    })),
}));

function randomizeMap(
  config: DraftConfig,
  slices: DraftSlice[],
  systemPool: SystemId[],
): MapV2 {
  const map = generateEmptyMap(config);
  const numMapTiles = config.modifiableMapTiles.length;
  const usedSystemIds = slices
    .map((s) => s.tiles)
    .flat(1)
    .map((t) => (t.type === "SYSTEM" ? t.systemId : undefined))
    .filter((t) => !!t) as SystemId[];

  const filteredSystemIds = fisherYatesShuffle(
    systemPool.filter((id) => !usedSystemIds.includes(id)),
    numMapTiles,
  );

  config.modifiableMapTiles.forEach((idx) => {
    map[idx] = {
      idx: idx,
      position: mapStringOrder[idx],
      type: "SYSTEM",
      systemId: filteredSystemIds.pop()!,
    };
  });
  return map;
}

/// V2
type DraftV2State = {
  draft: Draft;
  factionPool: FactionId[];
  systemPool: SystemId[];
  initialized: boolean;
  planetFinderModal?:
    | {
        mode: "map";
        tileIdx: number;
      }
    | {
        mode: "slice";
        sliceIdx: number;
        tileIdx: number;
      };
  actions: {
    initializeDraft: (settings: DraftSettings) => void;

    setDraftSpeaker: (draftSpeaker: boolean) => void;
    // HOW are we updating players?
    // updatePlayer: (playerIdx: number, player: Partial<Player>) => void;

    // faction actions
    randomizeFactions: () => void;
    setNumFactionsToDraft: (num: number) => void;
    addRandomFaction: () => void;
    removeLastFaction: () => void;
    removeFaction: (id: FactionId) => void;

    // planet finding actions
    openPlanetFinderForMap: (tileIdx: number) => void;
    openPlanetFinderForSlice: (sliceIdx: number, tileIdx: number) => void;
    closePlanetFinder: () => void;

    // system actions
    addSystemToMap: (tileIdx: number, system: System) => void;
    removeSystemFromMap: (tileIdx: number) => void;

    // slice actions
    addSystemToSlice: (
      sliceIdx: number,
      tileIdx: number,
      system: System,
    ) => void;
    removeSystemFromSlice: (sliceIdx: number, tileIdx: number) => void;
    clearSlice: (sliceIdx: number) => void;

    // map actions
    clearMap: () => void;
    importMap: (mapString: string) => void;

    // randomization
    randomizeAll: () => void;
    randomizeMap: () => void;
    randomizeSlice: (sliceIdx: number) => void;
    randomizeSlices: () => void;
  };
};

export const useDraftV2 = create<DraftV2State>()(
  immer((set) => ({
    initialized: false,
    factionPool: [],
    systemPool: [],
    planetFinderModal: undefined,
    draft: {
      settings: {
        allowEmptyTiles: false,
        allowHomePlanetSearch: false,
        draftSpeaker: false,
        randomizeMap: false,
        randomizeSlices: false,
        gameSets: [],
        numFactions: 6,
        numSlices: 6,
        type: "heisen",
      },
      availableFactions: [],
      integrations: {},
      players: [],
      slices: [],
      presetMap: [],
    },
    actions: {
      initializeDraft: (settings: DraftSettings) =>
        set((state) => {
          const draft = state.draft;
          const config = draftConfig[settings.type];

          // intialize pools based on game sets.
          state.factionPool = getFactionPool(settings.gameSets);
          state.systemPool = getSystemPool(settings.gameSets);

          draft.availableFactions = fisherYatesShuffle(
            state.factionPool,
            settings.numFactions,
          );

          // pre-fill map and slices
          if (config.type === "heisen") {
            // nucleus has a special draft format.
            const { map, slices } = initializeHeisen(
              settings,
              state.systemPool,
            );
            draft.presetMap = map;
            draft.slices = slices;
          } else {
            draft.slices = initializeSlices(settings, state.systemPool);
            draft.presetMap = initializeMap(
              settings,
              draft.slices,
              state.systemPool,
            );
          }

          state.draft.settings = settings;
          state.initialized = true;
        }),

      setDraftSpeaker: (draftSpeaker: boolean) =>
        set(({ draft }) => {
          draft.settings.draftSpeaker = draftSpeaker;
        }),
      // HOW are we updating players?
      // updatePlayer: (playerIdx: number, player: Partial<Player>) => void;

      // faction actions
      randomizeFactions: () =>
        set(({ draft, factionPool }) => {
          draft.availableFactions = fisherYatesShuffle(
            factionPool,
            draft.settings.numFactions,
          );
        }),

      setNumFactionsToDraft: (num: number) =>
        set(({ draft }) => {
          draft.settings.numFactions = num;
        }),
      addRandomFaction: () =>
        set(({ draft, factionPool }) => {
          const availableFactions = factionPool.filter(
            (f) => !draft.availableFactions.includes(f),
          );
          const idx = Math.floor(Math.random() * availableFactions.length);
          draft.availableFactions.push(availableFactions[idx]);
          draft.settings.numFactions += 1;
        }),

      removeLastFaction: () =>
        set(({ draft }) => {
          const availableFactions = draft.availableFactions.slice(0, -1);
          draft.settings.numFactions = availableFactions.length;
          draft.availableFactions = availableFactions;
        }),

      removeFaction: (id: FactionId) =>
        set(({ draft }) => {
          draft.settings.numFactions = draft.availableFactions.length - 1;
          draft.availableFactions = draft.availableFactions.filter(
            (f) => f !== id,
          );
        }),

      // planet finder actions
      openPlanetFinderForMap: (tileIdx: number) =>
        set((state) => {
          state.planetFinderModal = {
            mode: "map",
            tileIdx,
          };
        }),

      openPlanetFinderForSlice: (sliceIdx: number, tileIdx: number) =>
        set((state) => {
          state.planetFinderModal = {
            mode: "slice",
            sliceIdx,
            tileIdx,
          };
        }),

      closePlanetFinder: () =>
        set((state) => {
          state.planetFinderModal = undefined;
        }),

      // system actions
      addSystemToMap: (tileIdx: number, system: System) =>
        set(({ draft }) => {
          draft.presetMap[tileIdx] = {
            idx: tileIdx,
            position: draft.presetMap[tileIdx].position,
            type: "SYSTEM",
            systemId: system.id,
          };
        }),
      removeSystemFromMap: (tileIdx: number) =>
        set(({ draft }) => {
          draft.presetMap[tileIdx] = {
            idx: tileIdx,
            position: draft.presetMap[tileIdx].position,
            type: "OPEN",
          };
        }),

      // slice actions
      addSystemToSlice: (sliceIdx: number, tileIdx: number, system: System) =>
        set(({ draft }) => {
          draft.slices[sliceIdx].tiles[tileIdx] = {
            ...draft.slices[sliceIdx].tiles[tileIdx],
            type: "SYSTEM",
            systemId: system.id,
          };
        }),
      removeSystemFromSlice: (sliceIdx: number, tileIdx: number) =>
        set(({ draft }) => {
          draft.slices[sliceIdx].tiles[tileIdx] = {
            ...draft.slices[sliceIdx].tiles[tileIdx],
            type: "OPEN",
          };
        }),
      clearSlice: (sliceIdx: number) =>
        set(({ draft }) => {
          const config = draftConfig[draft.settings.type];
          draft.slices[sliceIdx] = emptySlice(
            config,
            draft.slices[sliceIdx].name,
            config.numSystemsInSlice,
          );
        }),

      // map actions
      clearMap: () =>
        set(({ draft }) => {
          const config = draftConfig[draft.settings.type];
          draft.presetMap = generateEmptyMap(config);
        }),
      importMap: (mapString: string) => {},

      // randomization
      randomizeAll: () => {},
      randomizeMap: () => {},
      randomizeSlice: (sliceIdx: number) => {},
      randomizeSlices: () => {},
    },
    setDraft: (partial: (state: DraftV2State) => Draft | Partial<Draft>) =>
      set((state) => ({
        draft: {
          ...state.draft,
          ...partial(state),
        },
      })),
  })),
);

function initializeHeisen(settings: DraftSettings, systemPool: SystemId[]) {
  const config = draftConfig[settings.type];
  const map = generateEmptyMap(config);
  if (!settings.randomizeMap) {
    return {
      map,
      slices: emptySlices(config, settings.numSlices),
    };
  }

  const { chosenSpots, slices: rawSlices } = generateHeisenMap(
    settings.numSlices,
    systemPool,
  );

  Object.entries(chosenSpots).forEach(([mapIdx, systemId]) => {
    const existing = map[Number(mapIdx) + 1];
    map[Number(mapIdx) + 1] = {
      ...existing,
      type: "SYSTEM",
      systemId,
    };
  });

  return { map, slices: systemIdsToSlices(config, rawSlices) };
}

function initializeSlices(settings: DraftSettings, systemPool: SystemId[]) {
  const config = draftConfig[settings.type];
  if (!settings.randomizeSlices) return emptySlices(config, settings.numSlices);

  const rawSlices = config.generateSlices(settings.numSlices, systemPool);
  return systemIdsToSlices(config, rawSlices);
}

function initializeMap(
  settings: DraftSettings,
  slices: DraftSlice[],
  systemPool: SystemId[],
) {
  const config = draftConfig[settings.type];
  if (!settings.randomizeMap) return generateEmptyMap(config);

  return randomizeMap(config, slices, systemPool);
}

// export const useNewDraft = create<NewDraftState>((set, get) => ({
//   initialized: false,
//   config: draftConfig.heisen,
//   map: EMPTY_MAP,
//   systemPool: draftableSystemIds,
//   factionPool: allFactionIds,
//   allowHomePlanetSearch: false,
//   allowEmptyMapTiles: false,
//   // TODO: Determine if we should instead just make this a full empty array.
//   slices: [],
//   availableFactions: [...allFactionIds],
//   players: [
//     ...[0, 1, 2, 3, 4, 5].map((i) => ({
//       id: i,
//       name: "",
//     })),
//   ],
//   numFactionsToDraft: 6,
//   draftSpeaker: false,
//   varianceValue: "medium",
//   opulenceValue: "medium",
//   discordData: undefined,

//   exportableMapString: () => {
//     return "";
//     // // we pretend as if all players have seated.
//     // const hydratedMap = hydrateMapOld(
//     //   get().config,
//     //   get().map,
//     //   get().players.map((p, idx) => ({ ...p, seatIdx: idx, sliceIdx: idx })),
//     //   get().slices,
//     // );

//     // return hydratedMap
//     //   .map((tile) => tile.system?.id ?? "0")
//     //   .slice(1, hydratedMap.length)
//     //   .join(" ");
//   },

//   actions: {
//     initializeMap: ({
//       gameSets,
//       mapType,
//       numFactions,
//       numSlices,
//       players,
//       randomizeSlices: shouldRandomizeSlices,
//       randomizeMap: shouldRandomizeMap,
//       draftSpeaker,
//       allowHomePlanetSearch,
//       allowEmptyMapTiles,
//       discordData,
//     }) => {
//       const config = draftConfig[mapType];
//       let systemPool = [...draftableSystemIds];
//       if (gameSets.includes("unchartedstars")) {
//         systemPool.push(...unchartedStarsSystemIds);
//       }
//       systemPool = systemPool.flat(1);

//       let factionPool = [...baseFactionIds];
//       if (gameSets.includes("discordant")) {
//         factionPool.push(...factionDiscordantIds);
//       }
//       if (gameSets.includes("discordantexp")) {
//         factionPool.push(...factionDiscordantExpIds);
//       }
//       factionPool = factionPool.flat(1);

//       // randomly pull factions from the list of all factions
//       const availableFactions: FactionId[] = fisherYatesShuffle(
//         factionPool,
//         numFactions,
//       );

//       let slices: Slice[];
//       let map: Map;

//       if (mapType !== "heisen") {
//         slices = shouldRandomizeSlices
//           ? randomizeSlices(config, numSlices, systemPool)
//           : emptySlicesOld(numSlices, config.numSystemsInSlice);

//         map = shouldRandomizeMap
//           ? randomizeMap(config, slices, systemPool)
//           : EMPTY_MAP;
//       } else {
//         // nucleum has a very special draft format.
//         const { chosenSpots, slices: rawSlices } = generateHeisenMap(
//           numSlices,
//           systemPool,
//         );

//         slices = rawSlices.map(normalizeSliceOld);
//         const mapIds = [...EMPTY_MAP_STRING];
//         Object.entries(chosenSpots).forEach(([mapIdx, system]) => {
//           mapIds[Number(mapIdx)] = system;
//         });
//         map = parseMapString(config, mapIds);
//       }

//       // sort by most valuable first
//       slices.sort((a, b) => {
//         const aSystems = systemsInSliceOld(a);
//         const bSystems = systemsInSliceOld(b);
//         return valueSlice(bSystems) - valueSlice(aSystems);
//       });

//       set({
//         config,
//         map,
//         slices,
//         players,
//         initialized: true,
//         availableFactions,
//         numFactionsToDraft: numFactions,
//         draftSpeaker: draftSpeaker ?? false,
//         systemPool,
//         factionPool,
//         allowHomePlanetSearch,
//         allowEmptyMapTiles,
//         discordData,
//       });
//     },

//     setDraftSpeaker: (draftSpeaker: boolean) => set({ draftSpeaker }),

//     clearSlice: (sliceIdx: number) =>
//       set((state) => {
//         const slices = [...state.slices];
//         slices[sliceIdx] = emptySliceOld(state.config.numSystemsInSlice);
//         return { slices };
//       }),

//     randomizeFactions: () =>
//       set((state) => {
//         const availableFactions = fisherYatesShuffle(
//           state.factionPool,
//           state.numFactionsToDraft,
//         );
//         return { availableFactions };
//       }),

//     setNumFactionsToDraft: (num) => set({ numFactionsToDraft: num }),
//     updatePlayer: (playerIdx: number, player: Partial<Player>) =>
//       set(({ players }) => ({
//         players: players.map((p, idx) =>
//           idx === playerIdx ? { ...p, ...player } : p,
//         ),
//       })),
//     importMap: (mapString: string) =>
//       set((state) => {
//         const rawMap = parseMapString(state.config, mapString.split(" "));
//         const { slices, map: slicedMap } = sliceMap(state.config, rawMap);
//         return {
//           map: slicedMap,
//           slices,
//         };
//       }),

//     clearMap: () =>
//       set((state) => {
//         const map = [...state.map];
//         state.config.modifiableMapTiles.forEach((idx) => {
//           map[idx] = {
//             position: state.map[idx].position,
//             idx: state.map[idx].idx,
//             system: undefined,
//             type: "OPEN",
//           };
//         });
//         return { map };
//       }),

//     addSystemToMap: (tileIdx: number, system: System) =>
//       set((state) => {
//         const map = [...state.map];
//         map[tileIdx] = {
//           ...state.map[tileIdx],
//           type: "SYSTEM",
//           system,
//         };

//         return { map };
//       }),

//     removeSystemFromMap: (tileIdx: number) =>
//       set((state) => {
//         const map = [...state.map];
//         map[tileIdx] = {
//           position: state.map[tileIdx].position,
//           idx: state.map[tileIdx].idx,
//           system: undefined,
//           type: "OPEN",
//         };
//         return { map };
//       }),

//     addSystemToSlice: (sliceIdx: number, tileIdx: number, system: System) =>
//       set((state) => {
//         const slices = [...state.slices];
//         slices[sliceIdx] = [...slices[sliceIdx]];
//         slices[sliceIdx][tileIdx] = system.id;
//         return { slices };
//       }),

//     removeSystemFromSlice: (sliceIdx: number, tileIdx: number) =>
//       set((state) => {
//         const slices = [...state.slices];
//         slices[sliceIdx] = [...slices[sliceIdx]];
//         slices[sliceIdx][tileIdx] = "0";
//         return { slices };
//       }),

//     addNewSlice: () =>
//       set((state) => ({
//         slices: [
//           emptySliceOld(state.config.numSystemsInSlice),
//           ...state.slices,
//         ],
//       })),

//     addFaction: (id: FactionId) =>
//       set(({ availableFactions }) => ({
//         availableFactions: [...availableFactions, id],
//       })),

//     addRandomFaction: () =>
//       set((state) => {
//         const availableFactions = state.factionPool.filter(
//           (f) => !state.availableFactions.includes(f),
//         );
//         const idx = Math.floor(Math.random() * availableFactions.length);
//         const faction = availableFactions[idx];
//         return {
//           availableFactions: [...state.availableFactions, faction],
//           numFactionsToDraft: state.numFactionsToDraft + 1,
//         };
//       }),

//     removeLastFaction: () =>
//       set((state) => {
//         const availableFactions = state.availableFactions.slice(0, -1);
//         return {
//           availableFactions,
//           numFactionsToDraft: availableFactions.length,
//         };
//       }),

//     removeFaction: (id: FactionId) =>
//       set(({ availableFactions }) => ({
//         numFactionsToDraft: availableFactions.length - 1,
//         availableFactions: availableFactions.filter((f) => f !== id),
//       })),

//     // randomization actions
//     randomizeAll: () =>
//       set((state) => {
//         if (state.config.type !== "heisen") return {};

//         // nucleum has a very special draft format.
//         const { chosenSpots, slices: rawSlices } = generateHeisenMap(
//           state.slices.length,
//           state.systemPool,
//         );
//         const slices = rawSlices.map(normalizeSliceOld);
//         const mapIds = [...EMPTY_MAP_STRING];
//         Object.entries(chosenSpots).forEach(([mapIdx, system]) => {
//           mapIds[Number(mapIdx)] = system;
//         });
//         const map = parseMapString(state.config, mapIds);

//         // sort by most valuable first
//         slices.sort((a, b) => {
//           const aSystems = systemsInSliceOld(a);
//           const bSystems = systemsInSliceOld(b);
//           return valueSlice(bSystems) - valueSlice(aSystems);
//         });

//         return { map, slices };
//       }),

//     randomizeMap: () =>
//       set((state) => {
//         const map = randomizeMap(state.config, state.slices, state.systemPool);
//         return { map };
//       }),
//     randomizeSlices: (numSlices, varianceValue, opulenceValue) =>
//       set((state) => {
//         const slices = randomizeSlices(
//           state.config,
//           numSlices ?? state.slices.length,
//           state.systemPool,
//           opulenceValue,
//           varianceValue,
//         );

//         return { slices, varianceValue, opulenceValue };
//       }),
//     randomizeSlice: (sliceIdx: number) =>
//       set((state) => {
//         // get all used system ids of other tiles to exclude from the random pull.
//         const usedSliceSystems = state.slices
//           .filter((_, idx) => idx !== sliceIdx)
//           .flat(1)
//           .filter((i) => i !== "-1");

//         const usedMapSystems: SystemId[] = [];
//         state.config.modifiableMapTiles.forEach((idx) => {
//           const system = state.map[idx].system;
//           if (system) {
//             usedMapSystems.push(system.id);
//           }
//         });

//         const usedSystemIds = [...usedSliceSystems, ...usedMapSystems];
//         const availableSystems = state.systemPool.filter(
//           (s) => !usedSystemIds.includes(s),
//         );

//         const generatedSlice = randomizeSlices(
//           state.config,
//           1,
//           availableSystems,
//           state.opulenceValue,
//           state.varianceValue,
//         )[0];

//         // update slice in array
//         const slices = [...state.slices];
//         slices[sliceIdx] = generatedSlice;

//         return { slices };
//       }),
//   },
// }));
