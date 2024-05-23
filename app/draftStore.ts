import { create } from "zustand";
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
  currentPick: number;
  pickOrder: number[];
  selectSlice: (playerId: number, sliceIdx: number) => void;
  selectSeat: (playerId: number, seatIdx: number) => void;
  selectFaction: (playerId: number, factionId: FactionId) => void;
  hydrate: (draft: PersistedDraft) => void;
  getPersisted: () => PersistedDraft;
};

export const useDraft = create<DraftsState>((set, get) => ({
  mapString: EMPTY_MAP_STRING,
  hydratedMap: EMPTY_MAP,
  players: [],
  slices: [],
  factions: [],
  currentPick: 0,
  pickOrder: [],
  getPersisted: () => ({
    mapString: get().mapString.join(" "),
    players: get().players,
    slices: get().slices,
    factions: get().factions,
    currentPick: get().currentPick,
    pickOrder: get().pickOrder,
  }),
  selectFaction: (playerId: number, factionId: FactionId) =>
    set((state) => {
      const players = state.players.map((p) =>
        p.id === playerId ? { ...p, faction: factionId } : p,
      );
      const hydratedMap = hydrateMap(state.hydratedMap, players, state.slices);
      return {
        players,
        hydratedMap: hydratedMap,
        currentPick: state.currentPick + 1,
      };
    }),
  selectSlice: (playerId: number, sliceIdx: number) =>
    set((state) => {
      const players = state.players.map((p) =>
        p.id === playerId ? { ...p, sliceIdx } : p,
      );
      const hydratedMap = hydrateMap(state.hydratedMap, players, state.slices);
      return {
        players,
        hydratedMap: hydratedMap,
        currentPick: state.currentPick + 1,
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
        currentPick: state.currentPick + 1,
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
        hydratedMap: hydratedMap,
        mapString: draft.mapString.split(" "),
        players: draft.players,
        slices: draft.slices,
        factions: draft.factions,
        currentPick: draft.currentPick,
        pickOrder: draft.pickOrder,
      };
    }),
}));

type NewDraftState = {
  map: Map;
  slices: string[][];
  numFactionsToDraft: number;
  availableFactions: FactionId[];
  players: Player[];
  setNumFactionsToDraft: (num: number | undefined) => void;
  updatePlayer: (playerIdx: number, player: Partial<Player>) => void;
  importMap: (mapString: string) => void;
  addSystemToMap: (tileIdx: number, system: System) => void;
  addSystemToSlice: (sliceIdx: number, tileIdx: number, system: System) => void;
  addNewSlice: () => void;
  addFaction: (id: FactionId) => void;
  removeFaction: (id: FactionId) => void;
};

export const useNewDraft = create<NewDraftState>((set, get) => ({
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
  numFactionsToDraft: undefined,
  setNumFactionsToDraft: (num) => set({ numFactionsToDraft: num }),
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
      const map = [...state.map];
      map[tileIdx] = {
        ...state.map[tileIdx],
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
