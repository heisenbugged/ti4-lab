import { create } from "zustand";
import { Draft, Map, Player, System } from "./types";
import { Map } from "./components/Map";
import { MECATOL_TILE, hydrateMap, parseMapString } from "./utils/map";

// const players: Player[] = [
//   {
//     id: "abc",
//     name: "James",
//     faction: "mentak",
//   },
//   {
//     id: "def",
//     name: "Steven",
//     faction: "yssaril",
//   },
//   {
//     id: "def",
//     name: "Joe",
//     faction: "yssaril",
//   },
//   {
//     id: "def",
//     name: "Jim",
//     faction: "yssaril",
//   },
//   {
//     id: "def",
//     name: "Jan",
//     faction: "yssaril",
//   },
//   {
//     id: "def",
//     name: "Jen",
//     faction: "yssaril",
//   },
// ];

type DraftState = Draft & {
  mapString: string[];
  hydratedMap: Map;
  addNewSlice: () => void;
  addSystemToSlice: (sliceIdx: number, tileIdx: number, system: System) => void;
  addSystemToMap: (tileIdx: number, system: System) => void;
};

const EMPTY_MAP_STRING =
  "0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0".split(
    " ",
  );
const EMPTY_MAP = {
  tiles: [MECATOL_TILE, ...parseMapString(EMPTY_MAP_STRING).tiles],
};

const EMPTY_HYDRATED_MAP = hydrateMap(EMPTY_MAP, {
  players: [],
  slices: [],
});

export const useDraftStore = create<DraftState>((set) => ({
  mapString: EMPTY_MAP_STRING,
  hydratedMap: EMPTY_HYDRATED_MAP,
  players: [],
  slices: [],
  addNewSlice: () =>
    set((state) => ({
      slices: [...state.slices, ["-1", "0", "0", "0"]],
    })),
  addSystemToSlice: (sliceIdx: number, tileIdx: number, system: System) =>
    set((state) => {
      const slices = [...state.slices];
      slices[sliceIdx][tileIdx] = system.id.toString();
      return { slices };
    }),

  addSystemToMap: (tileIdx: number, system: System) =>
    set((state) => {
      const hydratedMap = { ...state.hydratedMap };
      hydratedMap.tiles[tileIdx] = {
        ...hydratedMap.tiles[tileIdx],
        type: "SYSTEM",
        system,
      };
      return { hydratedMap };
    }),
}));
