import { ChoosableTier } from "~/draft";
import { SystemId } from "~/types";

const miltyTiers: Record<ChoosableTier, number[]> = {
  high: [
    28, 29, 30, 32, 33, 35, 36, 38, 69, 70, 71, 75, 245, 246, 247, 248, 250,
    252,
  ],
  med: [
    26, 27, 31, 34, 37, 64, 65, 66, 72, 73, 74, 76, 237, 238, 239, 240, 241, 22,
    243, 244, 251,
  ],
  low: [19, 20, 21, 22, 23, 24, 25, 59, 60, 61, 62, 63, 249],
  red: [
    39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 67, 68, 77, 78, 79, 80, 253,
    256, 257, 258, 259, 260, 255, 254,
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
