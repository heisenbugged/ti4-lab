import { System } from "./types";

// TODO: Move these methods elsewhere

export const valueSlice = (sliceSystems: System[], entropicScarValue = 2) =>
  sliceSystems.reduce(
    (acc, s) =>
      acc +
      s.optimalSpend.flex +
      s.optimalSpend.influence +
      s.optimalSpend.resources +
      (s.anomalies.includes("ENTROPIC_SCAR") ? entropicScarValue : 0),
    0,
  );
