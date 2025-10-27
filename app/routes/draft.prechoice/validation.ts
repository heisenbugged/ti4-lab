import type {
  GameSet,
  FactionStratification,
  MinorFactionsMode,
} from "~/types";

// Constants
export const FACTION_DEFAULTS = {
  MIN_PREASSIGNED: 1,
  DEFAULT_PREASSIGNED: 2,
} as const;

// Notification types for faction validation
export type FactionNotification = {
  type:
    | "stratificationReset"
    | "stratificationFiltered"
    | "factionsAdjusted"
    | "settingPrevented"
    | "minorFactionsAdjusted";
  message: string;
};

// Validation result type
export type FactionValidationResult = {
  numFactions: number;
  stratifiedConfig: FactionStratification | undefined;
  preassignedFactions: number | undefined;
  minorFactionsMode: MinorFactionsMode | undefined;
  notifications: FactionNotification[];
};

// Faction state types
export type FactionCountState = {
  numFactions: number;
  minorFactionsMode: MinorFactionsMode | undefined;
  preassignedFactions: number | undefined;
};

// Derived UI constraints for factions
export type FactionConstraints = {
  // For numFactions
  minNumFactions: number;
  maxNumFactions: number;
  canManuallyAdjust: boolean; // False if preassigned or shared pool active

  // For preassigned
  minPreassignedFactions: number;
  maxPreassignedFactions: number;
  canEnablePreassigned: boolean; // False if conflicts with stratification or minor shared

  // For minor factions
  minMinorFactions: number;
  maxMinorFactions: number;
};

// Helper: Calculate stratified total
export const getStratifiedTotal = (
  config: FactionStratification | undefined,
): number => {
  if (!config) return 0;
  return Object.values(config).reduce((acc, curr) => acc + curr, 0);
};

// Helper: Validate stratification keys against current game sets
export const areStratificationKeysValid = (
  config: FactionStratification,
  currentGameSets: GameSet[],
): boolean => {
  return Object.keys(config).every((key) => {
    if (key === "te") {
      return currentGameSets.includes("te");
    }
    const gameSetsInKey = key.split("|") as GameSet[];
    return gameSetsInKey.every((gs) => currentGameSets.includes(gs));
  });
};

// Centralized faction state validation
// Priority: Minor Factions > Stratification > Preassigned > Manual
export const validateFactionState = (
  playerCount: number,
  maxFactionCount: number,
  currentGameSets: GameSet[],
  currentState: {
    numFactions: number;
    minorFactionsMode: MinorFactionsMode | undefined;
    preassignedFactions: number | undefined;
    stratifiedConfig: FactionStratification | undefined;
  },
): FactionValidationResult => {
  const notifs: FactionNotification[] = [];
  let numFactions = currentState.numFactions;
  let minorFactionsMode = currentState.minorFactionsMode;
  let preassignedFactions = currentState.preassignedFactions;
  let stratifiedConfig = currentState.stratifiedConfig;

  // Step 1: Validate Minor Factions Mode (Highest Priority)
  if (minorFactionsMode?.mode === "sharedPool") {
    // Shared pool forces numFactions = playerCount * 2
    const requiredFactions = playerCount * 2;
    if (requiredFactions > maxFactionCount) {
      // Clamp to max available
      numFactions = maxFactionCount;
      notifs.push({
        type: "minorFactionsAdjusted",
        message: `Shared pool requires ${requiredFactions} factions but only ${maxFactionCount} available. Using ${maxFactionCount}.`,
      });
    } else {
      numFactions = requiredFactions;
    }

    // Shared pool incompatible with preassigned and stratification
    if (preassignedFactions !== undefined) {
      preassignedFactions = undefined;
      notifs.push({
        type: "settingPrevented",
        message:
          "Faction bags disabled (incompatible with shared pool minor factions).",
      });
    }
    if (stratifiedConfig !== undefined) {
      stratifiedConfig = undefined;
      notifs.push({
        type: "stratificationReset",
        message:
          "Stratification reset (incompatible with shared pool minor factions).",
      });
    }
  } else if (minorFactionsMode?.mode === "separatePool") {
    // Validate separate pool count
    const minMinor = playerCount;
    const maxMinor = maxFactionCount - playerCount; // Leave room for regular factions

    if (minorFactionsMode.numMinorFactions < minMinor) {
      minorFactionsMode = {
        ...minorFactionsMode,
        numMinorFactions: minMinor,
      };
      notifs.push({
        type: "minorFactionsAdjusted",
        message: `Minor factions adjusted to ${minMinor} (minimum for ${playerCount} players).`,
      });
    } else if (minorFactionsMode.numMinorFactions > maxMinor) {
      minorFactionsMode = {
        ...minorFactionsMode,
        numMinorFactions: maxMinor,
      };
      notifs.push({
        type: "minorFactionsAdjusted",
        message: `Minor factions reduced to ${maxMinor} (maximum available).`,
      });
    }
  }

  // Recalculate reservation after minor factions validation
  const finalMinorReserved =
    minorFactionsMode?.mode === "separatePool"
      ? minorFactionsMode.numMinorFactions
      : 0;

  // Step 2: Validate Stratification (Second Priority)
  if (
    stratifiedConfig !== undefined &&
    minorFactionsMode?.mode !== "sharedPool"
  ) {
    // Check if all keys in stratification are valid
    if (!areStratificationKeysValid(stratifiedConfig, currentGameSets)) {
      stratifiedConfig = undefined;
      notifs.push({
        type: "stratificationReset",
        message: "Stratification reset (game sets changed).",
      });
    }

    // Calculate required factions from stratification
    if (stratifiedConfig !== undefined) {
      const stratifiedTotal = getStratifiedTotal(stratifiedConfig);
      const maxAvailableForStratification =
        maxFactionCount - finalMinorReserved;

      if (stratifiedTotal > maxAvailableForStratification) {
        // Can't fit stratification with current game sets and minor factions
        stratifiedConfig = undefined;
        notifs.push({
          type: "stratificationReset",
          message: `Stratification reset (requires ${stratifiedTotal} factions but only ${maxAvailableForStratification} available).`,
        });
      } else if (stratifiedTotal > numFactions) {
        // Increase numFactions to meet stratification requirement
        numFactions = stratifiedTotal;
        notifs.push({
          type: "factionsAdjusted",
          message: `Faction count increased to ${numFactions} to meet stratification requirements.`,
        });
      }
    }
  }

  // Step 3: Validate Preassigned Factions (Third Priority)
  if (
    preassignedFactions !== undefined &&
    minorFactionsMode?.mode !== "sharedPool"
  ) {
    const calculatedTotal = preassignedFactions * playerCount;
    const maxAvailable = maxFactionCount - finalMinorReserved;
    const stratifiedTotal = getStratifiedTotal(stratifiedConfig);

    // Check conflicts
    if (calculatedTotal > maxAvailable) {
      preassignedFactions = undefined;
      notifs.push({
        type: "settingPrevented",
        message: `Faction bags disabled (${calculatedTotal} required but only ${maxAvailable} available).`,
      });
    } else if (calculatedTotal < stratifiedTotal) {
      preassignedFactions = undefined;
      notifs.push({
        type: "settingPrevented",
        message: `Faction bags disabled (conflicts with stratification requiring ${stratifiedTotal} factions).`,
      });
    } else {
      // Valid - set numFactions to at least the stratification total
      numFactions = Math.max(calculatedTotal, stratifiedTotal);
    }
  }

  // Step 4: Validate Manual numFactions (Lowest Priority)
  if (
    minorFactionsMode?.mode !== "sharedPool" &&
    preassignedFactions === undefined
  ) {
    const stratifiedTotal = getStratifiedTotal(stratifiedConfig);
    const minRequired = Math.max(playerCount, stratifiedTotal);
    const maxAvailable = maxFactionCount - finalMinorReserved;

    // Clamp numFactions
    if (numFactions < minRequired) {
      numFactions = minRequired;
    } else if (numFactions > maxAvailable) {
      numFactions = maxAvailable;
    }
  }

  return {
    numFactions,
    stratifiedConfig,
    preassignedFactions,
    minorFactionsMode,
    notifications: notifs,
  };
};

export const calculateFactionConstraints = (
  playerCount: number,
  maxFactionCount: number,
  factionState: FactionCountState,
  stratifiedConfig?: FactionStratification,
): FactionConstraints => {
  const minorReserved =
    factionState.minorFactionsMode?.mode === "separatePool"
      ? factionState.minorFactionsMode.numMinorFactions
      : 0;

  const stratifiedTotal = getStratifiedTotal(stratifiedConfig);

  // Calculate base minimum factions
  const baseMinFactions =
    factionState.minorFactionsMode?.mode === "sharedPool"
      ? playerCount * 2
      : playerCount;

  // Minimum considers: player count, stratification, and preassigned
  const minNumFactions =
    factionState.preassignedFactions !== undefined
      ? factionState.preassignedFactions * playerCount
      : Math.max(baseMinFactions, stratifiedTotal);

  // Maximum considers: game sets available minus minor factions reservation
  const maxNumFactions = maxFactionCount - minorReserved;

  // Can manually adjust only if not locked by preassigned or shared pool
  const canManuallyAdjust =
    factionState.preassignedFactions === undefined &&
    factionState.minorFactionsMode?.mode !== "sharedPool";

  // Can enable preassigned if not in shared pool mode and would fit
  const maxPreassignedFactions = Math.floor(
    (maxFactionCount - minorReserved) / playerCount,
  );
  const canEnablePreassigned =
    factionState.minorFactionsMode?.mode !== "sharedPool" &&
    maxPreassignedFactions >= 1;

  // Minor factions constraints
  const minMinorFactions = playerCount;
  const maxMinorFactions =
    factionState.minorFactionsMode?.mode === "sharedPool"
      ? 0 // Not applicable
      : maxFactionCount - factionState.numFactions;

  return {
    minNumFactions,
    maxNumFactions,
    canManuallyAdjust,
    minPreassignedFactions: FACTION_DEFAULTS.MIN_PREASSIGNED,
    maxPreassignedFactions,
    canEnablePreassigned,
    minMinorFactions,
    maxMinorFactions,
  };
};
