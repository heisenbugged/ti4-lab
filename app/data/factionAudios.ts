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
  homeDefense: string[];
  homeInvasion?: string[];
  defenseOutnumbered?: string[];
  offenseSuperior?: string[];
  battleLines?: string[];
  jokes?: string[];
};

export const factionAudios: Record<FactionId, FactionAudio> = {
  muaat: {
    battleAnthem: "spotify:track:46h0MLW2ONEGKJTUdFNx5f",
    homeDefense: ["/muaat-001.mp3"],
    homeInvasion: ["/muaat-002.mp3"],
    defenseOutnumbered: ["/muaat-003.mp3"],
    offenseSuperior: ["/muaat-004.mp3"],
    battleLines: [
      "/muaat-005.mp3",
      "/muaat-006.mp3",
      "/muaat-007.mp3",
      "/muaat-008.mp3",
      "/muaat-009.mp3",
      "/muaat-010.mp3",
      "/muaat-011.mp3",
      "/muaat-012.mp3",
    ],
    jokes: [
      "/muaat-016.mp3",
      "/muaat-017.mp3",
      "/muaat-018.mp3",
      "/muaat-019.mp3",
    ],
  },
  sol: {
    battleAnthem: "spotify:track:6Rlybp1JsE3GUjYp5rC0mo",
    homeDefense: ["/sol.mp3"],
  },
  hacan: {
    battleAnthem: "spotify:track:another_track_id_here",
    homeDefense: ["/hacan.mp3"],
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
    | "jokes",
): string => {
  const factionAudio = factionAudios[factionId];
  if (!factionAudio) return "";

  return shuffle(factionAudio[type] ?? [])[0];
};
