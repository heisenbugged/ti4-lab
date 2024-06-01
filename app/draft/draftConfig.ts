/**
 * Represents the pre-computed values required to manipulate the map
 * during the drafting process.
 */
import { heisen } from "./heisen";
import { milty } from "./milty";
import { miltyeq } from "./miltyeq";
import { miltyeqless } from "./miltyeqless";
import { DraftConfig, DraftType } from "./types";
import { wekker } from "./wekker";

/**
 * The configuration for each draft type.
 */
export const draftConfig: Record<DraftType, DraftConfig> = {
  miltyeq,
  wekker,
  miltyeqless,
  milty,
  heisen,
};
