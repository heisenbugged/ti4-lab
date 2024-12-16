import {
  draftableSystemIds,
  systemData,
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
        stats.totalTech.push(techSpecialtyMap[p.tech]);
      }

      if (p.trait) {
        stats[traitCount[p.trait]]++;
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
    },
  );
}

export function getSystemPool(sets: GameSet[]) {
  const systemPool = [...draftableSystemIds];
  if (sets.includes("unchartedstars")) {
    systemPool.push(...unchartedStarsSystemIds);
  }
  return systemPool.flat(1);
}

export const systemsFromIds = (ids: SystemId[]): System[] =>
  ids.map((id) => systemData[id]);
