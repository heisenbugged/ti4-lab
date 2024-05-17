import type { MetaFunction } from "@remix-run/node";
import { Map } from "~/components/Map";
import { defaultLayouts } from "~/data/defaultLayouts";
import { loadMapFromLayout } from "~/data/loadMapFromLayout";
import { mapStringOrder } from "~/data/mapStringOrder";
import { planetData } from "~/data/planetData";
import { systemData } from "~/data/systemData";
import { Tile } from "~/types";

export const meta: MetaFunction = () => {
  return [
    { title: "TI4 Lab" },
    { name: "description", content: "TI4 Lab, for drafting and map creation." },
  ];
};

const startingMap = loadMapFromLayout(defaultLayouts[0].data);

const mapString =
  "30 40 37 61 62 68 64 42 75 49 65 25 44 66 36 28 47 19 0 24 39 0 79 33 0 32 46 0 74 23 0 35 26 0 38 73".split(
    " ",
  );

const tiles = mapString
  .map((n) => systemData.find((system) => system.id === parseInt(n)))
  .map((system, idx) => {
    const position = mapStringOrder[idx];
    if (!system)
      return {
        position,
        type: "OPEN",
        system: undefined,
      };

    const planets = system.planets?.map(
      (n: string) => planetData.find((planet) => planet.name === n)!!,
    );

    const tile: Tile = {
      position,
      type: "SYSTEM",
      system: {
        id: system.id,
        planets,
        anomaly: system.anomaly,
        wormhole: system.wormhole,
      },
    };

    return tile;
  });
const map = { tiles };

export default function Index() {
  return (
    <div>
      <Map map={map} />
    </div>
  );
}
