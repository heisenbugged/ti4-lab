import { SystemId } from "~/types";
import { generateSlices as miltyGenerateSlices } from "../milty/sliceGenerator";
import { SLICE_SHAPES } from "../sliceShapes";
import { systemData } from "~/data/systemData";
import { shuffle } from "../helpers/randomization";

function generateSlices(sliceCount: number, availableSystems: SystemId[]) {
  const miltySlices = miltyGenerateSlices(
    sliceCount,
    availableSystems,
    {
      numAlphas: 0,
      numBetas: 0,
      numLegendaries: 0,
    },
    SLICE_SHAPES.wekker,
  );

  // ensure at least one blue adjacent to home system,
  miltySlices?.forEach((slice) => {
    const candidates: SystemId[] = [slice[0], slice[2]];
    const allRed = candidates.every(
      (systemId) => systemData[systemId].type === "RED",
    );

    if (allRed) {
      const blueSystems = slice.filter(
        (systemId) => systemData[systemId].type === "BLUE",
      );
      const candidate = shuffle(blueSystems)[0];
      const blueIdx = slice.findIndex((s) => s === candidate);
      const redSystem = candidates[Math.random() > 0.5 ? 0 : 1];
      const redIdx = slice.findIndex((s) => s === redSystem);
      const blueSystem = slice[blueIdx];

      slice[redIdx] = blueSystem;
      slice[blueIdx] = redSystem;
    }
  });

  return miltySlices;
}

export { generateSlices };
