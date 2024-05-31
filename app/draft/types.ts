export type Tier = "low" | "med" | "high" | "red" | "resolved";
export type ChoosableTier = "low" | "med" | "high" | "red";
export type TieredSystems = {
  high: number[];
  med: number[];
  low: number[];
  red: number[];
};

export type TieredSlice = Tier[];
