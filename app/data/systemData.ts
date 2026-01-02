import {
  FactionId,
  PlanetTrait,
  System,
  SystemId,
  TechSpecialty,
} from "~/types";
import { rawSystems } from "./rawSystemData";
import { factions } from "./factionData";

export type SystemGameSet = "base" | "pok" | "te" | "ds" | "us";

export const systemGameSetLabels: Record<SystemGameSet, string> = {
  base: "Base",
  pok: "PoK",
  te: "TE",
  ds: "DS",
  us: "US",
};

export function getSystemGameSet(systemId: string): SystemGameSet | undefined {
  const id = Number(systemId);
  if (isNaN(id)) return undefined;

  // Base game: 19-50
  if (id >= 19 && id <= 50) return "base";
  // Prophecy of Kings: 59-82
  if (id >= 59 && id <= 82) return "pok";
  // Thunder's Edge: 92-149 (includes 91A, 91B handled separately)
  if (id >= 92 && id < 150) return "te";
  // Discordant Stars: tiles in the 4000+ range
  if (id >= 4000 && id < 5000) return "ds";
  // Uncharted Stars: 150+
  if (id >= 150 && id < 4000) return "us";

  // Handle special string IDs
  if (systemId.startsWith("91")) return "te"; // 91A, 91B

  return undefined;
}

export const systemData: Record<SystemId, System> = Object.entries(
  rawSystems,
).reduce(
  (acc, [id, system]) => {
    // Calculate total and optimal spend
    const totalSpend = { resources: 0, influence: 0 };
    const optimalSpend = { resources: 0, influence: 0, flex: 0 };
    system.planets.forEach((planet) => {
      totalSpend.resources += planet.resources;
      totalSpend.influence += planet.influence;

      if (planet.resources > planet.influence) {
        optimalSpend.resources += planet.resources;
      } else if (planet.resources < planet.influence) {
        optimalSpend.influence += planet.influence;
      } else if (planet.resources === planet.influence) {
        optimalSpend.flex += planet.resources;
      }
    });

    acc[id] = {
      ...system,
      totalSpend,
      optimalSpend,
    };

    return acc;
  },
  {} as Record<SystemId, System>,
);

export const factionSystems: Record<FactionId, System> = Object.values(
  systemData,
).reduce(
  (acc, system) => {
    if (system.faction) {
      acc[system.faction] = system;
    }
    return acc;
  },
  {} as Record<FactionId, System>,
);

export const draftableSystemIds = Object.values(systemData)
  .filter(
    (system) =>
      (system.type === "BLUE" || system.type === "RED") &&
      Number(system.id) < 92 &&
      system.id !== "18" && // cannot draft mecatol
      system.id !== "82" && // cannot draft mallice
      system.id !== "81", // cannot draft muaat hero supernova
  )
  .map((system) => system.id);

export const thunderSystemIds = Object.values(systemData)
  .filter(
    (system) =>
      (system.type === "BLUE" || system.type === "RED") &&
      Number(system.id) >= 92 && Number(system.id) < 150,
  )
  .map((system) => system.id);

export const unchartedStarsSystemIds = Object.values(systemData)
  .filter(
    (system) =>
      (system.type === "BLUE" || system.type === "RED") &&
      Number(system.id) >= 150,
  )
  .map((system) => system.id);

export const allDraftableSystemIds = [
  ...draftableSystemIds,
  ...unchartedStarsSystemIds,
];

const searchableTech: Record<TechSpecialty, string> = {
  BIOTIC: "green tech",
  CYBERNETIC: "yellow tech",
  WARFARE: "red tech",
  PROPULSION: "blue tech",
};

const searchableTrait: Record<PlanetTrait, string> = {
  INDUSTRIAL: "green planet",
  CULTURAL: "blue planet",
  HAZARDOUS: "red planet",
};

export const searchableSystemData = Object.values(systemData).reduce(
  (acc, system) => {
    const nameParts: string[] = [system.id.toString()];
    if (system.anomalies.length > 0) {
      system.anomalies.forEach((anomaly) =>
        nameParts.push(anomaly.toLowerCase().replace(/_/g, " ")),
      );
      nameParts.push("anomaly");
    }
    if (system.wormholes.length > 0) {
      system.wormholes.forEach((wormhole) =>
        nameParts.push(wormhole.toLowerCase()),
      );
      nameParts.push("wormhole");
    }

    if (
      system.anomalies.length === 0 &&
      system.wormholes.length === 0 &&
      system.planets.length === 0
    ) {
      nameParts.push("empty");
    }

    for (const planet of system.planets) {
      nameParts.push(planet.name.toLowerCase());
      if (planet.trait) {
        for (const trait of planet.trait) {
          nameParts.push(searchableTrait[trait]);
          nameParts.push(trait.toLowerCase());
        }
      }
      if (planet.tech) {
        for (const tech of planet.tech) {
          nameParts.push(searchableTech[tech]);
          nameParts.push(tech.toLowerCase());
        }
      }

      nameParts.push(`${planet.resources} resources`);
      nameParts.push(`${planet.influence} influence`);

      if (planet.legendary) {
        nameParts.push("legendary");
      }
      if (planet.tradeStation) {
        nameParts.push("space station");
        nameParts.push("station");
      }
    }

    // Planet count tags
    if (system.planets.length >= 1) {
      nameParts.push(`${system.planets.length} planet`);
    }
    if (system.planets.length >= 2) {
      nameParts.push("multiplanet");
    }

    if (system.faction) {
      nameParts.push(factions[system.faction].name.toLowerCase());
    }

    // Game set tags
    const gameSet = getSystemGameSet(system.id);
    if (gameSet) {
      const gameSetSearchTerms: Record<SystemGameSet, string[]> = {
        base: ["base", "base game"],
        pok: ["pok", "prophecy of kings"],
        te: ["te", "thunders edge", "thunder's edge"],
        ds: ["ds", "discordant stars"],
        us: ["us", "uncharted stars"],
      };
      gameSetSearchTerms[gameSet].forEach((term) => nameParts.push(term));
    }

    acc.push([nameParts.join(" "), system.id] as const);
    return acc;
  },
  [] as [string, SystemId][],
);
