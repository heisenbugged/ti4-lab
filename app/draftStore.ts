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
  DraftSelection,
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
import { getUsedSystemIdsInMap } from "./hooks/useUsedSystemIds";
import { atomWithStore } from "jotai-zustand";
import { createStore } from "zustand/vanilla";
import { getRandomSliceNames } from "./data/sliceWords";
import { shuffle } from "./draft/helpers/randomization";
import { factions } from "./data/factionData";
import { notifications } from "@mantine/notifications";
import { coreRerollSlice, coreRerollMap } from "./draft/common/sliceGenerator";
import { systemData } from "./data/systemData";

// Define SelectionType type based on the selection types used in the code
type SelectionType =
  | "SELECT_SLICE"
  | "SELECT_SPEAKER_ORDER"
  | "SELECT_FACTION"
  | "SELECT_MINOR_FACTION"
  | "SELECT_REFERENCE_CARD"
  | "SELECT_REFERENCE_CARD_PACK"
  | "SELECT_PLAYER_COLOR"
  | "SELECT_SEAT"
  | "BAN_FACTION";

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

  // Replay mode state
  replayMode: boolean;
  replayIndex?: number;
  replaySelections?: DraftSelection[];

  draftActions: {
    hydrate: (draftId: string, draftUrl: string, draft: Draft) => void;
    update: (draftId: string, draft: Draft) => void;
    setSelectedPlayer: (playerId: PlayerId) => void;
    selectSpeakerOrder: (playerId: number, speakerOrder: number) => void;
    selectSlice: (playerId: number, sliceIdx: number) => void;
    selectFaction: (playerId: number, factionId: FactionId) => void;
    selectMinorFaction: (playerId: number, minorFactionId: FactionId) => void;
    selectReferenceCard: (
      playerId: number,
      referenceFactionId: FactionId,
    ) => void;
    selectReferenceCardPack: (playerId: number, packIdx: number) => void;
    stagePriorityValue: (playerId: number, factionId: FactionId) => void;
    stageHomeSystem: (playerId: number, factionId: FactionId) => void;
    selectPlayerColor: (playerId: number, color: InGameColor) => void;
    selectSeat: (playerId: number, seatIdx: number) => void;
    banFaction: (playerId: PlayerId, factionId: FactionId) => void;
    undoLastSelection: () => void;
  };
  replayActions: {
    enableReplayMode: () => void;
    disableReplayMode: () => void;
    stepForward: () => void;
    stepBackward: () => void;
    jumpToStart: () => void;
    jumpToEnd: () => void;
    setReplayIndex: (index: number) => void;
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

    randomizeReferenceCardPacks: () => void;

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
  replayMode: false,
  replayIndex: undefined,
  replaySelections: undefined,
};

const makeSelection = (
  state: DraftV2State,
  type: SelectionType,
  playerId: number,
  payload: Omit<
    Extract<DraftSelection, { type: SelectionType }>,
    "type" | "playerId"
  >,
) => {
  const alreadySelected = state.draft.selections.find(
    (s) => s.playerId === playerId && s.type === type,
  );
  if (alreadySelected) return;

  state.draft.selections.push({
    type,
    playerId,
    ...payload,
  } as DraftSelection);
};

const resetStratification = (state: any) => {
  if (state.draft.settings.factionStratification) {
    notifications.show({
      message: "Faction stratification was reset.",
      color: "blue",
    });
    state.draft.settings.factionStratification = undefined;
  }
};

const addSystemToMap = (draft: Draft, tileIdx: number, system: System) => {
  draft.presetMap[tileIdx] = {
    idx: tileIdx,
    position: draft.presetMap[tileIdx].position,
    type: "SYSTEM",
    systemId: system.id,
    rotation: system.rotation,
  };
};

const addSystemToSlice = (
  draft: Draft,
  sliceIdx: number,
  tileIdx: number,
  system: System,
) => {
  draft.slices[sliceIdx].tiles[tileIdx] = {
    ...draft.slices[sliceIdx].tiles[tileIdx],
    type: "SYSTEM",
    systemId: system.id,
    rotation: system.rotation,
  };
};

const removeSystemFromMap = (draft: Draft, tileIdx: number) => {
  draft.presetMap[tileIdx] = {
    idx: tileIdx,
    position: draft.presetMap[tileIdx].position,
    type: "OPEN",
  };
};

const removeSystemFromSlice = (
  draft: Draft,
  sliceIdx: number,
  tileIdx: number,
) => {
  draft.slices[sliceIdx].tiles[tileIdx] = {
    ...draft.slices[sliceIdx].tiles[tileIdx],
    type: "OPEN",
  };
};

const setModalState = (
  state: DraftV2State,
  modalType: "factionSettings" | "planetFinder",
  isOpen: boolean,
  modalParams?: any,
) => {
  if (modalType === "factionSettings") {
    state.factionSettingsModal = isOpen;
  } else if (modalType === "planetFinder") {
    if (isOpen && modalParams) {
      state.planetFinderModal = modalParams;
    } else {
      state.planetFinderModal = undefined;
    }
  }
};

const getAvailableFactions = (
  pool: FactionId[],
  currentFactions: FactionId[],
  minorFactions?: FactionId[] | null,
) => {
  return pool.filter(
    (f) =>
      !currentFactions.includes(f) &&
      (!minorFactions || !minorFactions.includes(f)),
  );
};

const getAvailableSystems = (
  systemPool: SystemId[],
  usedIds: SystemId[],
  includeIds: SystemId[] = [],
) => {
  return systemPool.filter(
    (s) => !usedIds.includes(s) || includeIds.includes(s),
  );
};

const initializePools = (state: any, settings: DraftSettings) => {
  state.factionPool = getFactionPool(settings.factionGameSets);
  state.systemPool = getSystemPool(settings.tileGameSets);
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

          initializePools(state, draft.settings);
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
          makeSelection(state, "SELECT_SLICE", playerId, { sliceIdx });
        }),

      selectSpeakerOrder: (playerId: number, speakerOrder: number) =>
        set((state) => {
          makeSelection(state, "SELECT_SPEAKER_ORDER", playerId, {
            speakerOrder,
          });
        }),

      selectFaction: (playerId: number, factionId: FactionId) =>
        set((state) => {
          makeSelection(state, "SELECT_FACTION", playerId, { factionId });
        }),

      selectMinorFaction: (playerId: number, minorFactionId: FactionId) =>
        set((state) => {
          makeSelection(state, "SELECT_MINOR_FACTION", playerId, {
            minorFactionId,
          });
        }),

      selectReferenceCard: (playerId: number, referenceFactionId: FactionId) =>
        set((state) => {
          makeSelection(state, "SELECT_REFERENCE_CARD", playerId, {
            referenceFactionId,
          });
        }),

      selectReferenceCardPack: (playerId: number, packIdx: number) =>
        set((state) => {
          makeSelection(state, "SELECT_REFERENCE_CARD_PACK", playerId, {
            packIdx,
          });
        }),

      stagePriorityValue: (playerId: number, factionId: FactionId) =>
        set((state) => {
          if (!state.draft.stagingPriorityValues) {
            state.draft.stagingPriorityValues = {};
          }
          state.draft.stagingPriorityValues[playerId] = factionId;
        }),

      stageHomeSystem: (playerId: number, factionId: FactionId) =>
        set((state) => {
          if (!state.draft.stagingHomeSystemValues) {
            state.draft.stagingHomeSystemValues = {};
          }
          state.draft.stagingHomeSystemValues[playerId] = factionId;
        }),

      selectPlayerColor: (playerId: number, color: InGameColor) =>
        set((state) => {
          makeSelection(state, "SELECT_PLAYER_COLOR", playerId, { color });
        }),

      selectSeat: (playerId: number, seatIdx: number) =>
        set((state) => {
          makeSelection(state, "SELECT_SEAT", playerId, { seatIdx });
        }),

      banFaction: (playerId: PlayerId, factionId: FactionId) =>
        set((state) => {
          if (!state.draft.settings.modifiers?.banFactions) return;
          makeSelection(state, "BAN_FACTION", playerId, { factionId });

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
    replayActions: {
      enableReplayMode: () =>
        set((state) => {
          // Save original selections
          state.replaySelections = [...state.draft.selections];
          state.replayMode = true;
          state.replayIndex = 0;
          // Clear current selections to start from beginning
          state.draft.selections = [];
        }),

      disableReplayMode: () =>
        set((state) => {
          state.replayMode = false;
          state.replayIndex = undefined;
          state.replaySelections = undefined;
        }),

      stepForward: () =>
        set((state) => {
          if (!state.replayMode || !state.replaySelections) return;
          const nextIndex = (state.replayIndex ?? 0) + 1;
          if (nextIndex <= state.replaySelections.length) {
            state.replayIndex = nextIndex;
            state.draft.selections = state.replaySelections.slice(0, nextIndex);
          }
        }),

      stepBackward: () =>
        set((state) => {
          if (!state.replayMode || !state.replaySelections) return;
          const prevIndex = Math.max(0, (state.replayIndex ?? 0) - 1);
          state.replayIndex = prevIndex;
          state.draft.selections = state.replaySelections.slice(0, prevIndex);
        }),

      jumpToStart: () =>
        set((state) => {
          if (!state.replayMode || !state.replaySelections) return;
          state.replayIndex = 0;
          state.draft.selections = [];
        }),

      jumpToEnd: () =>
        set((state) => {
          if (!state.replayMode || !state.replaySelections) return;
          state.replayIndex = state.replaySelections.length;
          state.draft.selections = [...state.replaySelections];
        }),

      setReplayIndex: (index: number) =>
        set((state) => {
          if (!state.replayMode || !state.replaySelections) return;
          const clampedIndex = Math.max(
            0,
            Math.min(index, state.replaySelections.length),
          );
          state.replayIndex = clampedIndex;
          state.draft.selections = state.replaySelections.slice(
            0,
            clampedIndex,
          );
        }),
    },
    actions: {
      openFactionSettings: () =>
        set((state) => {
          setModalState(state, "factionSettings", true);
        }),

      closeFactionSettings: () =>
        set((state) => {
          setModalState(state, "factionSettings", false);
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

          setModalState(state, "factionSettings", false);
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
          initializePools(state, draft.settings);
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

          initializePools(state, settings);

          if (settings.draftGameMode === "twilightsFall") {
            draft.availableFactions = state.factionPool;
            draft.availableReferenceCardPacks = generateReferenceCardPacks(
              settings.numReferenceCardPacks ?? players.length,
            );
          } else {
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
          }

          const minorFactionPool = getDraftableFactions(
            state.factionPool,
            draft.availableFactions,
          );

          const numMinorFactions = settings.numMinorFactions;
          if (numMinorFactions) {
            draft.availableMinorFactions = shuffle(
              minorFactionPool,
              numMinorFactions,
            );
          }

          // Generate map and slices using the utility function
          // Check for pre-seeded slices and map from map generator
          if (settings.presetSlices && settings.presetMap) {
            // Use pre-seeded slices from map generator
            draft.slices = systemIdsToSlices(
              config,
              settings.presetSlices,
              settings.sliceGenerationConfig?.entropicScarValue,
            );
            draft.presetMap = settings.presetMap;
          } else if (config.generateMap) {
            const generated = generateMapAndSlices(
              config,
              settings,
              state.systemPool,
              minorFactionPool,
            );
            if (generated) {
              draft.presetMap = generated.presetMap;
              draft.slices = generated.slices;
            }
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
          const availableFactions = getAvailableFactions(
            factionPool,
            draft.availableFactions,
          );

          draft.availableMinorFactions = shuffle(
            availableFactions,
            draft.settings.numMinorFactions,
          );
        }),

      addRandomMinorFaction: () =>
        set(({ draft, factionPool }) => {
          if (!draft.settings.numMinorFactions) return;
          const availableMinorFactions = getAvailableFactions(
            factionPool,
            draft.availableFactions,
            draft.availableMinorFactions,
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

      randomizeReferenceCardPacks: () =>
        set(({ draft }) => {
          if (draft.settings.draftGameMode !== "twilightsFall") return;
          draft.availableReferenceCardPacks = generateReferenceCardPacks(
            draft.settings.numReferenceCardPacks ?? draft.players.length,
          );
        }),

      // faction actions
      randomizeFactions: () =>
        set(({ draft, factionPool }) => {
          const takenFactions = getTakenNonPrimaryFactions(draft);

          draft.availableFactions = randomizeFactions(
            draft.settings.numFactions,
            getDraftableFactions(
              factionPool,
              takenFactions,
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
          resetStratification(state);

          const { draft, factionPool } = state;
          const pool = state.draft.settings.allowedFactions ?? factionPool;
          const availableFactions = getAvailableFactions(
            pool,
            [...getTakenNonPrimaryFactions(draft), ...draft.availableFactions],
            draft.availableMinorFactions,
          );
          if (availableFactions.length === 0) {
            notifications.show({
              message: "No available factions",
              color: "red",
            });
            return;
          }

          const idx = Math.floor(Math.random() * availableFactions.length);
          draft.availableFactions.push(availableFactions[idx]);
          draft.settings.numFactions += 1;
        }),

      removeLastFaction: () =>
        set(({ draft }) => {
          resetStratification({ draft });

          const availableFactions = draft.availableFactions.slice(0, -1);
          draft.settings.numFactions = availableFactions.length;
          draft.availableFactions = availableFactions;
        }),

      removeFaction: (id: FactionId) =>
        set(({ draft }) => {
          resetStratification({ draft });

          draft.settings.numFactions = draft.availableFactions.length - 1;
          draft.availableFactions = draft.availableFactions.filter(
            (f) => f !== id,
          );
        }),

      // planet finder actions
      openPlanetFinderForMap: (tileIdx: number) =>
        set((state) => {
          setModalState(state, "planetFinder", true, {
            mode: "map",
            tileIdx,
          });
        }),

      openPlanetFinderForSlice: (sliceIdx: number, tileIdx: number) =>
        set((state) => {
          setModalState(state, "planetFinder", true, {
            mode: "slice",
            sliceIdx,
            tileIdx,
          });
        }),

      closePlanetFinder: () =>
        set((state) => {
          setModalState(state, "planetFinder", false);
        }),

      // system actions
      addSystemToMap: (tileIdx: number, system: System) =>
        set(({ draft }) => {
          addSystemToMap(draft, tileIdx, system);
        }),
      removeSystemFromMap: (tileIdx: number) =>
        set(({ draft }) => {
          removeSystemFromMap(draft, tileIdx);
        }),

      // slice actions
      addSystemToSlice: (sliceIdx: number, tileIdx: number, system: System) =>
        set(({ draft }) => {
          addSystemToSlice(draft, sliceIdx, tileIdx, system);
        }),
      removeSystemFromSlice: (sliceIdx: number, tileIdx: number) =>
        set(({ draft }) => {
          removeSystemFromSlice(draft, sliceIdx, tileIdx);
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
        set(({ draft, systemPool, factionPool }) => {
          const config = draftConfig[draft.settings.type];
          const minorFactionPool = getDraftableFactions(
            factionPool,
            draft.availableFactions,
          );

          const generated = generateMapAndSlices(
            config,
            draft.settings,
            systemPool,
            minorFactionPool,
          );

          if (generated) {
            draft.presetMap = generated.presetMap;
            draft.slices = generated.slices;
            draft.slices = setSliceNames(draft.slices);
          }
        }),

      randomizeMap: () =>
        set(({ draft }) => {
          const result = coreRerollMap(
            draft.settings,
            draft.slices.map((slice) => systemIdsInSlice(slice)),
          );

          if (!result) {
            notifications.show({
              message:
                "Could not generate a valid slice with the given parameters",
              color: "red",
            });
            return;
          }

          if (!result.valid) {
            notifications.show({
              message: "Generated slice may not be optimal",
              color: "yellow",
            });
          }

          draft.presetMap = result.map;
        }),

      randomizeSlice: (sliceIdx: number) =>
        set(({ draft, factionPool }) => {
          // Convert slices to raw system ID arrays for coreRerollSlice
          const slicesAsSystemIds = draft.slices.map((slice) =>
            systemIdsInSlice(slice),
          );

          const minorFactionPool = getDraftableFactions(
            factionPool,
            draft.availableFactions,
          );

          // Call coreRerollSlice to generate a new slice
          const result = coreRerollSlice(
            draft.settings,
            draft.presetMap,
            slicesAsSystemIds,
            sliceIdx,
            minorFactionPool,
          );

          // Handle the result
          if (!result) {
            notifications.show({
              message:
                "Could not generate a valid slice with the given parameters",
              color: "red",
            });
            return;
          }

          // Update the slice with the newly generated one
          draft.slices[sliceIdx] = systemIdsToSlice(
            draftConfig[draft.settings.type],
            draft.slices[sliceIdx].name,
            result.slice,
          );

          if (!result.valid) {
            notifications.show({
              message: "Generated slice may not be optimal",
              color: "yellow",
            });
          }
        }),

      randomizeSlices: () =>
        set(({ draft, systemPool, factionPool }) => {
          const config = draftConfig[draft.settings.type];
          const usedIds = getUsedSystemIdsInMap(draft.presetMap);
          const availableSystems = getAvailableSystems(systemPool, usedIds);

          const minorFactionPool = getDraftableFactions(
            factionPool,
            draft.availableFactions,
          );

          const rawSlices = config.generateSlices(
            draft.settings.numSlices,
            availableSystems,
            {
              ...draft.settings.sliceGenerationConfig,
              minorFactionPool,
            },
          );

          if (rawSlices) {
            draft.slices = systemIdsToSlices(
              config,
              rawSlices,
              draft.settings.sliceGenerationConfig?.entropicScarValue,
            );
            draft.slices = setSliceNames(draft.slices);
          }
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
  return systemIdsToSlices(
    config,
    rawSlices,
    settings.sliceGenerationConfig?.entropicScarValue,
  );
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

function generateMapAndSlices(
  config: DraftConfig,
  settings: DraftSettings,
  systemPool: SystemId[],
  minorFactionPool?: FactionId[],
) {
  if (config.generateMap === undefined) return null;
  const generated = config.generateMap(settings, systemPool, minorFactionPool);
  if (!generated) return null;

  return {
    presetMap: generated.map,
    slices: systemIdsToSlices(
      config,
      generated.slices,
      settings.sliceGenerationConfig?.entropicScarValue,
    ),
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

function getTakenNonPrimaryFactions(draft: Draft): FactionId[] {
  const factionsOnMap = draft.presetMap
    .map((tile) => {
      if (tile.type !== "SYSTEM") return;
      return systemData[tile.systemId].faction;
    })
    .filter((faction) => faction !== undefined);

  const factionsInSlices = draft.slices
    .map((slice) =>
      slice.tiles.map((tile) => {
        if (tile.type !== "SYSTEM") return;
        return systemData[tile.systemId].faction;
      }),
    )
    .flat()
    .filter((faction) => faction !== undefined);

  const takenFactions = [
    ...factionsOnMap,
    ...factionsInSlices,
    ...(draft.availableMinorFactions ?? []),
  ];

  return takenFactions;
}

function generateReferenceCardPacks(numPlayers: number): FactionId[][] {
  const referenceCardFactionPool = getFactionPool(["base", "pok", "te"]).filter(
    (f) => f !== "keleres",
  );
  const numPacks = numPlayers;
  const shuffledFactions = shuffle(referenceCardFactionPool, numPacks * 3);
  const referenceCardPacks: FactionId[][] = [];
  for (let i = 0; i < numPacks; i++) {
    const pack = shuffledFactions.slice(i * 3, i * 3 + 3);
    if (pack.length === 3) {
      referenceCardPacks.push(pack);
    }
  }
  return referenceCardPacks;
}
