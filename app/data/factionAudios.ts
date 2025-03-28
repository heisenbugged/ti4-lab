import { shuffle } from "~/draft/helpers/randomization";
import type { FactionId } from "~/types";

export const factionIds: FactionId[] = [
  "muaat",
  "sol",
  "hacan",
  "xxcha",
  "nomad",
];

export type LineType =
  | "homeDefense"
  | "homeInvasion"
  | "defenseOutnumbered"
  | "offenseSuperior"
  | "battleLines"
  | "jokes"
  | "special"
  | "special2";

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
  special2?: {
    title: string;
    uris: string[];
  };
};

export const factionAudios: Record<FactionId, FactionAudio> = {
  jolnar: {
    battleAnthem: "spotify:track:3xlr5CPOArA6UEw6f29st9",
    homeDefense: ["/voices/jolnar/homedefense.mp3"],
    homeInvasion: ["/voices/jolnar/homeinvasion.mp3"],
    defenseOutnumbered: ["/voices/jolnar/defenseoutnumbered.mp3"],
    offenseSuperior: ["/voices/jolnar/offensesuperior.mp3"],
    battleLines: [
      "/voices/jolnar/battle1.mp3",
      "/voices/jolnar/battle2.mp3",
      "/voices/jolnar/battle3.mp3",
      "/voices/jolnar/battle4.mp3",
      "/voices/jolnar/battle5.mp3",
      "/voices/jolnar/battle6.mp3",
      "/voices/jolnar/battle7.mp3",
      "/voices/jolnar/battle8.mp3",
    ],
    special: {
      title: "Tech Acquired",
      uris: ["/voices/jolnar/special1.mp3", "/voices/jolnar/special2.mp3"],
    },
    jokes: [
      "/voices/jolnar/joke1.mp3",
      "/voices/jolnar/joke2.mp3",
      "/voices/jolnar/joke3.mp3",
      "/voices/jolnar/joke4.mp3",
      "/voices/jolnar/joke5.mp3",
    ],
  },
  l1z1x: {
    battleAnthem: "spotify:track:5HiAN0PZVXUSMgpiqrScC9",
    homeDefense: ["/voices/l1z1x/homedefense.mp3"],
    homeInvasion: ["/voices/l1z1x/homeinvasion.mp3"],
    defenseOutnumbered: ["/voices/l1z1x/defenseoutnumbered.mp3"],
    offenseSuperior: ["/voices/l1z1x/offensesuperior.mp3"],
    battleLines: [
      "/voices/l1z1x/battle1.mp3",
      "/voices/l1z1x/battle2.mp3",
      "/voices/l1z1x/battle3.mp3",
      "/voices/l1z1x/battle4.mp3",
      "/voices/l1z1x/battle5.mp3",
      "/voices/l1z1x/battle6.mp3",
      "/voices/l1z1x/battle7.mp3",
      "/voices/l1z1x/battle8.mp3",
    ],
    jokes: ["/voices/l1z1x/joke1.mp3", "/voices/l1z1x/joke2.mp3"],
    special: {
      title: "Assimilation",
      uris: ["/voices/l1z1x/special1.mp3", "/voices/l1z1x/special2.mp3"],
    },
    special2: {
      title: "Harrow",
      uris: ["/voices/l1z1x/special11.mp3", "/voices/l1z1x/special12.mp3"],
    },
  },
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
        // "/voices/sol/special3.mp3",
      ],
    },
  },
  hacan: {
    battleAnthem: "spotify:track:61Ps2sXXwiYCcyAynt81JI",
    // epic home system delay
    // battleAnthemDelay: 153000,
    battleAnthemDelay: 80000,
    homeDefense: ["/voices/hacan/home-defense-2.mp3"],
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
    jokes: ["/voices/xxcha/joke2.mp3"],
  },
  empyrean: {
    battleAnthem: "spotify:track:018SQDupRTRsl1Wolu1X0c",
    homeDefense: ["/voices/empyrean/homedefense.mp3"],
    homeInvasion: ["/voices/empyrean/homeinvasion.mp3"],
    defenseOutnumbered: ["/voices/empyrean/defenseoutnumbered.mp3"],
    offenseSuperior: ["/voices/empyrean/offensesuperior.mp3"],
    battleLines: [
      "/voices/empyrean/battle1.mp3",
      "/voices/empyrean/battle2.mp3",
      "/voices/empyrean/battle3.mp3",
      "/voices/empyrean/battle4.mp3",
      "/voices/empyrean/battle5.mp3",
      "/voices/empyrean/battle6.mp3",
      "/voices/empyrean/battle7.mp3",
      "/voices/empyrean/battle8.mp3",
    ],
    jokes: [
      "/voices/empyrean/joke1.mp3",
      "/voices/empyrean/joke2.mp3",
      "/voices/empyrean/joke3.mp3",
      "/voices/empyrean/joke4.mp3",
    ],
    special: {
      title: "Frontier token",
      uris: ["/voices/empyrean/special1.mp3", "/voices/empyrean/special2.mp3"],
    },
  },
} as const;

export const getAudioSrc = (factionId: FactionId, type: LineType): string => {
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
    | "special"
    | "special2",
) => {
  if (type === "special") return factionAudios[factionId].special.uris;
  if (type === "special2") return factionAudios[factionId].special2?.uris ?? [];
  return factionAudios[factionId][type] ?? [];
};
