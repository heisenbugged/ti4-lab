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
  FactionStratification,
} from "./types";
import { generateEmptyMap } from "./utils/map";
import { draftConfig } from "./draft/draftConfig";
import { DraftConfig } from "./draft/types";
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
import { shuffle } from "./draft/helpers/randomization";
import { factions } from "./data/factionData";
import { notifications } from "@mantine/notifications";

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
      stratifiedConfig: FactionStratification | undefined,
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

            const draftableFactions = getDraftableFactions(
              state.factionPool,
              state.draft.availableMinorFactions,
              state.draft.settings.allowedFactions,
              bannedFactions,
            );

            state.draft.availableFactions = randomizeFactions(
              state.draft.settings.numFactions,
              draftableFactions,
              state.draft.settings.requiredFactions,
              state.draft.settings.factionStratification,
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
        stratifiedConfig: FactionStratification | undefined,
      ) =>
        set((state) => {
          let numFactions = Math.max(
            state.draft.settings.numFactions,
            requiredFactions.length,
            state.draft.players.length,
          );

          // override numFactions if stratifiedConfig is defined
          const numStratifiedFactions = Object.values(
            stratifiedConfig ?? {},
          ).reduce((acc, curr) => acc + curr, 0);

          if (numStratifiedFactions > 0) {
            numFactions = numStratifiedFactions;
          }

          const factionPool = getDraftableFactions(
            state.factionPool,
            state.draft.availableMinorFactions ?? [],
            availableFactions,
          );

          state.factionSettingsModal = false;
          state.draft.settings.numFactions = numFactions;
          state.draft.settings.requiredFactions = requiredFactions;
          state.draft.settings.allowedFactions = availableFactions;
          state.draft.settings.factionStratification = stratifiedConfig;
          state.draft.availableFactions = randomizeFactions(
            numFactions,
            factionPool,
            requiredFactions,
            stratifiedConfig,
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
            getDraftableFactions(
              state.factionPool,
              null,
              settings.allowedFactions,
            ),
            settings.requiredFactions,
            settings.factionStratification,
          );

          const numMinorFactions = settings.numMinorFactions;
          if (numMinorFactions) {
            const otherFactions = state.factionPool.filter(
              (f) => !draft.availableFactions.includes(f),
            );
            draft.availableMinorFactions = shuffle(
              otherFactions,
              numMinorFactions,
            );
          }

          // Generate map and slices using the utility function
          const generated = generateMapAndSlices(
            config,
            settings,
            state.systemPool,
          );
          if (generated) {
            draft.presetMap = generated.presetMap;
            draft.slices = generated.slices;
          } else {
            const slices = initializeSlices(settings, state.systemPool);
            if (slices) draft.slices = slices;

            draft.presetMap = initializeMap(
              settings,
              draft.slices,
              state.systemPool,
            );
          }

          // Set slice names using the utility function
          draft.slices = setSliceNames(draft.slices);

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

          draft.availableMinorFactions = shuffle(
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
        set(({ draft, factionPool }) => {
          draft.availableFactions = randomizeFactions(
            draft.settings.numFactions,
            getDraftableFactions(
              factionPool,
              draft.availableMinorFactions,
              draft.settings.allowedFactions,
            ),
            draft.settings.requiredFactions,
            draft.settings.factionStratification,
          );
        }),

      setNumFactionsToDraft: (num: number) =>
        set(({ draft }) => {
          draft.settings.numFactions = num;
        }),
      addRandomFaction: () =>
        set((state) => {
          if (state.draft.settings.factionStratification) {
            notifications.show({
              message: "Faction stratification was reset.",
              color: "blue",
            });
            state.draft.settings.factionStratification = undefined;
          }

          const { draft, factionPool } = state;
          const pool = state.draft.settings.allowedFactions ?? factionPool;
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
          if (draft.settings.factionStratification) {
            notifications.show({
              message: "Faction stratification was reset.",
              color: "blue",
            });
            draft.settings.factionStratification = undefined;
          }

          const availableFactions = draft.availableFactions.slice(0, -1);
          draft.settings.numFactions = availableFactions.length;
          draft.availableFactions = availableFactions;
        }),

      removeFaction: (id: FactionId) =>
        set(({ draft }) => {
          let confirmation = true;
          if (draft.settings.factionStratification) {
            notifications.show({
              message: "Faction stratification was reset.",
              color: "blue",
            });
            draft.settings.factionStratification = undefined;
          }

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
          const config = draftConfig[draft.settings.type];
          const generated = generateMapAndSlices(
            config,
            draft.settings,
            systemPool,
          );
          if (generated) {
            draft.presetMap = generated.presetMap;
            draft.slices = generated.slices;
            draft.slices = setSliceNames(draft.slices);
          }
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
            draft.settings.sliceGenerationConfig,
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

export function initializeSlices(
  settings: DraftSettings,
  systemPool: SystemId[],
) {
  const config = draftConfig[settings.type];
  if (!settings.randomizeSlices) return emptySlices(config, settings.numSlices);

  // Add sliceGenerationConfig with extended settings if available
  const rawSlices = config.generateSlices(
    settings.numSlices,
    systemPool,
    settings.sliceGenerationConfig ?? {
      maxOptimal: settings.maxOptimal,
      minOptimal: settings.minOptimal,
    },
  );

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

  const filteredSystemIds = shuffle(
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

/**
 * Returns a list of factions that can be used for a draft, considering all game settings that
 * may restrict the pool of factions.
 * @param fullFactionPool - The full list of factions available to the draft from the chosen game sets.
 * @param availableMinorFactions - The list of minor factions that are chosen (thus not available for draft).
 * @param allowedFactions - The list of factions that are allowed to be chosen. If null, all factions are allowed.
 * @returns A list of factions that can be used for a draft.
 */
export function getDraftableFactions(
  fullFactionPool: FactionId[],
  availableMinorFactions: FactionId[] | null = null,
  allowedFactions: FactionId[] | null = null,
  bannedFactions: FactionId[] | null = null,
) {
  const toPullFrom = allowedFactions ? allowedFactions : fullFactionPool;
  return toPullFrom.filter(
    (f) => !availableMinorFactions?.includes(f) && !bannedFactions?.includes(f),
  );
}

export function randomizeFactions(
  numFactions: number,
  factionPool: FactionId[],
  requiredFactions: FactionId[] | undefined,
  stratifiedConfig?: FactionStratification,
) {
  // Start with required factions
  const availableFactions = [...(requiredFactions ?? [])];

  // Behavior if no stratification is requested
  if (!stratifiedConfig || !factionGameSet) {
    const remainingToPull = numFactions - availableFactions.length;
    if (remainingToPull > 0) {
      availableFactions.push(
        ...shuffle(
          factionPool.filter((f) => !availableFactions.includes(f)),
        ).slice(0, remainingToPull),
      );
    }
    return availableFactions;
  }

  // Count how many required factions are already using up each group's quota
  const usedQuotas = availableFactions.reduce(
    (quotas, faction) => {
      const groupKey = Object.keys(stratifiedConfig).find((key) =>
        key.split("|").includes(factionGameSet(faction)),
      );

      if (groupKey) {
        return {
          ...quotas,
          [groupKey]: (quotas[groupKey] || 0) + 1,
        };
      }
      return quotas;
    },
    {} as { [key: string]: number },
  );

  // For each group, pull the remaining needed factions
  for (const [groupKey, targetCount] of Object.entries(stratifiedConfig)) {
    const gameSets = groupKey.split("|");
    const currentCount = usedQuotas[groupKey] || 0;
    const remainingNeeded = targetCount - currentCount;

    if (remainingNeeded > 0) {
      const toPullFrom = factionPool.filter(
        (f) =>
          gameSets.includes(factionGameSet(f)) && // Faction is from one of the game sets in this group
          !availableFactions.includes(f),
      );
      availableFactions.push(...shuffle(toPullFrom).slice(0, remainingNeeded));
    }
  }

  return availableFactions.slice(0, numFactions);
}

const factionGameSet = (faction: FactionId) => factions[faction].set;

// Helper functions to remove duplication
function generateMapAndSlices(
  config: DraftConfig,
  settings: DraftSettings,
  systemPool: SystemId[],
) {
  if (config.generateMap === undefined) return null;
  const generated = config.generateMap(settings, systemPool);
  if (!generated) return null;
  return {
    presetMap: generated.map,
    slices: systemIdsToSlices(config, generated.slices),
  };
}

function setSliceNames(slices: Slice[]) {
  const sliceLength = slices.length;
  const sliceNames = getRandomSliceNames(sliceLength);

  slices.forEach((slice, idx) => {
    slice.name = `Slice ${sliceNames[idx]}`;
  });

  return slices;
}
