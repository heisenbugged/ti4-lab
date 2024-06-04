import { systemData } from "~/data/systemData";
import { System } from "~/types";

const SYSTEM_TIER = {
  LOW: "low",
  MED: "med",
  HIGH: "high",

  MECATOL: "mecatol",
  HOME: "home",
  RED: "red",
  HYPERLANE: "hyperlane",
  OFF_MAP: "offMap",
  OTHER: "other",
};

/**
 * Compute system tier (low, med, or high) using "DangerousGoods" method:
 *
 * - MED is systems with 2 or more planets and no tech skips.
 *
 * - HIGH are the systems with 2 or more planets with tech skips and
 * the legendaries, and Atlas / Lodor.
 *
 * - LOW is the single planet systems + Quann.
 */
function calculateTier(system: System) {
  // Handle some special cases before looking at blue systems.
  if (system.id === 18) {
    return SYSTEM_TIER.MECATOL;
  } else if (system.id === 81) {
    return SYSTEM_TIER.OTHER; // muaat hero supernova.id
  } else if (system.type === "GREEN") {
    return SYSTEM_TIER.HOME;
  } else if (system.type === "RED") {
    return SYSTEM_TIER.RED;
  } else if (system.type === "HYPERLANE") {
    return SYSTEM_TIER.HYPERLANE;
  } else if (system.id <= 0) {
    return SYSTEM_TIER.OTHER;
  }

  const planetCount = system.planets.length;
  const techCount = system.planets.filter((planet) => !!planet.tech).length;
  const hasLegendary =
    system.planets.filter((planet) => planet.legendary).length > 0;

  // Special case move Atlas/Lodor to med.
  if (system.id === 26 || system.id === 64) {
    return SYSTEM_TIER.HIGH;
  }

  if ((planetCount >= 2 && techCount >= 1) || hasLegendary) {
    return SYSTEM_TIER.HIGH;
  }

  if (planetCount >= 2 && techCount === 0) {
    return SYSTEM_TIER.MED;
  }

  if (planetCount === 1) {
    return SYSTEM_TIER.LOW;
  }

  // TODO: Make proper error
  throw new Error(`Could not determine tier for system ${system.id}`);
  // see this:
  //   throw new Error(`system ${system.id}: ${system.getSummaryStr()}`);
}

export function getTieredSystems(systems: number[]) {
  const tiers = {
    [SYSTEM_TIER.LOW]: [] as number[],
    [SYSTEM_TIER.MED]: [] as number[],
    [SYSTEM_TIER.HIGH]: [] as number[],
    [SYSTEM_TIER.RED]: [] as number[],
  };

  systems.forEach((s) => {
    const tier = calculateTier(systemData[s]);
    tiers[tier]?.push(s);
  });
  return tiers;
}
