import { Faction } from "~/types";

export const factions = {
  sardakk: {
    id: "sardakk",
    iconPath: "/factions/ti_norr.png",
    name: "Sardakk N'orr",
  } as Faction,
  arborec: {
    id: "arborec",
    iconPath: "/factions/ti_arborec.png",
    name: "Arborec",
  } as Faction,
  barony: {
    id: "barony",
    iconPath: "/factions/ti_letnev.png",
    name: "Barony of Letnev",
  } as Faction,
  saar: {
    id: "saar",
    iconPath: "/factions/ti_saar.png",
    name: "Clan of Saar",
  } as Faction,
  muaat: {
    id: "muaat",
    iconPath: "/factions/ti_muaat.png",
    name: "Embers of Muaat",
  } as Faction,
  hacan: {
    id: "hacan",
    iconPath: "/factions/ti_hacan.png",
    name: "Emirates of Hacan",
  } as Faction,
  sol: {
    id: "sol",
    iconPath: "/factions/ti_sol.png",
    name: "Federation of Sol",
  } as Faction,
  creuss: {
    id: "creuss",
    iconPath: "/factions/ti_creuss.png",
    name: "Ghosts of Creuss",
  } as Faction,
  l1z1x: {
    id: "l1z1x",
    iconPath: "/factions/ti_l1z1x.png",
    name: "L1Z1X Mindnet",
  } as Faction,
  mentak: {
    id: "mentak",
    iconPath: "/factions/ti_mentak.png",
    name: "Mentak Coalition",
  } as Faction,
  naalu: {
    id: "naalu",
    iconPath: "/factions/ti_naalu.png",
    name: "Naalu Collective",
  } as Faction,
  nekro: {
    id: "nekro",
    iconPath: "/factions/ti_nekro.png",
    name: "Nekro Virus",
  } as Faction,
  jolnar: {
    id: "jolnar",
    iconPath: "/factions/ti_jolnar.png",
    name: "Universities of Jol-Nar",
  } as Faction,
  winnu: {
    id: "winnu",
    iconPath: "/factions/ti_winnu.png",
    name: "Winnu",
  } as Faction,
  xxcha: {
    id: "xxcha",
    iconPath: "/factions/ti_xxcha.png",
    name: "Xxcha Kingdom",
  } as Faction,
  yin: {
    id: "yin",
    iconPath: "/factions/ti_yin.png",
    name: "Yin Brotherhood",
  } as Faction,
  yssaril: {
    id: "yssaril",
    iconPath: "/factions/ti_yssaril.png",
    name: "Yssaril Tribes",
  } as Faction,
  argent: {
    id: "argent",
    iconPath: "/factions/ti_argent.png",
    name: "Argent Flight",
  } as Faction,
  empyrean: {
    id: "empyrean",
    iconPath: "/factions/ti_empyrean.png",
    name: "Empyrean",
  } as Faction,
  mahact: {
    id: "mahact",
    iconPath: "/factions/ti_mahact.png",
    name: "Mahact Gene-Sorcerers",
  } as Faction,
  naazrokha: {
    id: "naazrokha",
    iconPath: "/factions/ti_naazrokha.png",
    name: "Naaz-Rokha Alliance",
  } as Faction,
  nomad: {
    id: "nomad",
    iconPath: "/factions/ti_nomad.png",
    name: "Nomad",
  } as Faction,
  titans: {
    id: "titans",
    iconPath: "/factions/ti_ul.png",
    name: "Titans of Ul",
  } as Faction,
  vulraith: {
    id: "vulraith",
    iconPath: "/factions/ti_vuilraith.png",
    name: "Vuil'Raith Cabal",
  } as Faction,
  keleres: {
    id: "keleres",
    iconPath: "/factions/ti_keleres.png",
    name: "Council Keleres",
  } as Faction,
} as const;

export type FactionId = keyof typeof factions;
export const factionIds = Object.keys(factions) as FactionId[];

export const playerColors = [
  "blue",
  "red",
  "green",
  "yellow",
  "violet",
  "orange",
];
