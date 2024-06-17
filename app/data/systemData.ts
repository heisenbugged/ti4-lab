import {
  Anomaly,
  FactionId,
  PlanetTrait,
  System,
  SystemId,
  TechSpecialty,
} from "~/types";
import { rawSystems } from "./rawSystemData";
import { factions } from "./factionData";

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
      Number(system.id) < 100 &&
      system.id !== "18" && // cannot draft mecatol
      system.id !== "82", // cannot draft mallice
  )
  .map((system) => system.id);

export const unchartedStarsSystemIds = Object.values(systemData)
  .filter(
    (system) =>
      (system.type === "BLUE" || system.type === "RED") &&
      Number(system.id) >= 100,
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
    if (system.wormholes) {
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
        nameParts.push(searchableTrait[planet.trait]);
        nameParts.push(planet.trait.toLowerCase());
      }
      if (planet.tech) {
        nameParts.push(searchableTech[planet.tech]);
        nameParts.push(planet.tech.toLowerCase());
      }

      nameParts.push(`${planet.resources} resources`);
      nameParts.push(`${planet.influence} influence`);
    }

    if (system.faction) {
      nameParts.push(factions[system.faction].name.toLowerCase());
    }

    acc.push([nameParts.join(" "), system.id] as const);
    return acc;
  },
  [] as [string, SystemId][],
);
