import { System } from "./types";

// TODO: Move these methods elsewhere

export const valueSlice = (sliceSystems: System[]) =>
  sliceSystems.reduce(
    (acc, s) =>
      acc +
      s.optimalSpend.flex +
      s.optimalSpend.influence +
      s.optimalSpend.resources,
    0,
  );
