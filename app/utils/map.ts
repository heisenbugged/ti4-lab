import { mapStringOrder } from "~/data/mapStringOrder";
import { planetData } from "~/data/planetData";
import { systemData } from "~/data/systemData";
import { Map, TechSpecialty, Tile } from "~/types";

export const MECATOL_TILE: Tile = {
  position: { x: 0, y: 0, z: 0 },
  type: "SYSTEM",
  system: {
    id: 18,
    planets: planetData.filter((planet) => planet.name === "Mecatol Rex"),
  },
};

export const parseMapString = (
  mapString: string,
  // TODO: Technically 'z' is superfluous, but it's easier to keep it in for now.
  positionOrder: { x: number; y: number; z: number }[] = mapStringOrder,
): Map => {
  const tiles: Tile[] = mapString
    .split(" ")
    .map((n) => systemData[parseInt(n)])
    .map((system, idx) => {
      const position = positionOrder[idx];
      if (!system)
        return {
          position,
          type: "OPEN" as const,
          system: undefined,
        };

      return {
        position,
        type: "SYSTEM",
        system,
      };
    });
  return { tiles };
};

export const totalStats = (tiles: Tile[]) =>
  tiles.reduce(
    (acc, t) => {
      t.system?.planets.forEach((p) => {
        acc.resources += p.resources;
        acc.influence += p.influence;
      });
      return acc;
    },
    { resources: 0, influence: 0 },
  );

export const optimalStats = (tiles: Tile[]) =>
  tiles.reduce(
    (acc, t) => {
      t.system?.planets.forEach((p) => {
        if (p.resources > p.influence) {
          acc.resources += p.resources;
        } else if (p.resources < p.influence) {
          acc.influence += p.influence;
        } else if (p.resources === p.influence) {
          acc.flex += p.resources;
        }
      });
      return acc;
    },
    { resources: 0, influence: 0, flex: 0 },
  );

export const techSpecialties = (tiles: Tile[]) =>
  tiles.reduce((acc, t) => {
    t.system?.planets.forEach((p) => {
      if (p.techSpecialty) acc.push(p.techSpecialty);
    });
    return acc;
  }, [] as TechSpecialty[]);
