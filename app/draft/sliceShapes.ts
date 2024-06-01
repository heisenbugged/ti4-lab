/**
 * Slices shapres as used by TTPG.
 * Different from the shapes used in the rest of the code base (unfortunately)
 */
export const SLICE_SHAPES = {
  bunker: [
    "<0,1,-1>", // right of anchor (home)
    "<0,0,0>", // anchor
    "<1,0,-1>", // front
    "<1,1,-2>", // right-eq
    "<0,2,-2>", // right-far
  ],
  bunker_right: [
    "<0,2,-2>", // right-far
    "<0,0,0>", // anchor
    "<1,0,-1>", // front
    "<1,1,-2>", // right-eq
    "<0,1,-1>", // right
  ],
  bunker_fixed: [
    "<2,0,-2>", // front-far
  ],
  wekker: [
    "<0,0,0>", //home
    "<0,1,-1>", // right
    "<0,2,-2>", // right-right
    "<2,-1,-1>", // left-eq
    "<3,-1,-2>", // left-far
    "<1,0,-1>", // front
  ],
  milty: [
    "<0,0,0>", // home system
    "<1,-1,0>", // left
    "<1,0,-1>", // front
    "<0,1,-1>", // right
    "<2,-1,-1>", // left-eq
    "<2,0,-2>", // front-far
  ],
  milty_7p_seatIndex3: [
    "<0,0,0>", // home system
    "<1,-1,0>", // left
    "<2,0,-2>", // front (pushed forward)
    "<1,0,-1>", // right (pushed forward)
    "<2,-1,-1>", // left-eq
    "<3,-1,-2>", // front-far (pushed forward)
  ],

  milty_eq: [
    "<0,0,0>", // home system
    "<1,-1,0>", // left
    "<1,0,-1>", // front
    "<0,1,-1>", // right
    "<2,0,-2>", // front-far
  ],
  milty_eq_7p_seatIndex3: [
    "<0,0,0>", // home system
    "<1,-1,0>", // left
    "<2,0,-2>", // front (pushed forward)
    "<1,0,-1>", // right (pushed forward)
    "<3,-1,-2>", // front-far (pushed forward)
  ],
  milty_eq_fixed: [
    "<2,-1,-1>", // left-eq
  ],
};
