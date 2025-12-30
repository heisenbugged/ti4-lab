import { System } from "./types";

export const calculateSliceValue = (
  sliceSystems: System[],
  entropicScarValue = 2,
) => {
  let value = 0;

  for (const system of sliceSystems) {
    value +=
      system.optimalSpend.resources +
      system.optimalSpend.influence +
      system.optimalSpend.flex;

    if (system.anomalies.includes("ENTROPIC_SCAR")) {
      value += entropicScarValue;
    }

    for (const planet of system.planets) {
      if (planet.tech && planet.tech.length > 0) {
        value += planet.tech.length * 0.5;
      }

      if (planet.legendary) {
        if (planet.name === "Hope's End") {
          value += 2;
        } else if (planet.name === "Emelpar") {
          value += 3;
        } else {
          value += 1;
        }
      }
    }
  }

  return value;
};

export const valueSlice = calculateSliceValue;
