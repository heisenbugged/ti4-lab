import { DemoTile, DraftType } from "~/types";
import { draftConfig } from "~/draft";
import { hydrateDemoMap } from "~/utils/map";
import { std4p } from "~/draft/std4p";
import { DraftFormatDescriptionData } from "./components/DraftFormatDescription";

export type ChoosableDraftType = DraftType;

export type PrechoiceMap = {
  title: string;
  description: string;
  descriptionData: DraftFormatDescriptionData;
  map: DemoTile[];
  titles: string[];
  playerCount: number;
};

// Shared description data for format variants
const MILTY_DESCRIPTION: DraftFormatDescriptionData = {
  tagline: "The Classic",
  description:
    "The community standard. Each slice contains its left equidistant, giving you full control over contested space. Guaranteed 2 red and 3 blue tiles per slice with legendaries and wormholes distributed evenly.",
  features: [
    { icon: "slices", label: "5-tile slices" },
    { icon: "equidistant", label: "Equidistant included" },
    { icon: "balanced", label: "Balanced distribution" },
    { icon: "wormholes", label: "Even wormhole spread" },
  ],
};

const MILTYEQ_DESCRIPTION: DraftFormatDescriptionData = {
  tagline: "Equidistant Remix",
  description:
    "A strategic twist on the classic. Equidistants are preset and shared, not drafted. Creates dynamic border conflicts and encourages diplomacy over contested systems.",
  features: [
    { icon: "slices", label: "4-tile slices" },
    { icon: "equidistant", label: "Preset equidistants" },
    { icon: "balanced", label: "Flexible red/blue mix" },
    { icon: "wormholes", label: "Randomized borders" },
  ],
};

const NUCLEUS_DESCRIPTION: DraftFormatDescriptionData = {
  tagline: "Map Builder's Choice",
  description:
    "Features a galactic nucleus for interesting map construction. Separates speaker order from seat selection for deeper strategic drafting. Wormholes are intentionally spread apart to ensure dynamic, interconnected maps.",
  features: [
    { icon: "nucleus", label: "Central nucleus" },
    { icon: "balanced", label: "Seat/speaker split" },
    { icon: "wormholes", label: "Spread wormholes" },
    { icon: "slices", label: "Custom map design" },
  ],
};

export const MAPS: Record<ChoosableDraftType, PrechoiceMap> = {
  milty: {
    title: "Milty",
    description:
      "The original draft format. Slices include the left equidistant system, and no preset tiles are on the board. Every slice is guaranteed two red tiles and three blue tiles. Legendaries and wormholes are distributed evenly across slices.",
    descriptionData: MILTY_DESCRIPTION,
    map: hydrateDemoMap(draftConfig.milty),
    titles: ["Speaker", "2nd", "3rd", "4th", "5th", "6th"],
    playerCount: 6,
  },
  milty4p: {
    title: "Milty 4p",
    description:
      "The original draft format. Slices include the left equidistant system, and no preset tiles are on the board. Every slice is guaranteed two red tiles and three blue tiles. Legendaries and wormholes are distributed evenly across slices.",
    descriptionData: MILTY_DESCRIPTION,
    map: hydrateDemoMap(draftConfig.milty4p),
    titles: ["Speaker", "2nd", "3rd", "4th"],
    playerCount: 4,
  },
  miltyeq4p: {
    title: "Milty EQ 4p",
    description:
      "Like milty, but, with a twist. Equidistants are not considered part of one's slice, and are instead preset on the board. Slices are biased towards having one red, but some have two. Equidistants are fully randomized.",
    descriptionData: MILTYEQ_DESCRIPTION,
    map: hydrateDemoMap(draftConfig.miltyeq4p),
    titles: ["Speaker", "2nd", "3rd", "4th"],
    playerCount: 4,
  },
  std4p: {
    title: "4P Small",
    description:
      "A small 4 player draft. Slices are biased towards having one red, but some have two. Other tiles fully randomized.",
    descriptionData: {
      tagline: "Quick Play",
      description:
        "A compact galaxy for faster games. Tighter board creates more interaction and conflict earlier. Perfect for introducing new players or fitting a game into limited time.",
      features: [
        { icon: "compact", label: "Compact map" },
        { icon: "slices", label: "Smaller slices" },
        { icon: "balanced", label: "1-2 red tiles" },
        { icon: "wormholes", label: "Full randomization" },
      ],
    },
    map: hydrateDemoMap(std4p),
    titles: ["P1", "P2", "P3", "P4"],
    playerCount: 4,
  },
  milty5p: {
    title: "Milty 5p",
    description:
      "The original draft format. Slices include the left equidistant system, and no preset tiles are on the board. Every slice is guaranteed two red tiles and three blue tiles. Legendaries and wormholes are distributed evenly across slices.",
    descriptionData: MILTY_DESCRIPTION,
    map: hydrateDemoMap(draftConfig.milty5p),
    titles: ["Speaker", "2nd", "3rd", "4th", "5th"],
    playerCount: 5,
  },
  miltyeq5p: {
    title: "Milty EQ 5p",
    description:
      "Like milty, but, with a twist. Equidistants are not considered part of one's slice, and are instead preset on the board. Slices are biased towards having one red, but some have two. Equidistants are fully randomized.",
    descriptionData: MILTYEQ_DESCRIPTION,
    map: hydrateDemoMap(draftConfig.miltyeq5p),
    titles: ["Speaker", "2nd", "3rd", "4th", "5th"],
    playerCount: 5,
  },
  milty7p: {
    title: "Milty (7P)",
    description:
      "The original draft format. Slices include the left equidistant system, and no preset tiles are on the board. Every slice is guaranteed two red tiles and three blue tiles. Legendaries and wormholes are distributed evenly across slices.",
    descriptionData: MILTY_DESCRIPTION,
    map: hydrateDemoMap(draftConfig.milty7p),
    titles: ["Speaker", "2nd", "3rd", "4th", "5th", "6th", "7th"],
    playerCount: 7,
  },
  miltyeq7p: {
    title: "Milty EQ (7P)",
    description:
      "Like milty, but, with a twist. Equidistants are not considered part of one's slice, and are instead preset on the board. Slices are biased towards having one red, but some have two. Equidistants are fully randomized.",
    descriptionData: MILTYEQ_DESCRIPTION,
    map: hydrateDemoMap(draftConfig.miltyeq7p),
    titles: ["Speaker", "2nd", "3rd", "4th", "5th", "6th", "7th"],
    playerCount: 7,
  },
  miltyeq7plarge: {
    title: "Milty EQ (7P) Large",
    description:
      "Large map, 'even' slices, equidistants are preset on the board.",
    descriptionData: {
      tagline: "Expanded Galaxy",
      description:
        "An expanded 7-player map with more breathing room. Preset equidistants reduce early conflict, letting empires develop before the inevitable clash for dominance.",
      features: [
        { icon: "slices", label: "Larger map" },
        { icon: "equidistant", label: "Preset equidistants" },
        { icon: "balanced", label: "Even slice balance" },
        { icon: "wormholes", label: "More territory" },
      ],
    },
    map: hydrateDemoMap(draftConfig.miltyeq7plarge),
    titles: ["Speaker", "2nd", "3rd", "4th", "5th", "6th", "7th"],
    playerCount: 7,
  },
  milty8p: {
    title: "Milty (8P)",
    description:
      "The original draft format. Slices include the left equidistant system, and no preset tiles are on the board. Every slice is guaranteed two red tiles and three blue tiles. Legendaries and wormholes are distributed evenly across slices.",
    descriptionData: MILTY_DESCRIPTION,
    map: hydrateDemoMap(draftConfig.milty8p),
    titles: ["Speaker", "2nd", "3rd", "4th", "5th", "6th", "7th", "8th"],
    playerCount: 8,
  },
  heisen8p: {
    title: "Nucleus (8P)",
    description:
      "Features a galactic nucleus for interesting map construction and a balanced draft which separates seat from speaker order. Beneficial for players who want to design their own maps while still running a draft. Randomization prioritizes high wormholes, and separates them for maximum impact.",
    descriptionData: NUCLEUS_DESCRIPTION,
    map: hydrateDemoMap(draftConfig.heisen8p),
    titles: ["Speaker", "2nd", "3rd", "4th", "5th", "6th", "7th", "8th"],
    playerCount: 8,
  },
  miltyeq: {
    title: "Milty EQ",
    description:
      "Like milty, but, with a twist. Equidistants are not considered part of one's slice, and are instead preset on the board. Slices are biased towards having one red, but some have two. Equidistants are fully randomized.",
    descriptionData: MILTYEQ_DESCRIPTION,
    map: hydrateDemoMap(draftConfig.miltyeq),
    titles: ["Speaker", "2nd", "3rd", "4th", "5th", "6th"],
    playerCount: 6,
  },
  heisen: {
    title: "Nucleus",
    description:
      "Features a galactic nucleus for interesting map construction and a balanced draft which separates seat from speaker order. Beneficial for players who want to design their own maps while still running a draft. Randomization prioritizes high wormholes, and separates them for maximum impact.",
    descriptionData: NUCLEUS_DESCRIPTION,
    map: hydrateDemoMap(draftConfig.heisen),
    titles: ["P1", "P2", "P3", "P4", "P5", "P6"],
    playerCount: 6,
  },
  miltyeq8p: {
    title: "Milty EQ (8P)",
    description:
      "Like milty, but, with a twist. Equidistants are not considered part of one's slice, and are instead preset on the board. Slices are biased towards having one red, but some have two. Equidistants are fully randomized.",
    descriptionData: MILTYEQ_DESCRIPTION,
    map: hydrateDemoMap(draftConfig.miltyeq8p),
    titles: ["Speaker", "2nd", "3rd", "4th", "5th", "6th", "7th", "8th"],
    playerCount: 8,
  },
};

export const isMiltyVariant = (mapType: ChoosableDraftType) =>
  mapType === "milty" ||
  mapType === "milty4p" ||
  mapType === "milty5p" ||
  mapType === "milty7p" ||
  mapType === "milty8p";

export const isMiltyEqVariant = (mapType: ChoosableDraftType) =>
  mapType === "miltyeq" ||
  mapType === "miltyeq4p" ||
  mapType === "miltyeq5p" ||
  mapType === "miltyeq7p" ||
  mapType === "miltyeq8p";
