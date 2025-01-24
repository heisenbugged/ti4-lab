import { shuffle } from "~/draft/helpers/randomization";
import type { FactionId } from "~/types";

export const factionIds: FactionId[] = [
  "muaat",
  "sol",
  "hacan",
  "xxcha",
  "nomad",
];

type FactionAudio = {
  battleAnthem: string;
  battleAnthemDelay?: number;
  homeDefense: string[];
  homeInvasion?: string[];
  defenseOutnumbered?: string[];
  offenseSuperior?: string[];
  battleLines?: string[];
  jokes?: string[];
  special: {
    title: string;
    uris: string[];
  };
};

export const factionAudios: Record<FactionId, FactionAudio> = {
  muaat: {
    battleAnthem: "spotify:track:46h0MLW2ONEGKJTUdFNx5f",
    homeDefense: ["/voices/muaat/homedefense.mp3"],
    homeInvasion: ["/voices/muaat/homeinvasion.mp3"],
    defenseOutnumbered: ["/voices/muaat/defenseoutnumbered.mp3"],
    offenseSuperior: ["/voices/muaat/offensesuperior.mp3"],
    battleLines: [
      "/voices/muaat/battle1.mp3",
      "/voices/muaat/battle2.mp3",
      "/voices/muaat/battle3.mp3",
      "/voices/muaat/battle4.mp3",
      "/voices/muaat/battle5.mp3",
      "/voices/muaat/battle6.mp3",
      "/voices/muaat/battle7.mp3",
      "/voices/muaat/battle8.mp3",
    ],
    jokes: [
      "/voices/muaat/joke1.mp3",
      "/voices/muaat/joke2.mp3",
      "/voices/muaat/joke3.mp3",
    ],
    special: {
      title: "War Sun Built",
      uris: ["/voices/muaat/special1.mp3", "/voices/muaat/special2.mp3"],
    },
  },
  sol: {
    battleAnthem: "spotify:track:6Rlybp1JsE3GUjYp5rC0mo",
    homeDefense: ["/voices/sol/homedefense.mp3"],
    homeInvasion: ["/voices/sol/homeinvasion.mp3"],
    defenseOutnumbered: ["/voices/sol/defenseoutnumbered.mp3"],
    offenseSuperior: ["/voices/sol/offensesuperior.mp3"],
    battleLines: [
      "/voices/sol/battle1.mp3",
      "/voices/sol/battle2.mp3",
      "/voices/sol/battle3.mp3",
      "/voices/sol/battle4.mp3",
      "/voices/sol/battle5.mp3",
      "/voices/sol/battle6.mp3",
      "/voices/sol/battle7.mp3",
      "/voices/sol/battle8.mp3",
    ],
    jokes: ["/voices/sol/joke1.mp3", "/voices/sol/joke2.mp3"],
    special: {
      title: "Orbital Drop",
      uris: [
        "/voices/sol/special1.mp3",
        "/voices/sol/special2.mp3",
        "/voices/sol/special3.mp3",
      ],
    },
  },
  hacan: {
    battleAnthem: "spotify:track:61Ps2sXXwiYCcyAynt81JI",
    battleAnthemDelay: 85000,
    homeDefense: ["/voices/hacan/home-defense.mp3"],
    homeInvasion: ["/voices/hacan/home-invasion.mp3"],
    defenseOutnumbered: ["/voices/hacan/defense-outnumbered.mp3"],
    offenseSuperior: ["/voices/hacan/offense-superior.mp3"],
    battleLines: [
      "/voices/hacan/battle-1.mp3",
      "/voices/hacan/battle-2.mp3",
      "/voices/hacan/battle-3.mp3",
      "/voices/hacan/battle-4.mp3",
      "/voices/hacan/battle-5.mp3",
      "/voices/hacan/battle-6.mp3",
      "/voices/hacan/battle-7.mp3",
      "/voices/hacan/battle-8.mp3",
    ],
    jokes: ["/voices/hacan/joke1.mp3"],
    special: {
      title: "Trade used",
      uris: ["/voices/hacan/special1.mp3", "/voices/hacan/special2.mp3"],
    },
  },
  nomad: {
    // https://open.spotify.com/track/2Qr9qyTz3NxoSlLOzLUefL?si=4d204c88244a4d3f
    battleAnthem: "spotify:track:2Qr9qyTz3NxoSlLOzLUefL",
    homeDefense: ["/voices/nomad/homedefense.mp3"],
    homeInvasion: ["/voices/nomad/homeinvasion.mp3"],
    defenseOutnumbered: ["/voices/nomad/defenseoutnumbered.mp3"],
    offenseSuperior: ["/voices/nomad/offensesuperior.mp3"],
    battleLines: [
      "/voices/nomad/battle1.mp3",
      "/voices/nomad/battle2.mp3",
      "/voices/nomad/battle3.mp3",
      "/voices/nomad/battle4.mp3",
      "/voices/nomad/battle5.mp3",
      "/voices/nomad/battle6.mp3",
      "/voices/nomad/battle7.mp3",
      "/voices/nomad/battle8.mp3",
    ],
    jokes: [
      "/voices/nomad/joke1.mp3",
      "/voices/nomad/joke2.mp3",
      "/voices/nomad/joke3.mp3",
    ],
    special: {
      title: "Calvary Sold",
      uris: ["/voices/nomad/special1.mp3", "/voices/nomad/special2.mp3"],
    },
  },
  xxcha: {
    battleAnthem: "spotify:track:5cvEWY2qrrPkkjv9x0a7ue",
    homeDefense: ["/voices/xxcha/homedefense.mp3"],
    homeInvasion: ["/voices/xxcha/homeinvasion.mp3"],
    defenseOutnumbered: ["/voices/xxcha/defenseoutnumbered.mp3"],
    offenseSuperior: ["/voices/xxcha/offensesuperior.mp3"],
    battleLines: [
      "/voices/xxcha/battle1.mp3",
      "/voices/xxcha/battle2.mp3",
      "/voices/xxcha/battle3.mp3",
      "/voices/xxcha/battle4.mp3",
      "/voices/xxcha/battle5.mp3",
      "/voices/xxcha/battle6.mp3",
      "/voices/xxcha/battle7.mp3",
      "/voices/xxcha/battle8.mp3",
      "/voices/xxcha/battle9.mp3",
    ],
    special: {
      title: "Diplomacy Used",
      uris: ["/voices/xxcha/special1.mp3", "/voices/xxcha/special2.mp3"],
    },
    jokes: ["/voices/xxcha/joke1.mp3", "/voices/xxcha/joke2.mp3"],
  },
} as const;

export const getAudioSrc = (
  factionId: FactionId,
  type:
    | "homeDefense"
    | "homeInvasion"
    | "defenseOutnumbered"
    | "offenseSuperior"
    | "battleLines"
    | "jokes"
    | "special",
): string => {
  const factionAudio = factionAudios[factionId];
  if (!factionAudio) return "";

  if (type === "special") return shuffle(factionAudio.special?.uris ?? [])[0];

  return shuffle(factionAudio[type] ?? [])[0];
};

export const getAllSrcs = (
  factionId: FactionId,
  type:
    | "homeDefense"
    | "homeInvasion"
    | "defenseOutnumbered"
    | "offenseSuperior"
    | "battleLines"
    | "jokes"
    | "special",
) => {
  if (type === "special") return factionAudios[factionId].special.uris;
  return factionAudios[factionId][type] ?? [];
};
