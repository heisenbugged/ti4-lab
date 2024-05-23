import { create, createStore } from "zustand";
import { FactionId, Map, PersistedDraft, Player, System } from "./types";
import { hydrateMap, parseMapString, sliceMap } from "./utils/map";
import { mapStringOrder } from "./data/mapStringOrder";

const EMPTY_MAP_STRING =
  "0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0".split(
    " ",
  );
const EMPTY_MAP = parseMapString(EMPTY_MAP_STRING);

type DraftsState = {
  mapString: string[];
  hydratedMap: Map;
  players: Player[];
  slices: string[][];
  factions: FactionId[];
  selectSlice: (playerId: number, sliceIdx: number) => void;
  selectSeat: (playerId: number, seatIdx: number) => void;
  hydrate: (draft: PersistedDraft) => void;
};

export const useDraft = create<DraftsState>((set) => ({
  mapString: EMPTY_MAP_STRING,
  hydratedMap: EMPTY_MAP,
  players: [],
  slices: [],
  factions: [],
  selectSlice: (playerId: number, sliceIdx: number) =>
    set((state) => {
      const players = state.players.map((p) =>
        p.id === playerId ? { ...p, sliceIdx } : p,
      );
      const hydratedMap = hydrateMap(state.hydratedMap, players, state.slices);
      return {
        players,
        hydratedMap: hydratedMap,
      };
    }),

  selectSeat: (playerId: number, seatIdx: number) =>
    set((state) => {
      const players = state.players.map((p) =>
        p.id === playerId ? { ...p, seatIdx: seatIdx } : p,
      );

      const parsedMap = parseMapString(state.mapString, mapStringOrder, false);
      const hydratedMap = hydrateMap(parsedMap, players, state.slices);

      return {
        players,
        hydratedMap: hydratedMap,
      };
    }),
  hydrate: (draft: PersistedDraft) =>
    set(() => {
      const parsedMap = parseMapString(
        draft.mapString.split(" "),
        mapStringOrder,
        false,
      );
      const hydratedMap = hydrateMap(parsedMap, draft.players, draft.slices);

      return {
        mapString: draft.mapString.split(" "),
        hydratedMap: hydratedMap,
        players: draft.players,
        slices: draft.slices,
        // TODO: Make consistent name.
        factions: draft.availableFactions,
      };
    }),
}));

type NewDraftState = {
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

export const useNewDraft = create<NewDraftState>((set) => ({
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
