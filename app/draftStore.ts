import { create } from "zustand";
import { Draft, Map, Player, System } from "./types";
import { hydrateMap, parseMapString } from "./utils/map";

type DraftState = {
  draft: Draft;
  selectSeat: (playerId: number, seatIdx: number) => void;
  selectSlice: (playerId: number, sliceIdx: number) => void;
  addNewSlice: () => void;
  addSystemToSlice: (sliceIdx: number, tileIdx: number, system: System) => void;
  addSystemToMap: (tileIdx: number, system: System) => void;
};

const EMPTY_MAP_STRING =
  "0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0".split(
    " ",
  );
const EMPTY_MAP = parseMapString(EMPTY_MAP_STRING);
const EMPTY_HYDRATED_MAP = hydrateMap(EMPTY_MAP, {
  players: [],
  slices: [],
});

export const useDraftStore = create<DraftState>((set) => ({
  draft: {
    rawMap: EMPTY_MAP,
    hydratedMap: EMPTY_HYDRATED_MAP,
    activePlayer: 1,
    players: [
      ...[1, 2, 3, 4, 5, 6].map((i) => ({
        id: i,
        name: `Player ${i}`,
      })),
    ],
    slices: [
      "-1 0 0 0".split(" "),
      "-1 0 0 0".split(" "),
      "-1 0 0 0".split(" "),
      "-1 0 0 0".split(" "),
      "-1 0 0 0".split(" "),
      "-1 0 0 0".split(" "),
    ],
  },
  selectSlice: (playerId: number, sliceIdx: number) =>
    set(({ draft }) => {
      const players = draft.players.map((p) =>
        p.id === playerId ? { ...p, sliceIdx } : p,
      );
      const hydratedMap = hydrateMap(draft.rawMap, {
        players,
        slices: draft.slices,
      });
      return {
        draft: {
          ...draft,
          players,
          hydratedMap,
        },
      };
    }),

  selectSeat: (playerId: number, seatIdx: number) =>
    set(({ draft }) => {
      const players = draft.players.map((p) =>
        p.id === playerId ? { ...p, seatIdx: seatIdx } : p,
      );
      const hydratedMap = hydrateMap(draft.rawMap, {
        players,
        slices: draft.slices,
      });
      return {
        draft: {
          ...draft,
          players,
          hydratedMap,
        },
      };
    }),

  addNewSlice: () =>
    set(({ draft }) => ({
      draft: {
        ...draft,
        slices: [...draft.slices, ["-1", "0", "0", "0"]],
      },
    })),

  addSystemToSlice: (sliceIdx: number, tileIdx: number, system: System) =>
    set(({ draft }) => {
      const slices = [...draft.slices];
      slices[sliceIdx][tileIdx] = system.id.toString();
      return {
        draft: {
          ...draft,
          slices,
        },
      };
    }),

  addSystemToMap: (tileIdx: number, system: System) =>
    set(({ draft }) => {
      const map = { ...draft.rawMap };
      map.tiles[tileIdx] = {
        ...draft.rawMap.tiles[tileIdx],
        type: "SYSTEM",
        system,
      };

      const hydratedMap = hydrateMap(map, {
        players: draft.players,
        slices: draft.slices,
      });

      return {
        draft: {
          ...draft,
          rawMap: map,
          hydratedMap,
        },
      };
    }),
}));
