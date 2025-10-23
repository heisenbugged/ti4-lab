import { Faction, FactionId } from "~/types";

export const factions: Record<FactionId, Faction> = {
  sardakk: {
    id: "sardakk",
    iconPath: "/factions/ti_norr.png",
    name: "Sardakk N'orr",
    set: "base",
    wiki: "https://twilight-imperium.fandom.com/wiki/Sardakk_N%27orr",
    priorityOrder: 42, // TODO: Replace with actual Twilight's Fall data
    fleetComposition: null, // TODO: Replace with actual starting units
  },
  arborec: {
    id: "arborec",
    iconPath: "/factions/ti_arborec.png",
    name: "Arborec",
    set: "base",
    wiki: "https://twilight-imperium.fandom.com/wiki/Arborec",
  },
  barony: {
    id: "barony",
    iconPath: "/factions/ti_letnev.png",
    name: "Barony of Letnev",
    set: "base",
    wiki: "https://twilight-imperium.fandom.com/wiki/Barony_of_Letnev",
  },
  saar: {
    id: "saar",
    iconPath: "/factions/ti_saar.png",
    name: "Clan of Saar",
    set: "base",
    wiki: "https://twilight-imperium.fandom.com/wiki/Clan_of_Saar",
  },
  muaat: {
    id: "muaat",
    iconPath: "/factions/ti_muaat.png",
    name: "Embers of Muaat",
    set: "base",
    wiki: "https://twilight-imperium.fandom.com/wiki/Embers_of_Muaat",
  },
  hacan: {
    id: "hacan",
    iconPath: "/factions/ti_hacan.png",
    name: "Emirates of Hacan",
    set: "base",
    wiki: "https://twilight-imperium.fandom.com/wiki/Emirates_of_Hacan",
  },
  sol: {
    id: "sol",
    iconPath: "/factions/ti_sol.png",
    name: "Federation of Sol",
    set: "base",
    wiki: "https://twilight-imperium.fandom.com/wiki/Federation_of_Sol",
  },
  creuss: {
    id: "creuss",
    iconPath: "/factions/ti_creuss.png",
    name: "Ghosts of Creuss",
    set: "base",
    wiki: "https://twilight-imperium.fandom.com/wiki/Ghosts_of_Creuss",
  },
  l1z1x: {
    id: "l1z1x",
    iconPath: "/factions/ti_l1z1x.png",
    name: "L1Z1X Mindnet",
    set: "base",
    wiki: "https://twilight-imperium.fandom.com/wiki/L1Z1X_Mindnet",
  },
  mentak: {
    id: "mentak",
    iconPath: "/factions/ti_mentak.png",
    name: "Mentak Coalition",
    set: "base",
    wiki: "https://twilight-imperium.fandom.com/wiki/Mentak_Coalition",
  },
  naalu: {
    id: "naalu",
    iconPath: "/factions/ti_naalu.png",
    name: "Naalu Collective",
    set: "base",
    wiki: "https://twilight-imperium.fandom.com/wiki/Naalu_Collective",
  },
  nekro: {
    id: "nekro",
    iconPath: "/factions/ti_nekro.png",
    name: "Nekro Virus",
    set: "base",
    wiki: "https://twilight-imperium.fandom.com/wiki/Nekro_Virus",
  },
  jolnar: {
    id: "jolnar",
    iconPath: "/factions/ti_jolnar.png",
    name: "Universities of Jol-Nar",
    set: "base",
    wiki: "https://twilight-imperium.fandom.com/wiki/Universities_of_Jol-Nar",
  },
  winnu: {
    id: "winnu",
    iconPath: "/factions/ti_winnu.png",
    name: "Winnu",
    set: "base",
    wiki: "https://twilight-imperium.fandom.com/wiki/Winnu",
  },
  xxcha: {
    id: "xxcha",
    iconPath: "/factions/ti_xxcha.png",
    name: "Xxcha Kingdom",
    set: "base",
    wiki: "https://twilight-imperium.fandom.com/wiki/Xxcha_Kingdom",
  },
  yin: {
    id: "yin",
    iconPath: "/factions/ti_yin.png",
    name: "Yin Brotherhood",
    set: "base",
    wiki: "https://twilight-imperium.fandom.com/wiki/Yin_Brotherhood",
  },
  yssaril: {
    id: "yssaril",
    iconPath: "/factions/ti_yssaril.png",
    name: "Yssaril Tribes",
    set: "base",
    wiki: "https://twilight-imperium.fandom.com/wiki/Yssaril_Tribes",
  },
  argent: {
    id: "argent",
    iconPath: "/factions/ti_argent.png",
    name: "Argent Flight",
    set: "pok",
    wiki: "https://twilight-imperium.fandom.com/wiki/Argent_Flight",
  },
  empyrean: {
    id: "empyrean",
    iconPath: "/factions/ti_empyrean.png",
    name: "Empyrean",
    set: "pok",
    wiki: "https://twilight-imperium.fandom.com/wiki/Empyrean",
  },
  mahact: {
    id: "mahact",
    iconPath: "/factions/ti_mahact.png",
    name: "Mahact Gene-Sorcerers",
    set: "pok",
    wiki: "https://twilight-imperium.fandom.com/wiki/Mahact_Gene-Sorcerers",
  },
  naazrokha: {
    id: "naazrokha",
    iconPath: "/factions/ti_naazrokha.png",
    name: "Naaz-Rokha Alliance",
    set: "pok",
    wiki: "https://twilight-imperium.fandom.com/wiki/Naaz-Rokha_Alliance",
  },
  nomad: {
    id: "nomad",
    iconPath: "/factions/ti_nomad.png",
    name: "Nomad",
    set: "pok",
    wiki: "https://twilight-imperium.fandom.com/wiki/Nomad",
  },
  titans: {
    id: "titans",
    iconPath: "/factions/ti_ul.png",
    name: "Titans of Ul",
    set: "pok",
    wiki: "https://twilight-imperium.fandom.com/wiki/Titans_of_Ul",
  },
  vulraith: {
    id: "vulraith",
    iconPath: "/factions/ti_vuilraith.png",
    name: "Vuil'Raith Cabal",
    set: "pok",
    wiki: "https://twilight-imperium.fandom.com/wiki/Vuil%27Raith_Cabal",
  },
  keleres: {
    id: "keleres",
    iconPath: "/factions/ti_keleres.png",
    name: "Council Keleres",
    set: "pok",
    wiki: "https://twilight-imperium.fandom.com/wiki/Council_Keleres",
  },
  // Thunder's Edge
  bastion: {
    id: "bastion",
    iconPath: "/factions/ti_bastion.png",
    name: "Last Bastion",
    wiki: "https://twilight-imperium.fandom.com/wiki/Last_Bastion",
    set: "te",
  },
  dws: {
    id: "dws",
    iconPath: "/factions/ti_dws.png",
    name: "The Deepwrought Scholarate",
    wiki: "https://twilight-imperium.fandom.com/wiki/The_Deepwrought_Scholarate",
    set: "te",
  },
  crimson: {
    id: "crimson",
    iconPath: "/factions/ti_crimson.png",
    name: "The Crimson Rebellion",
    wiki: "https://twilight-imperium.fandom.com/wiki/The_Crimson_Rebellion",
    set: "te",
  },
  ralnel: {
    id: "ralnel",
    iconPath: "/factions/ti_ralnel.png",
    name: "The Ral Nel Consortium",
    wiki: "https://twilight-imperium.fandom.com/wiki/The_Ral_Nel_Consortium",
    set: "te",
  },
  firmament: {
    id: "firmament",
    iconPath: "/factions/ti_firmament.png",
    name: "The Firmament",
    wiki: "https://twilight-imperium.fandom.com/wiki/The_Firmament_/_The_Obsidian",
    set: "te",
  },
  // Discordant Stars
  ilyxum: {
    id: "ilyxum",
    iconPath: "/factions/ti_ilyxum.png",
    name: "Augurs of Ilyxum",
    wiki: "https://twilight-imperium.fandom.com/wiki/Augurs_of_Ilyxum_(UNOFFICIAL)",
    set: "discordant",
  },
  celdauri: {
    id: "celdauri",
    iconPath: "/factions/ti_celdauri.png",
    name: "Celdauri Trade Confederation",
    wiki: "https://twilight-imperium.fandom.com/wiki/Celdauri_Trade_Confederation_(UNOFFICIAL)",
    set: "discordant",
  },
  dihmohn: {
    id: "dihmohn",
    iconPath: "/factions/ti_dihmohn.png",
    name: "Dih-Mohn Flotilla",
    wiki: "https://twilight-imperium.fandom.com/wiki/Dih-Mohn_Flotilla_(UNOFFICIAL)",
    set: "discordant",
  },
  florzen: {
    id: "florzen",
    iconPath: "/factions/ti_florzen.png",
    name: "Florzen Profiteers",
    wiki: "https://twilight-imperium.fandom.com/wiki/Florzen_Profiteers_(UNOFFICIAL)",
    set: "discordant",
  },
  freesystems: {
    id: "freesystems",
    iconPath: "/factions/ti_freesystems.png",
    name: "Free Systems Compact",
    wiki: "https://twilight-imperium.fandom.com/wiki/Free_Systems_Compact_(UNOFFICIAL)",
    set: "discordant",
  },
  ghemina: {
    id: "ghemina",
    iconPath: "/factions/ti_ghemina.png",
    name: "Ghemina Raiders",
    wiki: "https://twilight-imperium.fandom.com/wiki/Ghemina_Raiders_(UNOFFICIAL)",
    set: "discordant",
  },
  mortheus: {
    id: "mortheus",
    iconPath: "/factions/ti_mortheus.png",
    name: "Glimmer of Mortheus",
    wiki: "https://twilight-imperium.fandom.com/wiki/Glimmer_of_Mortheus_(UNOFFICIAL)",
    set: "discordant",
  },
  kollecc: {
    id: "kollecc",
    iconPath: "/factions/ti_kollecc.png",
    name: "Kollecc Society",
    wiki: "https://twilight-imperium.fandom.com/wiki/Kollecc_Society_(UNOFFICIAL)",
    set: "discordant",
  },
  kortali: {
    id: "kortali",
    iconPath: "/factions/ti_kortali.png",
    name: "Kortali Tribunal",
    wiki: "https://twilight-imperium.fandom.com/wiki/Kortali_Tribunal_(UNOFFICIAL)",
    set: "discordant",
  },
  lizho: {
    id: "lizho",
    iconPath: "/factions/ti_lizho.png",
    name: "Li-Zho Dynasty",
    wiki: "https://twilight-imperium.fandom.com/wiki/Li-Zho_Dynasty_(UNOFFICIAL)",
    set: "discordant",
  },
  khrask: {
    id: "khrask",
    iconPath: "/factions/ti_khrask.png",
    name: "L'Tokk Khrask",
    wiki: "https://twilight-imperium.fandom.com/wiki/L%27tokk_Khrask_(UNOFFICIAL)",
    set: "discordant",
  },
  mirveda: {
    id: "mirveda",
    iconPath: "/factions/ti_mirveda.png",
    name: "Mirveda Protectorate",
    wiki: "https://twilight-imperium.fandom.com/wiki/Mirveda_Protectorate_(UNOFFICIAL)",
    set: "discordant",
  },
  myko: {
    id: "myko",
    iconPath: "/factions/ti_myko.png",
    name: "Myko-Mentori",
    wiki: "https://twilight-imperium.fandom.com/wiki/Myko-Mentori_(UNOFFICIAL)",
    set: "discordant",
  },
  nivyn: {
    id: "nivyn",
    iconPath: "/factions/ti_nivyn.png",
    name: "Nivyn Star Kings",
    wiki: "https://twilight-imperium.fandom.com/wiki/Nivyn_Star_Kings_(UNOFFICIAL)",
    set: "discordant",
  },
  olradin: {
    id: "olradin",
    iconPath: "/factions/ti_olradin.png",
    name: "Olradin League",
    wiki: "https://twilight-imperium.fandom.com/wiki/Olradin_League_(UNOFFICIAL)",
    set: "discordant",
  },
  rohdina: {
    id: "rohdina",
    iconPath: "/factions/ti_rohdina.png",
    name: "Roh'Dhna Mechatronics",
    wiki: "https://twilight-imperium.fandom.com/wiki/Roh%27Dhna_Mechatronics_(UNOFFICIAL)",
    set: "discordant",
  },
  cymiae: {
    id: "cymiae",
    iconPath: "/factions/ti_cymiae.png",
    name: "Savages of Cymiae",
    wiki: "https://twilight-imperium.fandom.com/wiki/Savages_of_Cymiae_(UNOFFICIAL)",
    set: "discordant",
  },
  axis: {
    id: "axis",
    iconPath: "/factions/ti_axis.png",
    name: "Shipwrights of Axis",
    wiki: "https://twilight-imperium.fandom.com/wiki/Shipwrights_of_Axis_(UNOFFICIAL)",
    set: "discordant",
  },
  tnelis: {
    id: "tnelis",
    iconPath: "/factions/ti_tnelis.png",
    name: "Tnelis Syndicate",
    wiki: "https://twilight-imperium.fandom.com/wiki/Tnelis_Syndicate_(UNOFFICIAL)",
    set: "discordant",
  },
  vaden: {
    id: "vaden",
    iconPath: "/factions/ti_vaden.png",
    name: "Vaden Banking Clans",
    wiki: "https://twilight-imperium.fandom.com/wiki/Vaden_Banking_Clans_(UNOFFICIAL)",
    set: "discordant",
  },
  vaylerian: {
    id: "vaylerian",
    iconPath: "/factions/ti_vaylerian.png",
    name: "Vaylerian Scourge",
    wiki: "https://twilight-imperium.fandom.com/wiki/Vaylerian_Scourge_(UNOFFICIAL)",
    set: "discordant",
  },
  veldyr: {
    id: "veldyr",
    iconPath: "/factions/ti_veldyr.png",
    name: "Veldyr Sovereignty",
    wiki: "https://twilight-imperium.fandom.com/wiki/Veldyr_Sovereignty_(UNOFFICIAL)",
    set: "discordant",
  },
  rhodun: {
    id: "rhodun",
    iconPath: "/factions/ti_rhodun.png",
    name: "Zealots of Rhodun",
    wiki: "https://twilight-imperium.fandom.com/wiki/Zealots_of_Rhodun_(UNOFFICIAL)",
    set: "discordant",
  },
  zelian: {
    id: "zelian",
    iconPath: "/factions/ti_zelian.png",
    name: "Zelian Purifier",
    wiki: "https://twilight-imperium.fandom.com/wiki/Zelian_Purifier_(UNOFFICIAL)",
    set: "discordant",
  },
  bentor: {
    id: "bentor",
    iconPath: "/factions/ti_bentor.png",
    name: "Bentor Conglomerate",
    wiki: "https://twilight-imperium.fandom.com/wiki/Bentor_Conglomerate_(UNOFFICIAL)",
    set: "discordantexp",
  },
  kjalengard: {
    id: "kjalengard",
    iconPath: "/factions/ti_kjalengard.png",
    name: "Berserkers of Kjalengard",
    wiki: "https://twilight-imperium.fandom.com/wiki/Berserkers_of_Kjalengard_(UNOFFICIAL)",
    set: "discordantexp",
  },
  cheiran: {
    id: "cheiran",
    iconPath: "/factions/ti_cheiran.png",
    name: "Cheiran Hordes",
    wiki: "https://twilight-imperium.fandom.com/wiki/Cheiran_Hordes_(UNOFFICIAL)",
    set: "discordantexp",
  },
  edyn: {
    id: "edyn",
    iconPath: "/factions/ti_edyn.png",
    name: "Edyn Mandate",
    wiki: "https://twilight-imperium.fandom.com/wiki/Edyn_Mandate_(UNOFFICIAL)",
    set: "discordantexp",
  },
  ghoti: {
    id: "ghoti",
    iconPath: "/factions/ti_ghoti.png",
    name: "Ghoti Wayfarers",
    wiki: "https://twilight-imperium.fandom.com/wiki/Ghoti_Wayfarers_(UNOFFICIAL)",
    set: "discordantexp",
  },
  gledge: {
    id: "gledge",
    iconPath: "/factions/ti_gledge.png",
    name: "Gledge Union",
    wiki: "https://twilight-imperium.fandom.com/wiki/Gledge_Union_(UNOFFICIAL)",
    set: "discordantexp",
  },
  kyro: {
    id: "kyro",
    iconPath: "/factions/ti_kyro.png",
    name: "Kyro Sodality",
    wiki: "https://twilight-imperium.fandom.com/wiki/Kyro_Sodality_(UNOFFICIAL)",
    set: "discordantexp",
  },
  lanefir: {
    id: "lanefir",
    iconPath: "/factions/ti_lanefir.png",
    name: "Lanefir Remnants",
    wiki: "https://twilight-imperium.fandom.com/wiki/Lanefir_Remnants_(UNOFFICIAL)",
    set: "discordantexp",
  },
  kolume: {
    id: "kolume",
    iconPath: "/factions/ti_kolume.png",
    name: "The Monks of Kolume",
    wiki: "https://twilight-imperium.fandom.com/wiki/Monks_of_Kolume_(UNOFFICIAL)",
    set: "discordantexp",
  },
  nokar: {
    id: "nokar",
    iconPath: "/factions/ti_nokar.png",
    name: "Nokar Sellships",
    wiki: "https://twilight-imperium.fandom.com/wiki/Nokar_Sellships_(UNOFFICIAL)",
    set: "discordantexp",
  },
  drahn: {
    id: "drahn",
    iconPath: "/factions/ti_drahn.png",
    name: "Drahn Consortium",
    wiki: "https://twilight-imperium.fandom.com/",
    set: "drahn",
  },
} as const;

export const allFactionIds = Object.keys(factions) as FactionId[];
export const baseFactionIds = Object.values(factions)
  .filter((faction) => faction.set === "base")
  .map((faction) => faction.id);

export const pokFactionIds = Object.values(factions)
  .filter((faction) => faction.set === "pok")
  .map((faction) => faction.id);

export const teFactionIds = Object.values(factions)
  .filter((faction) => faction.set === "te")
  .map((faction) => faction.id);

export const factionDiscordantIds = Object.values(factions)
  .filter((faction) => faction.set === "discordant")
  .map((faction) => faction.id);
export const factionDiscordantExpIds = Object.values(factions)
  .filter((faction) => faction.set === "discordantexp")
  .map((faction) => faction.id);

export function getFactionCount(sets: string[]) {
  return Object.values(factions).filter((faction) => sets.includes(faction.set))
    .length;
}

export const playerColors = [
  "blue",
  "red",
  "green",
  "magenta",
  "violet",
  "orange",
  "gray",
  "cyan",
];
