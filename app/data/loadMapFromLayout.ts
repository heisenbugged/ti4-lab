import { Map, MapSpaceType, Tile } from "~/types";
import { planetData } from "./planetData";

const numberToMapSpaceType: Record<number, MapSpaceType> = {
  1: "OPEN",
  2: "HOME",
  3: "SYSTEM",
  4: "CLOSED",
  5: "WARP",
};

export const loadMapFromLayout = (data): Map => {
  // TODO: Type data.
  const tiles: Tile[] = data.map((space) => {
    const tile: Tile = {
      position: {
        x: space.x,
        y: space.y,
        z: space.z,
      },
      type: numberToMapSpaceType[space.type],
      system: !!space.system
        ? {
            id: space.system.id,
            planets: space.system.planets.map((n: string) =>
              planetData.find((planet) => planet.name === n),
            ),
            anomaly: space.system.anomaly,
            wormhole: space.system.wormhole,
          }
        : undefined,
    };
    return tile;
  });

  return { tiles };
};
