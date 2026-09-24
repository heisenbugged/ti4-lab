import {
  Draft,
  DraftIntegrations,
  DraftSettings,
  FactionId,
  FactionStratification,
  Map,
  Player,
  Slice,
  SystemId,
  TexasDraftState,
} from "~/types";
import { draftConfig } from "~/draft/draftConfig";
import { DraftConfig } from "~/draft/types";
import { shuffle } from "~/draft/helpers/randomization";
import {
  createTexasSeatAssignments,
  dealTexasFactionOptions,
  dealTexasTiles,
} from "~/draft/texas/texasDraft";
import { factions } from "~/data/factionData";
import { mapStringOrder } from "~/data/mapStringOrder";
import { getRandomSliceNames } from "~/data/sliceWords";
import { getFactionPool } from "~/utils/factions";
import { generateEmptyMap } from "~/utils/map";
import { emptySlices, systemIdsToSlices } from "~/utils/slice";
import { getSystemPool } from "~/utils/system";

/**
 * Builds the initial state of a new draft from its settings: rolls factions
 * (or deals Texas hands), and generates the map and slices. Returns undefined
 * when the map/slice generator cannot satisfy the settings.
 */
export function buildInitialDraft(
  settings: DraftSettings,
  players: Player[],
  integrations: DraftIntegrations = {},
): Draft | undefined {
  if (settings.draftGameMode === "texasStyle") {
    return buildInitialTexasDraft(settings, players, integrations);
  }

  const config = draftConfig[settings.type];
  const factionPool = getFactionPool(settings.factionGameSets);
  const systemPool = getSystemPool(settings.tileGameSets);
  const base = {
    settings,
    players,
    integrations,
    pickOrder: [],
    selections: [],
  };

  const rolled = rollFactions(settings, factionPool, players.length);

  if (settings.draftGameMode === "presetMap" && settings.presetMap) {
    return { ...base, ...rolled, slices: [], presetMap: settings.presetMap };
  }

  let slices: Slice[] | undefined;
  let presetMap: Map;
  if (settings.presetSlices && settings.presetMap) {
    slices = systemIdsToSlices(
      config,
      settings.presetSlices,
      settings.sliceGenerationConfig?.sliceValueModifiers,
    );
    presetMap = settings.presetMap;
  } else if (config.generateMap) {
    const generated = generateMapAndSlices(
      config,
      settings,
      systemPool,
      getDraftableFactions(factionPool, rolled.availableFactions),
    );
    if (!generated) return undefined;
    slices = generated.slices;
    presetMap = generated.presetMap;
  } else {
    slices = initializeSlices(config, settings, systemPool);
    if (!slices) return undefined;
    presetMap = settings.randomizeMap
      ? randomizeMap(config, slices, systemPool)
      : generateEmptyMap(config);
  }

  return {
    ...base,
    ...rolled,
    slices: settings.draftGameMode === "presetMap" ? [] : setSliceNames(slices),
    presetMap,
  };
}

/**
 * Texas style: every draftable faction is available, players get seats and
 * tile hands, and faction hands are dealt now unless a ban phase comes first
 * (then banFaction deals them once bans are complete). The map starts empty.
 */
export function buildInitialTexasDraft(
  settings: DraftSettings,
  players: Player[],
  integrations: DraftIntegrations = {},
): Draft {
  const draftableFactions = getDraftableFactions(
    getFactionPool(settings.factionGameSets),
    null,
    settings.allowedFactions,
  );
  const texasDraft: TexasDraftState = {
    ...createTexasSeatAssignments(players),
    ...dealTexasTiles(getSystemPool(settings.tileGameSets), players),
  };
  if (!settings.modifiers?.banFactions) {
    Object.assign(
      texasDraft,
      dealTexasFactions(settings, draftableFactions, players),
    );
  }

  return {
    settings,
    players,
    integrations,
    availableFactions: draftableFactions,
    slices: [],
    presetMap: generateEmptyMap(draftConfig[settings.type]),
    pickOrder: [],
    selections: [],
    texasDraft,
  };
}

export function dealTexasFactions(
  settings: DraftSettings,
  draftableFactions: FactionId[],
  players: Player[],
) {
  return dealTexasFactionOptions(
    draftableFactions,
    players,
    settings.texasFactionHandSize ?? 2,
  );
}

/**
 * Rolls the faction-related parts of a new (non-Texas) draft: kings and
 * reference card packs for Twilight's Fall, otherwise factions, plus minor
 * factions when enabled.
 */
export function rollFactions(
  settings: DraftSettings,
  factionPool: FactionId[],
  playerCount: number,
): Pick<
  Draft,
  "availableFactions" | "availableMinorFactions" | "availableReferenceCardPacks"
> {
  if (settings.draftGameMode === "twilightsFall") {
    const availableFactions = shuffle([...factionPool], settings.numKings ?? 8);
    return {
      availableFactions,
      availableMinorFactions: rollMinorFactions(
        settings,
        factionPool,
        availableFactions,
      ),
      availableReferenceCardPacks: generateReferenceCardPacks(
        settings.numReferenceCardPacks ?? playerCount,
      ),
    };
  }

  const availableFactions = randomizeFactions(
    settings.numFactions,
    getDraftableFactions(factionPool, null, settings.allowedFactions),
    settings.requiredFactions,
    settings.factionStratification,
  );
  return {
    availableFactions,
    availableMinorFactions: rollMinorFactions(
      settings,
      factionPool,
      availableFactions,
    ),
  };
}

function rollMinorFactions(
  settings: DraftSettings,
  factionPool: FactionId[],
  availableFactions: FactionId[],
): FactionId[] | undefined {
  if (!settings.numMinorFactions) return undefined;
  return shuffle(
    getDraftableFactions(factionPool, availableFactions),
    settings.numMinorFactions,
  );
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
  if (!stratifiedConfig) {
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

export function generateReferenceCardPacks(numPlayers: number): FactionId[][] {
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

export function generateMapAndSlices(
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
      settings.sliceGenerationConfig?.sliceValueModifiers,
    ),
  };
}

export function setSliceNames(slices: Slice[]) {
  const sliceNames = getRandomSliceNames(slices.length);

  slices.forEach((slice, idx) => {
    slice.name = `Slice ${sliceNames[idx]}`;
  });

  return slices;
}

/** Slices for draft types without a combined map generator (std4p). */
function initializeSlices(
  config: DraftConfig,
  settings: DraftSettings,
  systemPool: SystemId[],
) {
  if (!settings.randomizeSlices) return emptySlices(config, settings.numSlices);

  const rawSlices = config.generateSlices(
    settings.numSlices,
    systemPool,
    settings.sliceGenerationConfig ?? {
      maxSliceValue: settings.maxSliceValue,
      minSliceValue: settings.minSliceValue,
    },
  );

  if (!rawSlices) return undefined;
  return systemIdsToSlices(
    config,
    rawSlices,
    settings.sliceGenerationConfig?.sliceValueModifiers,
  );
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
