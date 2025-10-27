import { create } from "zustand";
import { immer } from "zustand/middleware/immer";
import {
  Player,
  GameSet,
  FactionId,
  FactionStratification,
  MinorFactionsMode,
} from "~/types";
import { getFactionCount } from "~/data/factionData";
import { MAPS, type ChoosableDraftType } from "./maps";
import { getFactionPool } from "~/utils/factions";
import { notifications } from "@mantine/notifications";
import {
  validateFactionState,
  calculateFactionConstraints,
  FACTION_DEFAULTS,
  type FactionConstraints,
  type FactionNotification,
} from "./validation";
import { filterFactionList } from "./utils";

type ContentFlags = {
  excludeBaseFactions: boolean;
  excludePokFactions: boolean;
  withDiscordant: boolean;
  withDiscordantExp: boolean;
  withUnchartedStars: boolean;
  withDrahn: boolean;
  withTE: boolean;
};

const showFactionNotifications = (notifs: FactionNotification[]) => {
  if (notifs.length === 0) return;

  const message = notifs.map((n) => n.message).join("\n");
  notifications.show({
    message,
    color: "blue",
  });
};

type DraftSetupStore = {
  validateSetup: () => void;
  player: {
    players: Player[];
    add: () => void;
    remove: () => void;
    changeName: (playerIdx: number, name: string) => void;
    setPlayers: (players: Player[]) => void;
  };
  map: {
    selectedMapType: ChoosableDraftType;
    setSelectedMapType: (mapType: ChoosableDraftType) => void;
  };
  slices: {
    numSlices: number;
    setNumSlices: (num: number) => void;
  };
  content: {
    flags: ContentFlags;
    setExcludeBaseFactions: (v: boolean) => void;
    setExcludePokFactions: (v: boolean) => void;
    setWithDiscordantExp: (v: boolean) => void;
    setWithUnchartedStars: (v: boolean) => void;
    setWithDrahn: (v: boolean) => void;
    setWithTE: (v: boolean) => void;
    toggleDiscordantStars: () => void;
    getTileGameSets: () => GameSet[];
    getFactionGameSets: () => GameSet[];
  };
  format: {
    draftSpeaker: boolean;
    banFactions: boolean;
    draftPlayerColors: boolean;
    allowEmptyTiles: boolean;
    allowHomePlanetSearch: boolean;
    setDraftSpeaker: (v: boolean) => void;
    setBanFactions: (v: boolean) => void;
    setDraftPlayerColors: (v: boolean) => void;
    setAllowEmptyTiles: (v: boolean) => void;
    setAllowHomePlanetSearch: (v: boolean) => void;
  };
  multidraft: {
    isMultidraft: boolean;
    numDrafts: number;
    setIsMultidraft: (v: boolean) => void;
    setNumDrafts: (num: number) => void;
  };
  faction: {
    numFactions: number;
    minorFactionsMode: MinorFactionsMode | undefined;
    preassignedFactions: number | undefined;
    allowedFactions: FactionId[] | undefined;
    requiredFactions: FactionId[] | undefined;
    stratifiedConfig: FactionStratification | undefined;

    setNumFactions: (num: number) => void;
    incrementNumFactions: () => void;
    decrementNumFactions: () => void;
    toggleMinorFactions: () => void;
    setMinorFactionsMode: (mode: "random" | "shared" | "separate") => void;
    incrementMinorFactions: () => void;
    decrementMinorFactions: () => void;
    togglePreassignedFactions: () => void;
    incrementPreassignedFactions: (increment?: number) => void;
    decrementPreassignedFactions: (decrement?: number) => void;
    resetSettings: () => void;
    setStratification: (
      allowed: FactionId[] | undefined,
      required: FactionId[] | undefined,
      stratified: FactionStratification | undefined,
    ) => void;

    getMaxFactionCount: () => number;
    getFactionConstraints: () => FactionConstraints;
    getFactionBudget: () => {
      maxAvailable: number;
      usedByRegular: number;
      usedByMinor: number;
      remaining: number;
    };
  };
};

export const useDraftSetup = create<DraftSetupStore>()(
  immer((set, get) => {
    const applyFactionValidation = () => {
      set((state) => {
        const playerCount = state.player.players.length;
        const maxFactionCount = getFactionCount(
          get().content.getFactionGameSets(),
        );
        const currentGameSets = get().content.getFactionGameSets();

        const result = validateFactionState(
          playerCount,
          maxFactionCount,
          currentGameSets,
          {
            numFactions: state.faction.numFactions,
            minorFactionsMode: state.faction.minorFactionsMode,
            preassignedFactions: state.faction.preassignedFactions,
            stratifiedConfig: state.faction.stratifiedConfig,
          },
        );

        state.faction.numFactions = result.numFactions;
        state.faction.stratifiedConfig = result.stratifiedConfig;
        state.faction.preassignedFactions = result.preassignedFactions;
        state.faction.minorFactionsMode = result.minorFactionsMode;

        if (result.notifications.length > 0) {
          showFactionNotifications(result.notifications);
        }
      });
    };

    const setAndValidate = (fn: (state: DraftSetupStore) => void) => {
      set(fn);
      get().validateSetup();
    };

    return {
      validateSetup: () => {
        set((state) => {
          const playerCount = state.player.players.length;

          if (state.slices.numSlices < playerCount) {
            state.slices.numSlices = playerCount;
          }

          const currentMap = MAPS[state.map.selectedMapType];
          if (currentMap && currentMap.playerCount !== playerCount) {
            const newMapType = (Object.keys(MAPS).find(
              (key) =>
                MAPS[key as ChoosableDraftType].playerCount === playerCount,
            ) || state.map.selectedMapType) as ChoosableDraftType;

            state.map.selectedMapType = newMapType;

            state.format.allowEmptyTiles = false;
            state.format.allowHomePlanetSearch = false;
            state.format.draftSpeaker =
              newMapType === "heisen" || newMapType === "heisen8p";
          }

          const currentFactionPool = getFactionPool(
            get().content.getFactionGameSets(),
          );
          state.faction.allowedFactions = filterFactionList(
            state.faction.allowedFactions,
            currentFactionPool,
          );
          state.faction.requiredFactions = filterFactionList(
            state.faction.requiredFactions,
            currentFactionPool,
          );
        });

        applyFactionValidation();
      },

      player: {
        players: Array(6)
          .fill(null)
          .map((_, i) => ({
            id: i,
            name: "",
          })),

        add: () => {
          setAndValidate((state) => {
            const numPlayers = state.player.players.length;

            state.player.players.push({
              id: numPlayers,
              name: "",
            });
          });
        },

        remove: () => {
          setAndValidate((state) => {
            state.player.players.pop();
          });
        },

        changeName: (playerIdx: number, name: string) =>
          set((state) => {
            const player = state.player.players.find((p) => p.id === playerIdx);
            if (player) {
              player.name = name;
            }
          }),

        setPlayers: (players: Player[]) =>
          set((state) => {
            state.player.players = players;
          }),
      },

      map: {
        selectedMapType: "milty",

        setSelectedMapType: (mapType: ChoosableDraftType) => {
          setAndValidate((state) => {
            state.map.selectedMapType = mapType;

            // Reset all faction-related settings when map type changes
            const playerCount = state.player.players.length;
            state.faction.numFactions = playerCount;
            state.faction.minorFactionsMode = undefined;
            state.faction.preassignedFactions = undefined;
            state.faction.stratifiedConfig = undefined;

            // Side effects when map type changes
            state.format.allowEmptyTiles = false;
            state.format.allowHomePlanetSearch = false;
            state.format.draftSpeaker =
              mapType === "heisen" || mapType === "heisen8p";
          });
        },
      },

      slices: {
        numSlices: 6,

        setNumSlices: (num: number) => {
          setAndValidate((state) => {
            state.slices.numSlices = num;
          });
        },
      },

      content: {
        flags: {
          excludeBaseFactions: false,
          excludePokFactions: false,
          withDiscordant: false,
          withDiscordantExp: false,
          withUnchartedStars: false,
          withDrahn: false,
          withTE: false,
        },

        setExcludeBaseFactions: (v: boolean) => {
          setAndValidate((state) => {
            state.content.flags.excludeBaseFactions = v;
          });
        },

        setExcludePokFactions: (v: boolean) => {
          setAndValidate((state) => {
            state.content.flags.excludePokFactions = v;
          });
        },

        setWithDiscordantExp: (v: boolean) => {
          setAndValidate((state) => {
            state.content.flags.withDiscordantExp = v;
          });
        },

        setWithUnchartedStars: (v: boolean) => {
          setAndValidate((state) => {
            state.content.flags.withUnchartedStars = v;
          });
        },

        setWithDrahn: (v: boolean) => {
          setAndValidate((state) => {
            state.content.flags.withDrahn = v;
          });
        },

        setWithTE: (v: boolean) => {
          setAndValidate((state) => {
            state.content.flags.withTE = v;
          });
        },

        toggleDiscordantStars: () => {
          setAndValidate((state) => {
            state.content.flags.withDiscordant =
              !state.content.flags.withDiscordant;

            // Update dependent flags based on withDiscordant state
            if (state.content.flags.withDiscordant) {
              // When discordant is on, enable dependent flags
              state.content.flags.withDiscordantExp = true;
              state.content.flags.withUnchartedStars = true;
            } else {
              // When discordant is off, dependent flags must be off
              state.content.flags.withDiscordantExp = false;
              state.content.flags.withUnchartedStars = false;
              state.content.flags.excludeBaseFactions = false;
              state.content.flags.excludePokFactions = false;
            }
          });
        },

        getTileGameSets: () => {
          const { flags } = get().content;
          const tileGameSets: GameSet[] = ["base", "pok"];
          if (flags.withDiscordant) tileGameSets.push("discordant");
          if (flags.withDiscordantExp) tileGameSets.push("discordantexp");
          if (flags.withUnchartedStars) tileGameSets.push("unchartedstars");
          if (flags.withTE) tileGameSets.push("te");
          return tileGameSets;
        },

        getFactionGameSets: () => {
          const { flags } = get().content;
          const factionGameSets: GameSet[] = [];
          if (!flags.excludeBaseFactions) factionGameSets.push("base");
          if (!flags.excludePokFactions) factionGameSets.push("pok");
          if (flags.withDiscordant) factionGameSets.push("discordant");
          if (flags.withDiscordantExp) factionGameSets.push("discordantexp");
          if (flags.withTE) factionGameSets.push("te");
          if (flags.withDrahn) factionGameSets.push("drahn");
          return factionGameSets;
        },
      },

      format: {
        draftSpeaker: false,
        banFactions: false,
        draftPlayerColors: false,
        allowEmptyTiles: false,
        allowHomePlanetSearch: false,

        setDraftSpeaker: (v: boolean) => {
          setAndValidate((state) => {
            state.format.draftSpeaker = v;
          });
        },

        setBanFactions: (v: boolean) => {
          setAndValidate((state) => {
            state.format.banFactions = v;
          });
        },

        setDraftPlayerColors: (v: boolean) => {
          setAndValidate((state) => {
            state.format.draftPlayerColors = v;
          });
        },

        setAllowEmptyTiles: (v: boolean) => {
          setAndValidate((state) => {
            state.format.allowEmptyTiles = v;
          });
        },

        setAllowHomePlanetSearch: (v: boolean) => {
          setAndValidate((state) => {
            state.format.allowHomePlanetSearch = v;
          });
        },
      },

      multidraft: {
        isMultidraft: false,
        numDrafts: 2,

        setIsMultidraft: (v: boolean) => {
          setAndValidate((state) => {
            state.multidraft.isMultidraft = v;
          });
        },

        setNumDrafts: (num: number) => {
          setAndValidate((state) => {
            state.multidraft.numDrafts = num;
          });
        },
      },

      faction: {
        // Initial state - start with 6 players worth of factions
        numFactions: 6,
        minorFactionsMode: undefined,
        preassignedFactions: undefined,
        allowedFactions: undefined,
        requiredFactions: undefined,
        stratifiedConfig: undefined,

        // Computed getters
        getMaxFactionCount: () => {
          const factionGameSets = get().content.getFactionGameSets();
          return getFactionCount(factionGameSets);
        },

        getFactionConstraints: () => {
          const playerCount = get().player.players.length;
          const maxFactionCount = get().faction.getMaxFactionCount();
          const {
            numFactions,
            minorFactionsMode,
            preassignedFactions,
            stratifiedConfig,
          } = get().faction;

          return calculateFactionConstraints(
            playerCount,
            maxFactionCount,
            {
              numFactions,
              minorFactionsMode,
              preassignedFactions,
            },
            stratifiedConfig,
          );
        },

        getFactionBudget: () => {
          const { numFactions, minorFactionsMode } = get().faction;
          const maxAvailable = get().faction.getMaxFactionCount();
          const usedByMinor =
            minorFactionsMode?.mode === "separatePool"
              ? minorFactionsMode.numMinorFactions
              : 0;
          const usedByRegular = numFactions;
          const remaining = maxAvailable - usedByRegular - usedByMinor;

          return {
            maxAvailable,
            usedByRegular,
            usedByMinor,
            remaining,
          };
        },

        // Helper to apply constraints to numFactions
        applyConstraints: (targetNumFactions: number) => {
          const constraints = get().faction.getFactionConstraints();
          return Math.min(
            Math.max(targetNumFactions, constraints.minNumFactions),
            constraints.maxNumFactions,
          );
        },

        setNumFactions: (num: number) => {
          setAndValidate((state) => {
            // Only allow manual adjustment if not locked
            const constraints = get().faction.getFactionConstraints();
            if (constraints.canManuallyAdjust) {
              state.faction.numFactions = num;
            }
          });
        },

        incrementNumFactions: () => {
          setAndValidate((state) => {
            const constraints = get().faction.getFactionConstraints();
            // Only increment if can manually adjust and not at max
            if (
              constraints.canManuallyAdjust &&
              state.faction.numFactions < constraints.maxNumFactions
            ) {
              state.faction.numFactions += 1;
            }
          });
        },

        decrementNumFactions: () => {
          setAndValidate((state) => {
            const constraints = get().faction.getFactionConstraints();
            // Only decrement if can manually adjust and not at min
            if (
              constraints.canManuallyAdjust &&
              state.faction.numFactions > constraints.minNumFactions
            ) {
              state.faction.numFactions -= 1;
            }
          });
        },

        toggleMinorFactions: () => {
          setAndValidate((state) => {
            if (!state.faction.minorFactionsMode) {
              // Turning on minor factions
              state.faction.minorFactionsMode = { mode: "random" };
              state.format.allowEmptyTiles = true;
            } else {
              // Turning off minor factions
              state.faction.minorFactionsMode = undefined;
              state.format.allowEmptyTiles = false;
            }
          });
        },

        setMinorFactionsMode: (mode: "random" | "shared" | "separate") => {
          setAndValidate((state) => {
            const playerCount = state.player.players.length;

            switch (mode) {
              case "random":
                state.faction.minorFactionsMode = { mode: "random" };
                state.format.allowEmptyTiles = true;
                break;
              case "shared":
                state.faction.minorFactionsMode = { mode: "sharedPool" };
                // numFactions will be set by validation
                break;
              case "separate":
                state.faction.minorFactionsMode = {
                  mode: "separatePool",
                  numMinorFactions: playerCount,
                };
                state.format.allowEmptyTiles = true;
                break;
            }
          });
        },

        incrementMinorFactions: () => {
          setAndValidate((state) => {
            if (state.faction.minorFactionsMode?.mode === "separatePool") {
              const constraints = get().faction.getFactionConstraints();
              if (
                state.faction.minorFactionsMode.numMinorFactions <
                constraints.maxMinorFactions
              ) {
                state.faction.minorFactionsMode.numMinorFactions += 1;
              }
            }
          });
        },

        decrementMinorFactions: () => {
          setAndValidate((state) => {
            if (state.faction.minorFactionsMode?.mode === "separatePool") {
              const constraints = get().faction.getFactionConstraints();
              if (
                state.faction.minorFactionsMode.numMinorFactions >
                constraints.minMinorFactions
              ) {
                state.faction.minorFactionsMode.numMinorFactions -= 1;
              }
            }
          });
        },

        togglePreassignedFactions: () => {
          setAndValidate((state) => {
            if (state.faction.preassignedFactions === undefined) {
              state.faction.preassignedFactions =
                FACTION_DEFAULTS.DEFAULT_PREASSIGNED;
            } else {
              state.faction.preassignedFactions = undefined;
            }
          });
        },

        incrementPreassignedFactions: (increment = 1) => {
          setAndValidate((state) => {
            if (state.faction.preassignedFactions !== undefined) {
              const constraints = get().faction.getFactionConstraints();
              const newValue = Math.min(
                state.faction.preassignedFactions + increment,
                constraints.maxPreassignedFactions,
              );
              state.faction.preassignedFactions = newValue;
            }
          });
        },

        decrementPreassignedFactions: (decrement = 1) => {
          setAndValidate((state) => {
            if (state.faction.preassignedFactions !== undefined) {
              const constraints = get().faction.getFactionConstraints();
              const newValue = Math.max(
                state.faction.preassignedFactions - decrement,
                constraints.minPreassignedFactions,
              );
              state.faction.preassignedFactions = newValue;
            }
          });
        },

        resetSettings: () => {
          setAndValidate((state) => {
            const playerCount = state.player.players.length;
            state.faction.numFactions = playerCount;
            state.faction.minorFactionsMode = undefined;
            state.faction.preassignedFactions = undefined;
          });
        },

        setStratification: (allowed, required, stratified) => {
          setAndValidate((state) => {
            state.faction.allowedFactions = allowed;
            state.faction.requiredFactions = required;
            state.faction.stratifiedConfig = stratified;
          });
        },
      },
    };
  }),
);
