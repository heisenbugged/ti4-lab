import { useStore } from "zustand";
import {
  Draft,
  DraftIntegrations,
  Player,
  DraftSettings,
  Slice,
  FactionId,
  Map,
  PlayerId,
  System,
  SystemId,
} from "./types";
import { generateEmptyMap } from "./utils/map";
import { fisherYatesShuffle } from "./stats";
import { draftConfig } from "./draft/draftConfig";
import { DraftConfig } from "./draft/types";
import { generateMap as generateHeisenMap } from "./draft/heisen/generateMap";
import { immer } from "zustand/middleware/immer";
import {
  emptySlice,
  emptySlices,
  systemIdsInSlice,
  systemIdsToSlice,
  systemIdsToSlices,
} from "./utils/slice";
import { getSystemPool } from "./utils/system";
import { getFactionPool } from "./utils/factions";
import { mapStringOrder } from "./data/mapStringOrder";
import {
  getUsedSystemIds,
  getUsedSystemIdsInMap,
} from "./hooks/useUsedSystemIds";
import { atomWithStore } from "jotai-zustand";
import { createStore } from "zustand/vanilla";

/// V2
type DraftV2State = {
  initialized: boolean;
  hydrated: boolean;

  draftId?: string;
  draftUrl?: string;
  draft: Draft;

  factionPool: FactionId[];
  systemPool: SystemId[];

  selectedPlayer?: PlayerId;
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
  draftActions: {
    hydrate: (draftId: string, draftUrl: string, draft: Draft) => void;
    update: (draftId: string, draft: Draft) => void;
    setSelectedPlayer: (playerId: PlayerId) => void;
    selectSpeakerOrder: (playerId: number, speakerOrder: number) => void;
    selectSlice: (playerId: number, sliceIdx: number) => void;
    selectFaction: (playerId: number, factionId: FactionId) => void;
    selectSeat: (playerId: number, seatIdx: number) => void;
    undoLastSelection: () => void;
  };
  actions: {
    initializeDraft: (
      settings: DraftSettings,
      players: Player[],
      integrations: DraftIntegrations,
    ) => void;

    setDraftSpeaker: (draftSpeaker: boolean) => void;
    updatePlayerName: (playerIdx: number, name: string) => void;

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

const emptyDraft = (): Draft => ({
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
  pickOrder: [],
  selections: [],
});

const initialState = {
  initialized: false,
  hydrated: false,
  factionPool: [],
  systemPool: [],
  planetFinderModal: undefined,
  selectedPlayer: undefined,
  draft: emptyDraft(),
};

export const draftStore = createStore<DraftV2State>()(
  immer((set) => ({
    initialized: false,
    hydrated: false,
    factionPool: [],
    systemPool: [],
    planetFinderModal: undefined,
    selectedPlayer: undefined,
    draft: emptyDraft(),
    draftActions: {
      hydrate: (draftId: string, draftUrl: string, draft: Draft) => {
        // reset before changing
        set(initialState);
        set((state) => {
          state.draftId = draftId;
          state.draftUrl = draftUrl;
          state.draft = draft;
          state.factionPool = getFactionPool(draft.settings.gameSets);
          state.systemPool = getSystemPool(draft.settings.gameSets);
          state.hydrated = true;
        });
      },
      undoLastSelection: () =>
        set((state) => {
          if (state.draft.selections.length > 0) {
            state.draft.selections.pop();
          }
        }),
      update: (draftId: string, draft: Draft) =>
        set((state) => {
          if (draftId === state.draftId) {
            state.draft = draft;
          }
        }),
      setSelectedPlayer: (playerId: PlayerId) =>
        set((state) => {
          state.selectedPlayer = playerId;
        }),

      selectSlice: (playerId: number, sliceIdx: number) =>
        set((state) => {
          const alreadySelected = state.draft.selections.find(
            (s) => s.playerId === playerId && s.type === "SELECT_SLICE",
          );
          if (alreadySelected) return;

          state.draft.selections.push({
            type: "SELECT_SLICE",
            playerId,
            sliceIdx,
          });
        }),

      selectSpeakerOrder: (playerId: number, speakerOrder: number) =>
        set((state) => {
          const alreadySelected = state.draft.selections.find(
            (s) => s.playerId === playerId && s.type === "SELECT_SPEAKER_ORDER",
          );
          if (alreadySelected) return;

          state.draft.selections.push({
            type: "SELECT_SPEAKER_ORDER",
            playerId,
            speakerOrder,
          });
        }),

      selectFaction: (playerId: number, factionId: FactionId) =>
        set((state) => {
          const alreadySelected = state.draft.selections.find(
            (s) => s.playerId === playerId && s.type === "SELECT_FACTION",
          );
          if (alreadySelected) return;

          state.draft.selections.push({
            type: "SELECT_FACTION",
            playerId,
            factionId,
          });
        }),

      selectSeat: (playerId: number, seatIdx: number) =>
        set((state) => {
          const alreadySelected = state.draft.selections.find(
            (s) => s.playerId === playerId && s.type === "SELECT_SEAT",
          );
          if (alreadySelected) return;

          state.draft.selections.push({
            type: "SELECT_SEAT",
            playerId,
            seatIdx,
          });
        }),
    },
    actions: {
      initializeDraft: (
        settings: DraftSettings,
        players: Player[],
        integrations: DraftIntegrations,
      ) => {
        // reset state before continuing
        set(initialState);

        set((state) => {
          const config = draftConfig[settings.type];
          const draft = state.draft;
          draft.players = players;
          draft.integrations = integrations;

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
        });
      },
      setDraftSpeaker: (draftSpeaker: boolean) =>
        set(({ draft }) => {
          draft.settings.draftSpeaker = draftSpeaker;
        }),
      updatePlayerName: (playerIdx: number, name: string) =>
        set(({ draft }) => {
          draft.players[playerIdx].name = name;
        }),

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
      randomizeAll: () =>
        set(({ draft, systemPool }) => {
          if (draft.settings.type !== "heisen") return {};
          const { map, slices } = initializeHeisen(draft.settings, systemPool);
          draft.presetMap = map;
          draft.slices = slices;
        }),

      randomizeMap: () =>
        set(({ draft, systemPool }) => {
          const config = draftConfig[draft.settings.type];
          draft.presetMap = randomizeMap(config, draft.slices, systemPool);
        }),

      randomizeSlice: (sliceIdx: number) =>
        set(({ draft, systemPool }) => {
          const config = draftConfig[draft.settings.type];
          const systemsInSlice = systemIdsInSlice(draft.slices[sliceIdx]);
          const usedIds = getUsedSystemIds(draft.slices, draft.presetMap);
          const availableSystems = systemPool.filter(
            (s) => !usedIds.includes(s) || systemsInSlice.includes(s),
          );
          const rawSlice = config.generateSlices(1, availableSystems)[0];

          draft.slices[sliceIdx] = systemIdsToSlice(
            config,
            draft.slices[sliceIdx].name,
            rawSlice,
          );
        }),

      randomizeSlices: () =>
        set(({ draft, systemPool }) => {
          const config = draftConfig[draft.settings.type];
          const usedIds = getUsedSystemIdsInMap(draft.presetMap);
          const availableSystems = systemPool.filter(
            (s) => !usedIds.includes(s),
          );
          const rawSlices = config.generateSlices(
            draft.settings.numSlices,
            availableSystems,
          );
          draft.slices = systemIdsToSlices(config, rawSlices);
        }),
    },
  })),
);

export function useDraft(): DraftV2State;
export function useDraft<T>(selector: (state: DraftV2State) => T): T;
export function useDraft<T>(selector?: (state: DraftV2State) => T) {
  return useStore(draftStore, selector!);
}

// Jotai atom, used for derived/computed values.
export const draftStoreAtom = atomWithStore(draftStore);

// Random functions to be moved elsewhere

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
  slices: Slice[],
  systemPool: SystemId[],
) {
  const config = draftConfig[settings.type];
  if (!settings.randomizeMap) return generateEmptyMap(config);
  return randomizeMap(config, slices, systemPool);
}

function randomizeMap(
  config: DraftConfig,
  slices: Slice[],
  systemPool: SystemId[],
): Map {
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
