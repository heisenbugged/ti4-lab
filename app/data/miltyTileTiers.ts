import { ChoosableTier } from "~/draft";
import { FactionId, SystemId } from "~/types";

const miltyTiers: Record<ChoosableTier, number[]> = {
  high: [
    28, 29, 30, 32, 33, 35, 36, 38, 69, 70, 71, 75,
    // TE
    108, 110,
    // DS
    4261, 4262, 4263, 4264, 4266, 4268,
  ],
  med: [
    26, 27, 31, 34, 37, 64, 65, 66, 72, 73, 74, 76,
    // TE
    97, 98, 99, 100, 103, 105, 106, 107, 109, 111,
    // DS
    4253, 4254, 4255, 4256, 4257, 4258, 4259, 4260, 4267,
  ],
  low: [19, 20, 21, 22, 23, 24, 25, 59, 60, 61, 62, 63,
    // TE
    102, 104,
  ],
  red: [
    39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 67, 68, 77, 78, 79, 80, 113,
    114, 115, 116, 117, 118, 4269, 4272, 4273, 4274, 4275, 4276, 4271, 4270,
  ],
};

export const miltySystemTiers = Object.entries(miltyTiers).reduce(
  (acc, [tier, systems]) => {
    systems.forEach((systemId) => {
      const str = systemId.toString();
      acc[str] = tier as ChoosableTier;
    });
    return acc;
  },
  {} as Record<SystemId, ChoosableTier>,
);

export const minorFactionTiers: Record<ChoosableTier, FactionId[]> = {
  high: [
    "mahact",
    "nomad",
    "winnu",
    "barony",
    "sardakk",
    "argent",
    "jolnar",
    "muaat",
    "nekro",
    "titans",
    "dws",

  ],
  med: ["yin", "naazrokha", "xxcha", "empyrean", "vulraith", "crimson", "ralnel"],
  low: [
    "hacan",
    "yssaril",
    "sol",
    "l1z1x",
    "naalu",
    "saar",
    "creuss",
    "arborec",
    "mentak",
    "bastion",
  ],
  red: [],
};
