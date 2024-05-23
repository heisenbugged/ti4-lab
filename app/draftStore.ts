import { create } from "zustand";
import { Draft, FactionId, Map, Player, System } from "./types";
import { hydrateMap, parseMapString, sliceMap } from "./utils/map";

type DraftState = {
  draft: Draft;
  selectSeat: (playerId: number, seatIdx: number) => void;
  selectSlice: (playerId: number, sliceIdx: number) => void;
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
    factions: [],
    // TODO: Should not preload these factions, but for now it's fine.
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
}));

type DraftOptionsState = {
  map: Map;
  slices: string[][];
  availableFactions: FactionId[];
  players: Player[];
  updatePlayer: (playerIdx: number, player: Partial<Player>) => void;
  importMap: (mapString: string) => void;
  addSystemToMap: (tileIdx: number, system: System) => void;
  addSystemToSlice: (sliceIdx: number, tileIdx: number, system: System) => void;
  addNewSlice: () => void;
  addFaction: (id: FactionId) => void;
  removeFaction: (id: FactionId) => void;
};

export const useNewDraft = create<DraftOptionsState>((set) => ({
  map: EMPTY_MAP,
  slices: [
    "-1 0 0 0".split(" "),
    "-1 0 0 0".split(" "),
    "-1 0 0 0".split(" "),
    "-1 0 0 0".split(" "),
    "-1 0 0 0".split(" "),
    "-1 0 0 0".split(" "),
  ],
  availableFactions: [],
  players: [
    ...[1, 2, 3, 4, 5, 6].map((i) => ({
      id: i,
      name: "",
    })),
  ],
  updatePlayer: (playerIdx: number, player: Partial<Player>) =>
    set(({ players }) => ({
      players: players.map((p, idx) =>
        idx === playerIdx ? { ...p, ...player } : p,
      ),
    })),
  importMap: (mapString: string) =>
    set(() => {
      const rawMap = parseMapString(mapString.split(" "));
      const { slices, map: slicedMap } = sliceMap(rawMap);
      return {
        map: slicedMap,
        slices,
      };
    }),

  addSystemToMap: (tileIdx: number, system: System) =>
    set((state) => {
      const map = { ...state.map };
      map.tiles[tileIdx] = {
        ...state.map.tiles[tileIdx],
        type: "SYSTEM",
        system,
      };

      return { map };
    }),

  addSystemToSlice: (sliceIdx: number, tileIdx: number, system: System) =>
    set((state) => {
      const slices = [...state.slices];
      slices[sliceIdx][tileIdx] = system.id.toString();
      return { slices };
    }),

  addNewSlice: () =>
    set((state) => ({
      slices: [["-1", "0", "0", "0"], ...state.slices],
    })),

  addFaction: (id: FactionId) =>
    set(({ availableFactions }) => ({
      availableFactions: [...availableFactions, id],
    })),

  removeFaction: (id: FactionId) =>
    set(({ availableFactions }) => ({
      availableFactions: availableFactions.filter((f) => f !== id),
    })),
}));
