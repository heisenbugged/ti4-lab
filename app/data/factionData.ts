import { Faction, FactionId } from "~/types";

export const factions: Record<FactionId, Faction> = {
  winnu: {
    iconPath: "/winnu.png",
    name: "The Winnu",
  },
  hacan: {
    iconPath: "/hacan.png",
    name: "The Emirates of Hacan",
  },
  muaat: {
    iconPath: "/muaat.png",
    name: "The Embers of Muaat",
  },
  creuss: {
    iconPath: "/creuss.png",
    name: "The Ghosts of Creuss",
  },
  argent: {
    iconPath: "/argent.png",
    name: "The Argent Flight",
  },
  yin: {
    iconPath: "/yin.png",
    name: "The Yin Brotherhood",
  },
  sol: {
    iconPath: "/sol.png",
    name: "The Federation of Sol",
  },
  titans: {
    iconPath: "/titans.png",
    name: "The Titans of Ul",
  },
  vulraith: {
    iconPath: "/vuilraith.png",
    name: "The Vuil'Raith Cabal",
  },
};
