import { SystemId } from "~/types";
import { generateSlices as miltyGenerateSlices } from "../milty/sliceGenerator";
import { SLICE_SHAPES } from "../sliceShapes";

function generateSlices(sliceCount: number, availableSystems: SystemId[]) {
  return miltyGenerateSlices(sliceCount, availableSystems, SLICE_SHAPES.wekker);
}

export { generateSlices };
