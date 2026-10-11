import {
  draftableSystemIds,
  systemData,
  thunderSystemIds,
  unchartedStarsSystemIds,
} from "~/data/systemData";
import { GameSet, System, SystemId, SystemStats } from "~/types";

const techSpecialtyMap = {
  BIOTIC: "G",
  CYBERNETIC: "Y",
  WARFARE: "R",
  PROPULSION: "B",
} as const;

const traitCount = {
  HAZARDOUS: "redTraits",
  INDUSTRIAL: "greenTraits",
  CULTURAL: "blueTraits",
} as const;

export function systemStats(system: System): SystemStats {
  return system.planets.reduce(
    (stats, p) => {
      stats.totalResources += p.resources;
      stats.totalInfluence += p.influence;

      if (p.tech) {
        for (const tech of p.tech) {
          stats.totalTech.push(techSpecialtyMap[tech]);
        }
      }

      if (p.trait) {
        for (const trait of p.trait) {
          stats[traitCount[trait]]++;
        }
      }

      if (p.legendary) {
        stats.totalLegendary++;
      }

      return stats;
    },
    {
      systemType: system.type,
      totalResources: 0,
      totalInfluence: 0,
      totalTech: [] as string[],
      redTraits: 0,
      greenTraits: 0,
      blueTraits: 0,
      totalLegendary: 0,
    },
  );
}

export function getSystemPool(sets: GameSet[]) {
  const systemPool: SystemId[] = [];

  // Base game: IDs 19-50
  if (sets.includes("base")) {
    systemPool.push(...draftableSystemIds.filter(id => Number(id) >= 19 && Number(id) <= 50));
  }

  // PoK: IDs 51-91 (excluding special tiles 81, 82)
  if (sets.includes("pok")) {
    systemPool.push(...draftableSystemIds.filter(id => Number(id) >= 51 && Number(id) <= 91));
  }

  // Uncharted Stars: IDs 150+
  if (sets.includes("unchartedstars")) {
    systemPool.push(...unchartedStarsSystemIds);
  }

  // Thunder's Edge: IDs 92-149
  if (sets.includes("te")) {
    systemPool.push(...thunderSystemIds);
  }

  return systemPool;
}

export const systemsFromIds = (ids: SystemId[]): System[] =>
  ids.map((id) => systemData[id]);
