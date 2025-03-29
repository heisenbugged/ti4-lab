import { shuffle } from "~/draft/helpers/randomization";
import type { FactionId } from "~/types";

// Add a base URL for your Cloudflare R2 CDN
const CDN_BASE_URL = "https://pub-0d0c405d32714102a425f3be2f199990.r2.dev";

// Update factionIds to include all factions used in factionAudios
export const factionIds: FactionId[] = [
  "muaat",
  "sol",
  "hacan",
  "xxcha",
  "nomad",
  "jolnar",
  "l1z1x",
  "empyrean",
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
    homeDefense: [`${CDN_BASE_URL}/voices/jolnar/homedefense.mp3`],
    homeInvasion: [`${CDN_BASE_URL}/voices/jolnar/homeinvasion.mp3`],
    defenseOutnumbered: [
      `${CDN_BASE_URL}/voices/jolnar/defenseoutnumbered.mp3`,
    ],
    offenseSuperior: [`${CDN_BASE_URL}/voices/jolnar/offensesuperior.mp3`],
    battleLines: [
      `${CDN_BASE_URL}/voices/jolnar/battle1.mp3`,
      `${CDN_BASE_URL}/voices/jolnar/battle2.mp3`,
      `${CDN_BASE_URL}/voices/jolnar/battle3.mp3`,
      `${CDN_BASE_URL}/voices/jolnar/battle4.mp3`,
      `${CDN_BASE_URL}/voices/jolnar/battle5.mp3`,
      `${CDN_BASE_URL}/voices/jolnar/battle6.mp3`,
      `${CDN_BASE_URL}/voices/jolnar/battle7.mp3`,
      `${CDN_BASE_URL}/voices/jolnar/battle8.mp3`,
    ],
    special: {
      title: "Tech Acquired",
      uris: [
        `${CDN_BASE_URL}/voices/jolnar/special1.mp3`,
        `${CDN_BASE_URL}/voices/jolnar/special2.mp3`,
      ],
    },
    jokes: [
      `${CDN_BASE_URL}/voices/jolnar/joke1.mp3`,
      `${CDN_BASE_URL}/voices/jolnar/joke2.mp3`,
      `${CDN_BASE_URL}/voices/jolnar/joke3.mp3`,
      `${CDN_BASE_URL}/voices/jolnar/joke4.mp3`,
      `${CDN_BASE_URL}/voices/jolnar/joke5.mp3`,
    ],
  },
  l1z1x: {
    battleAnthem: "spotify:track:5HiAN0PZVXUSMgpiqrScC9",
    homeDefense: [`${CDN_BASE_URL}/voices/l1z1x/homedefense.mp3`],
    homeInvasion: [`${CDN_BASE_URL}/voices/l1z1x/homeinvasion.mp3`],
    defenseOutnumbered: [`${CDN_BASE_URL}/voices/l1z1x/defenseoutnumbered.mp3`],
    offenseSuperior: [`${CDN_BASE_URL}/voices/l1z1x/offensesuperior.mp3`],
    battleLines: [
      `${CDN_BASE_URL}/voices/l1z1x/battle1.mp3`,
      `${CDN_BASE_URL}/voices/l1z1x/battle2.mp3`,
      `${CDN_BASE_URL}/voices/l1z1x/battle3.mp3`,
      `${CDN_BASE_URL}/voices/l1z1x/battle4.mp3`,
      `${CDN_BASE_URL}/voices/l1z1x/battle5.mp3`,
      `${CDN_BASE_URL}/voices/l1z1x/battle6.mp3`,
      `${CDN_BASE_URL}/voices/l1z1x/battle7.mp3`,
      `${CDN_BASE_URL}/voices/l1z1x/battle8.mp3`,
    ],
    jokes: [
      `${CDN_BASE_URL}/voices/l1z1x/joke1.mp3`,
      `${CDN_BASE_URL}/voices/l1z1x/joke2.mp3`,
    ],
    special: {
      title: "Assimilation",
      uris: [
        `${CDN_BASE_URL}/voices/l1z1x/special1.mp3`,
        `${CDN_BASE_URL}/voices/l1z1x/special2.mp3`,
      ],
    },
    special2: {
      title: "Harrow",
      uris: [
        `${CDN_BASE_URL}/voices/l1z1x/special11.mp3`,
        `${CDN_BASE_URL}/voices/l1z1x/special12.mp3`,
      ],
    },
  },
  muaat: {
    battleAnthem: "spotify:track:46h0MLW2ONEGKJTUdFNx5f",
    homeDefense: [`${CDN_BASE_URL}/voices/muaat/homedefense.mp3`],
    homeInvasion: [`${CDN_BASE_URL}/voices/muaat/homeinvasion.mp3`],
    defenseOutnumbered: [`${CDN_BASE_URL}/voices/muaat/defenseoutnumbered.mp3`],
    offenseSuperior: [`${CDN_BASE_URL}/voices/muaat/offensesuperior.mp3`],
    battleLines: [
      `${CDN_BASE_URL}/voices/muaat/battle1.mp3`,
      `${CDN_BASE_URL}/voices/muaat/battle2.mp3`,
      `${CDN_BASE_URL}/voices/muaat/battle3.mp3`,
      `${CDN_BASE_URL}/voices/muaat/battle4.mp3`,
      `${CDN_BASE_URL}/voices/muaat/battle5.mp3`,
      `${CDN_BASE_URL}/voices/muaat/battle6.mp3`,
      `${CDN_BASE_URL}/voices/muaat/battle7.mp3`,
      `${CDN_BASE_URL}/voices/muaat/battle8.mp3`,
    ],
    jokes: [
      `${CDN_BASE_URL}/voices/muaat/joke1.mp3`,
      `${CDN_BASE_URL}/voices/muaat/joke2.mp3`,
      `${CDN_BASE_URL}/voices/muaat/joke3.mp3`,
    ],
    special: {
      title: "War Sun Built",
      uris: [
        `${CDN_BASE_URL}/voices/muaat/special1.mp3`,
        `${CDN_BASE_URL}/voices/muaat/special2.mp3`,
      ],
    },
  },
  sol: {
    battleAnthem: "spotify:track:6Rlybp1JsE3GUjYp5rC0mo",
    homeDefense: [`${CDN_BASE_URL}/voices/sol/homedefense.mp3`],
    homeInvasion: [`${CDN_BASE_URL}/voices/sol/homeinvasion.mp3`],
    defenseOutnumbered: [`${CDN_BASE_URL}/voices/sol/defenseoutnumbered.mp3`],
    offenseSuperior: [`${CDN_BASE_URL}/voices/sol/offensesuperior.mp3`],
    battleLines: [
      `${CDN_BASE_URL}/voices/sol/battle1.mp3`,
      `${CDN_BASE_URL}/voices/sol/battle2.mp3`,
      `${CDN_BASE_URL}/voices/sol/battle3.mp3`,
      `${CDN_BASE_URL}/voices/sol/battle4.mp3`,
      `${CDN_BASE_URL}/voices/sol/battle5.mp3`,
      `${CDN_BASE_URL}/voices/sol/battle6.mp3`,
      `${CDN_BASE_URL}/voices/sol/battle7.mp3`,
      `${CDN_BASE_URL}/voices/sol/battle8.mp3`,
    ],
    jokes: [
      `${CDN_BASE_URL}/voices/sol/joke1.mp3`,
      `${CDN_BASE_URL}/voices/sol/joke2.mp3`,
    ],
    special: {
      title: "Orbital Drop",
      uris: [
        `${CDN_BASE_URL}/voices/sol/special1.mp3`,
        `${CDN_BASE_URL}/voices/sol/special2.mp3`,
        // `${CDN_BASE_URL}/voices/sol/special3.mp3`,
      ],
    },
  },
  hacan: {
    battleAnthem: "spotify:track:61Ps2sXXwiYCcyAynt81JI",
    // epic home system delay
    // battleAnthemDelay: 153000,
    battleAnthemDelay: 80000,
    homeDefense: [`${CDN_BASE_URL}/voices/hacan/home-defense-2.mp3`],
    homeInvasion: [`${CDN_BASE_URL}/voices/hacan/home-invasion.mp3`],
    defenseOutnumbered: [
      `${CDN_BASE_URL}/voices/hacan/defense-outnumbered.mp3`,
    ],
    offenseSuperior: [`${CDN_BASE_URL}/voices/hacan/offense-superior.mp3`],
    battleLines: [
      `${CDN_BASE_URL}/voices/hacan/battle-1.mp3`,
      `${CDN_BASE_URL}/voices/hacan/battle-2.mp3`,
      `${CDN_BASE_URL}/voices/hacan/battle-3.mp3`,
      `${CDN_BASE_URL}/voices/hacan/battle-4.mp3`,
      `${CDN_BASE_URL}/voices/hacan/battle-5.mp3`,
      `${CDN_BASE_URL}/voices/hacan/battle-6.mp3`,
      `${CDN_BASE_URL}/voices/hacan/battle-7.mp3`,
      `${CDN_BASE_URL}/voices/hacan/battle-8.mp3`,
    ],
    jokes: [`${CDN_BASE_URL}/voices/hacan/joke1.mp3`],
    special: {
      title: "Trade used",
      uris: [
        `${CDN_BASE_URL}/voices/hacan/special1.mp3`,
        `${CDN_BASE_URL}/voices/hacan/special2.mp3`,
      ],
    },
  },
  nomad: {
    battleAnthem: "spotify:track:2Qr9qyTz3NxoSlLOzLUefL",
    homeDefense: [`${CDN_BASE_URL}/voices/nomad/homedefense.mp3`],
    homeInvasion: [`${CDN_BASE_URL}/voices/nomad/homeinvasion.mp3`],
    defenseOutnumbered: [`${CDN_BASE_URL}/voices/nomad/defenseoutnumbered.mp3`],
    offenseSuperior: [`${CDN_BASE_URL}/voices/nomad/offensesuperior.mp3`],
    battleLines: [
      `${CDN_BASE_URL}/voices/nomad/battle1.mp3`,
      `${CDN_BASE_URL}/voices/nomad/battle2.mp3`,
      `${CDN_BASE_URL}/voices/nomad/battle3.mp3`,
      `${CDN_BASE_URL}/voices/nomad/battle4.mp3`,
      `${CDN_BASE_URL}/voices/nomad/battle5.mp3`,
      `${CDN_BASE_URL}/voices/nomad/battle6.mp3`,
      `${CDN_BASE_URL}/voices/nomad/battle7.mp3`,
      `${CDN_BASE_URL}/voices/nomad/battle8.mp3`,
    ],
    jokes: [
      `${CDN_BASE_URL}/voices/nomad/joke1.mp3`,
      `${CDN_BASE_URL}/voices/nomad/joke2.mp3`,
      `${CDN_BASE_URL}/voices/nomad/joke3.mp3`,
    ],
    special: {
      title: "Calvary Sold",
      uris: [
        `${CDN_BASE_URL}/voices/nomad/special1.mp3`,
        `${CDN_BASE_URL}/voices/nomad/special2.mp3`,
      ],
    },
  },
  xxcha: {
    battleAnthem: "spotify:track:5cvEWY2qrrPkkjv9x0a7ue",
    homeDefense: [`${CDN_BASE_URL}/voices/xxcha/homedefense.mp3`],
    homeInvasion: [`${CDN_BASE_URL}/voices/xxcha/homeinvasion.mp3`],
    defenseOutnumbered: [`${CDN_BASE_URL}/voices/xxcha/defenseoutnumbered.mp3`],
    offenseSuperior: [`${CDN_BASE_URL}/voices/xxcha/offensesuperior.mp3`],
    battleLines: [
      `${CDN_BASE_URL}/voices/xxcha/battle1.mp3`,
      `${CDN_BASE_URL}/voices/xxcha/battle2.mp3`,
      `${CDN_BASE_URL}/voices/xxcha/battle3.mp3`,
      `${CDN_BASE_URL}/voices/xxcha/battle4.mp3`,
      `${CDN_BASE_URL}/voices/xxcha/battle5.mp3`,
      `${CDN_BASE_URL}/voices/xxcha/battle6.mp3`,
      `${CDN_BASE_URL}/voices/xxcha/battle7.mp3`,
      `${CDN_BASE_URL}/voices/xxcha/battle8.mp3`,
      `${CDN_BASE_URL}/voices/xxcha/battle9.mp3`,
    ],
    special: {
      title: "Diplomacy Used",
      uris: [
        `${CDN_BASE_URL}/voices/xxcha/special1.mp3`,
        `${CDN_BASE_URL}/voices/xxcha/special2.mp3`,
      ],
    },
    jokes: [`${CDN_BASE_URL}/voices/xxcha/joke2.mp3`],
  },
  empyrean: {
    battleAnthem: "spotify:track:018SQDupRTRsl1Wolu1X0c",
    homeDefense: [`${CDN_BASE_URL}/voices/empyrean/homedefense.mp3`],
    homeInvasion: [`${CDN_BASE_URL}/voices/empyrean/homeinvasion.mp3`],
    defenseOutnumbered: [
      `${CDN_BASE_URL}/voices/empyrean/defenseoutnumbered.mp3`,
    ],
    offenseSuperior: [`${CDN_BASE_URL}/voices/empyrean/offensesuperior.mp3`],
    battleLines: [
      `${CDN_BASE_URL}/voices/empyrean/battle1.mp3`,
      `${CDN_BASE_URL}/voices/empyrean/battle2.mp3`,
      `${CDN_BASE_URL}/voices/empyrean/battle3.mp3`,
      `${CDN_BASE_URL}/voices/empyrean/battle4.mp3`,
      `${CDN_BASE_URL}/voices/empyrean/battle5.mp3`,
      `${CDN_BASE_URL}/voices/empyrean/battle6.mp3`,
      `${CDN_BASE_URL}/voices/empyrean/battle7.mp3`,
      `${CDN_BASE_URL}/voices/empyrean/battle8.mp3`,
    ],
    jokes: [
      `${CDN_BASE_URL}/voices/empyrean/joke1.mp3`,
      `${CDN_BASE_URL}/voices/empyrean/joke2.mp3`,
      `${CDN_BASE_URL}/voices/empyrean/joke3.mp3`,
      `${CDN_BASE_URL}/voices/empyrean/joke4.mp3`,
    ],
    special: {
      title: "Frontier token",
      uris: [
        `${CDN_BASE_URL}/voices/empyrean/special1.mp3`,
        `${CDN_BASE_URL}/voices/empyrean/special2.mp3`,
      ],
    },
  },
} as const;

export const getAudioSrc = (factionId: FactionId, type: LineType): string => {
  const factionAudio = factionAudios[factionId];
  if (!factionAudio) return "";

  if (type === "special") return shuffle(factionAudio.special.uris)[0];
  if (type === "special2" && factionAudio.special2)
    return shuffle(factionAudio.special2.uris)[0];

  // For other types, we know they are string arrays or undefined
  return shuffle((factionAudio[type] as string[]) ?? [])[0];
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
