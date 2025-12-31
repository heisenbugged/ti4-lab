/**
 * Represents the pre-computed values required to manipulate the map
 * during the drafting process.
 */
import { heisen } from "./heisen";
import { heisen8p } from "./heisen8p";
import { milty } from "./milty";
import { milty4p } from "./milty4p";
import { milty5p } from "./milty5p";
import { milty7p } from "./milty7p";
import { milty8p } from "./milty8p";
import { miltyeq } from "./miltyeq";
import { miltyeq4p } from "./miltyeq4p";
import { miltyeq5p } from "./miltyeq5p";
import { miltyeq7p } from "./miltyeq7p";
import { miltyeq7plarge } from "./miltyeq7plarge";
import { miltyeq8p } from "./miltyeq8p";
import { std4p } from "./std4p";
import { DraftConfig, DraftType } from "./types";

/**
 * The configuration for each draft type.
 */
export const draftConfig: Record<DraftType, DraftConfig> = {
  miltyeq,
  miltyeq5p,
  miltyeq4p,
  miltyeq7p,
  milty,
  heisen,
  heisen8p,
  milty7p,
  miltyeq7plarge,
  milty8p,
  milty5p,
  milty4p,
  std4p,
  miltyeq8p,
};
