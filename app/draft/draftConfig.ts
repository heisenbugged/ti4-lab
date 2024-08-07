/**
 * Represents the pre-computed values required to manipulate the map
 * during the drafting process.
 */
import { heisen } from "./heisen";
import { milty } from "./milty";
import { milty7p } from "./milty7p";
import { milty8p } from "./milty8p";
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
  milty7p,
  milty8p,
};
