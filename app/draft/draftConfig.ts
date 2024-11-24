/**
 * Represents the pre-computed values required to manipulate the map
 * during the drafting process.
 */
import { heisen } from "./heisen";
import { heisen8p } from "./heisen8p";
import { milty } from "./milty";
import { milty5p } from "./milty5p";
import { milty7p } from "./milty7p";
import { milty8p } from "./milty8p";
import { miltyeq } from "./miltyeq";
import { miltyeq5p } from "./miltyeq5p";
import { miltyeq7plarge } from "./miltyeq7plarge";
import { miltyeqless } from "./miltyeqless";
import { DraftConfig, DraftType } from "./types";
import { wekker } from "./wekker";

/**
 * The configuration for each draft type.
 */
export const draftConfig: Record<DraftType, DraftConfig> = {
  miltyeq,
  miltyeq5p,
  wekker,
  miltyeqless,
  milty,
  heisen,
  heisen8p,
  milty7p,
  miltyeq7plarge,
  milty8p,
  milty5p,
};
