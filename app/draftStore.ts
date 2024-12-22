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
  InGameColor,
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
import { getRandomSliceNames } from "./data/sliceWords";

/// V2
type DraftV2State = {
  initialized: boolean;
  hydrated: boolean;

  draftId?: string;
  draftUrl?: string;
  draft: Draft;

  factionPool: FactionId[];
  requiredFactions: FactionId[] | null;
  allowedFactions: FactionId[] | null;
  systemPool: SystemId[];

  selectedPlayer?: PlayerId;
  factionSettingsModal: boolean;
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
    selectMinorFaction: (playerId: number, minorFactionId: FactionId) => void;
    selectPlayerColor: (playerId: number, color: InGameColor) => void;
    selectSeat: (playerId: number, seatIdx: number) => void;
    banFaction: (playerId: PlayerId, factionId: FactionId) => void;
    undoLastSelection: () => void;
  };
  actions: {
    initializeDraft: (
      settings: DraftSettings,
      players: Player[],
      integrations: DraftIntegrations,
    ) => void;
    initializeDraftFromSavedState: (draft: Draft) => void;
    reset: () => void;

    setDraftSpeaker: (draftSpeaker: boolean) => void;
    updatePlayerName: (playerIdx: number, name: string) => void;

    // faction settings
    openFactionSettings: () => void;
    closeFactionSettings: () => void;
    changeFactionSettings: (
      availableFactions: FactionId[],
      requiredFactions: FactionId[],
    ) => void;

    // faction actions
    randomizeFactions: () => void;
    setNumFactionsToDraft: (num: number) => void;
    addRandomFaction: () => void;
    removeLastFaction: () => void;
    removeFaction: (id: FactionId) => void;

    // minor faction actions
    randomizeMinorFactions: () => void;
    setNumMinorFactionsToDraft: (num: number) => void;
    addRandomMinorFaction: () => void;
    removeLastMinorFaction: () => void;
    removeMinorFaction: (id: FactionId) => void;

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
    updateSliceName: (sliceIdx: number, name: string) => void;

    // map actions
    clearMap: () => void;

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
    factionGameSets: [],
    tileGameSets: [],
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
  requiredFactions: null,
  allowedFactions: null,
  systemPool: [],
  planetFinderModal: undefined,
  factionSettingsModal: false,
  selectedPlayer: undefined,
  draft: emptyDraft(),
};

export const draftStore = createStore<DraftV2State>()(
  immer((set) => ({
    ...initialState,
    draftActions: {
      hydrate: (draftId: string, draftUrl: string, draft: Draft) => {
        // reset before changing
        set(initialState);
        set((state) => {
          state.draftId = draftId;
          state.draftUrl = draftUrl;
          state.draft = draft;

          state.factionPool = getFactionPool(draft.settings.factionGameSets);
          state.systemPool = getSystemPool(draft.settings.tileGameSets);

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

      selectMinorFaction: (playerId: number, minorFactionId: FactionId) =>
        set((state) => {
          const alreadySelected = state.draft.selections.find(
            (s) => s.playerId === playerId && s.type === "SELECT_MINOR_FACTION",
          );
          if (alreadySelected) return;

          state.draft.selections.push({
            type: "SELECT_MINOR_FACTION",
            playerId,
            minorFactionId,
          });
        }),

      selectPlayerColor: (playerId: number, color: InGameColor) =>
        set((state) => {
          const alreadySelected = state.draft.selections.find(
            (s) => s.playerId === playerId && s.type === "SELECT_PLAYER_COLOR",
          );
          if (alreadySelected) return;

          state.draft.selections.push({
            type: "SELECT_PLAYER_COLOR",
            playerId,
            color,
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

      banFaction: (playerId: PlayerId, factionId: FactionId) =>
        set((state) => {
          if (!state.draft.settings.modifiers?.banFactions) return;
          state.draft.selections.push({
            type: "BAN_FACTION",
            playerId,
            factionId,
          });

          const modifier = state.draft.settings.modifiers.banFactions;
          const totalBans = modifier.numFactions * state.draft.players.length;

          // once ban phase is complete, reroll factions
          if (state.draft.selections.length >= totalBans) {
            // Get all banned factions
            const bannedFactions = state.draft.selections
              .filter((s) => s.type === "BAN_FACTION")
              .map((s) => s.factionId);

            // Filter the faction pool to exclude banned factions
            const filteredPool = state.factionPool.filter(
              (f) => !bannedFactions.includes(f),
            );

            state.draft.availableFactions = randomizeFactions(
              state.draft.settings.numFactions,
              filteredPool,
              state.draft.availableMinorFactions ?? [],
              state.requiredFactions,
              state.allowedFactions,
            );
          }
        }),
    },
    actions: {
      openFactionSettings: () =>
        set((state) => {
          state.factionSettingsModal = true;
        }),

      closeFactionSettings: () =>
        set((state) => {
          state.factionSettingsModal = false;
        }),

      changeFactionSettings: (
        availableFactions: FactionId[],
        requiredFactions: FactionId[],
      ) =>
        set((state) => {
          state.requiredFactions = requiredFactions;
          state.allowedFactions = availableFactions;
          state.factionSettingsModal = false;

          state.draft.availableFactions = randomizeFactions(
            state.draft.settings.numFactions,
            state.factionPool,
            state.draft.availableMinorFactions ?? [],
            requiredFactions,
            availableFactions,
          );
        }),

      initializeDraftFromSavedState: (draft: Draft) =>
        set((state) => {
          state.draft = draft;
          state.factionPool = getFactionPool(draft.settings.factionGameSets);
          state.systemPool = getSystemPool(draft.settings.tileGameSets);
          state.initialized = true;
          state.hydrated = false;
        }),
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
          state.factionPool = getFactionPool(settings.factionGameSets);
          state.systemPool = getSystemPool(settings.tileGameSets);

          draft.availableFactions = randomizeFactions(
            settings.numFactions,
            state.factionPool,
            [],
            state.requiredFactions,
            state.allowedFactions,
          );

          const numMinorFactions = settings.numMinorFactions;
          if (numMinorFactions) {
            const otherFactions = state.factionPool.filter(
              (f) => !draft.availableFactions.includes(f),
            );
            draft.availableMinorFactions = fisherYatesShuffle(
              otherFactions,
              numMinorFactions,
            );
          }

          // pre-fill map and slices
          if (config.type === "heisen" || config.type === "heisen8p") {
            // nucleus has a special draft format.
            const { map, slices } = initializeHeisen(
              settings,
              state.systemPool,
            );
            draft.presetMap = map;
            draft.slices = slices;
          } else {
            const slices = initializeSlices(settings, state.systemPool);
            if (slices) draft.slices = slices;

            draft.presetMap = initializeMap(
              settings,
              draft.slices,
              state.systemPool,
            );
          }

          // get cool names!
          const sliceLength = draft.slices.length;
          const sliceNames = getRandomSliceNames(sliceLength);
          draft.slices.forEach((slice, idx) => {
            slice.name = `Slice ${sliceNames[idx]}`;
          });

          state.draft.settings = settings;
          state.initialized = true;
        });
      },
      reset: () => set(initialState),
      setDraftSpeaker: (draftSpeaker: boolean) =>
        set(({ draft }) => {
          draft.settings.draftSpeaker = draftSpeaker;
        }),
      updatePlayerName: (playerIdx: number, name: string) =>
        set(({ draft }) => {
          draft.players[playerIdx].name = name;
        }),

      // minor faction actions
      setNumMinorFactionsToDraft: (num: number) =>
        set(({ draft }) => {
          draft.settings.numMinorFactions = num;
        }),
      randomizeMinorFactions: () =>
        set(({ draft, factionPool }) => {
          if (!draft.settings.numMinorFactions) return;
          const availableFactions = factionPool.filter(
            (f) => !draft.availableFactions.includes(f),
          );

          draft.availableMinorFactions = fisherYatesShuffle(
            availableFactions,
            draft.settings.numMinorFactions,
          );
        }),

      addRandomMinorFaction: () =>
        set(({ draft, factionPool }) => {
          if (!draft.settings.numMinorFactions) return;
          const availableMinorFactions = factionPool.filter(
            (f) =>
              !draft.availableFactions.includes(f) &&
              !draft.availableMinorFactions?.includes(f),
          );
          const idx = Math.floor(Math.random() * availableMinorFactions.length);
          draft.availableMinorFactions?.push(availableMinorFactions[idx]);
          draft.settings.numMinorFactions += 1;
        }),

      removeLastMinorFaction: () =>
        set(({ draft }) => {
          if (!draft.availableMinorFactions) return;
          const availableMinorFactions = draft.availableMinorFactions?.slice(
            0,
            -1,
          );
          draft.settings.numMinorFactions = availableMinorFactions.length;
          draft.availableMinorFactions = availableMinorFactions;
        }),

      removeMinorFaction: (id: FactionId) =>
        set(({ draft }) => {
          if (!draft.availableMinorFactions) return;
          draft.settings.numMinorFactions =
            draft.availableMinorFactions.length - 1;
          draft.availableMinorFactions = draft.availableMinorFactions.filter(
            (f) => f !== id,
          );
        }),

      // faction actions
      randomizeFactions: () =>
        set(({ draft, factionPool, requiredFactions, allowedFactions }) => {
          draft.availableFactions = randomizeFactions(
            draft.settings.numFactions,
            factionPool,
            draft.availableMinorFactions ?? [],
            requiredFactions,
            allowedFactions,
          );
        }),

      setNumFactionsToDraft: (num: number) =>
        set(({ draft }) => {
          draft.settings.numFactions = num;
        }),
      addRandomFaction: () =>
        set((state) => {
          const { draft, factionPool } = state;
          const pool = state.allowedFactions ?? factionPool;
          const availableFactions = pool.filter(
            (f) =>
              !draft.availableFactions.includes(f) &&
              !draft.availableMinorFactions?.includes(f),
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
            rotation: system.rotation,
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
            rotation: system.rotation,
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
      updateSliceName: (sliceIdx: number, name: string) =>
        set(({ draft }) => {
          draft.slices[sliceIdx].name = name;
        }),

      // map actions
      clearMap: () =>
        set(({ draft }) => {
          const config = draftConfig[draft.settings.type];
          draft.presetMap = generateEmptyMap(config);
        }),

      // randomization
      randomizeAll: () =>
        set(({ draft, systemPool }) => {
          if (
            draft.settings.type !== "heisen" &&
            draft.settings.type !== "heisen8p"
          ) {
            return {};
          }
          const { map, slices } = initializeHeisen(draft.settings, systemPool);
          draft.presetMap = map;
          draft.slices = slices;

          // TODO: Remove duplication between this and initializeDraft
          // get cool names!
          const sliceLength = draft.slices.length;
          const sliceNames = getRandomSliceNames(sliceLength);
          draft.slices.forEach((slice, idx) => {
            slice.name = `Slice ${sliceNames[idx]}`;
          });
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

          const generated = config.generateSlices(1, availableSystems, {
            numAlphas: 0,
            numBetas: 0,
            numLegendaries: 0,
          });

          if (generated == undefined) {
            alert("Could not generate slice with given parameters");
            return;
          }
          const rawSlice = generated[0];

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
            {
              minOptimal: draft.settings.minOptimal,
              maxOptimal: draft.settings.maxOptimal,
            },
          );

          if (rawSlices) {
            draft.slices = systemIdsToSlices(config, rawSlices);
          }

          // TODO: Remove duplication between this and initializeDraft
          // get cool names!
          const sliceLength = draft.slices.length;
          const sliceNames = getRandomSliceNames(sliceLength);
          draft.slices.forEach((slice, idx) => {
            slice.name = `Slice ${sliceNames[idx]}`;
          });
        }),
    },
  })),
);

export function useDraft(): DraftV2State;
export function useDraft<T>(selector: (state: DraftV2State) => T): T;
export function useDraft<T>(selector?: (state: DraftV2State) => T) {
  return useStore(draftStore, selector!);
}

export function useHasBanPhase() {
  return useDraft(
    (state) => state.draft.settings.modifiers?.banFactions !== undefined,
  );
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
    config,
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

export function initializeSlices(
  settings: DraftSettings,
  systemPool: SystemId[],
) {
  const config = draftConfig[settings.type];
  if (!settings.randomizeSlices) return emptySlices(config, settings.numSlices);

  const rawSlices = config.generateSlices(settings.numSlices, systemPool, {
    maxOptimal: settings.maxOptimal,
    minOptimal: settings.minOptimal,
  });

  if (!rawSlices) return undefined;
  return systemIdsToSlices(config, rawSlices);
}

export function initializeMap(
  settings: DraftSettings,
  slices: Slice[],
  systemPool: SystemId[],
) {
  const config = draftConfig[settings.type];
  if (!settings.randomizeMap) return generateEmptyMap(config);
  return randomizeMap(config, slices, systemPool);
}

export function randomizeMap(
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

export function randomizeFactions(
  numFactions: number,
  factionPool: FactionId[],
  availableMinorFactions: FactionId[],
  requiredFactions: FactionId[] | null,
  allowedFactions: FactionId[] | null,
) {
  const availableFactions = [...(requiredFactions ?? [])];
  const remainingToPull = numFactions - availableFactions.length;

  if (remainingToPull > 0) {
    const toPullFrom = allowedFactions ? allowedFactions : factionPool;
    availableFactions.push(
      ...fisherYatesShuffle(
        toPullFrom.filter(
          (f) =>
            !availableFactions.includes(f) &&
            !availableMinorFactions.includes(f),
        ),
        remainingToPull,
      ),
    );
  }

  return availableFactions;
}
