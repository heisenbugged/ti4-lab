import { create } from "zustand";
import { Draft, Player, System } from "./types";

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
  addNewSlice: () => void;
  addSystemToSlice: (sliceIdx: number, tileIdx: number, system: System) => void;
};

export const useDraftStore = create<DraftState>((set) => ({
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
}));
