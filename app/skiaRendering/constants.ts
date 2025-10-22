import { PlanetTrait, TechSpecialty, Wormhole, Anomaly } from "~/types";

export const TILE_COLORS = {
  SYSTEM: "#324B7C",
  HOME: "#5FA16D",
  OPEN: "rgba(0, 0, 0, 0)",
  CLOSED: "rgba(0, 0, 0, 0)",
  BACKGROUND: "#1a1b1e",
} as const;

// Player colors matching Mantine theme colors for player indices
export const PLAYER_COLORS = [
  "#339af0", // blue.5
  "#f03e3e", // red.5
  "#51cf66", // green.5
  "#f06595", // magenta
  "#7950f2", // violet.5
  "#fd7e14", // orange.5
  "#868e96", // gray.5
  "#22b8cf", // cyan.5
];

export const PLANET_TRAIT_COLORS: Record<PlanetTrait, string> = {
  CULTURAL: "#4DABF7",
  HAZARDOUS: "#FC6B6B",
  INDUSTRIAL: "#51CF66",
} as const;

// For radius 120, scale = 1.5, base planet size = 50
export const PLANET_RADIUS = 37.5; // (50 * 1.5) / 2
export const LEGENDARY_PLANET_RADIUS = 52.5; // ((50 + 20) * 1.5) / 2
export const PLANET_GAP = 6; // 4 * 1.5

export const TECH_ICON_PATHS: Record<TechSpecialty, string> = {
  BIOTIC: "biotic.webp",
  CYBERNETIC: "cybernetic.webp",
  WARFARE: "warfare.webp",
  PROPULSION: "propulsion.webp",
};

export const WORMHOLE_COLORS: Record<Wormhole, string> = {
  ALPHA: "#fd7e14", // orange.6
  BETA: "#2f9e44", // green.8
  DELTA: "#1971c2", // blue.8
  GAMMA: "#7950f2", // purple.8
  EPSILON: "#e03131", // red.8
};

export const ANOMALY_IMAGE_PATHS: Record<Anomaly, string> = {
  NEBULA: "nebula.webp",
  SUPERNOVA: "supernova.webp",
  ASTEROID_FIELD: "asteroids.webp",
  ENTROPIC_SCAR: "entropic.png",
  GRAVITY_RIFT: "", // Gravity Rift doesn't use an image
};

export const ANOMALY_SCALES: Record<Anomaly, number> = {
  NEBULA: 1.25,
  SUPERNOVA: 0.9,
  ASTEROID_FIELD: 1.0,
  ENTROPIC_SCAR: 1.0,
  GRAVITY_RIFT: 1.0,
};

export const LEGENDARY_IMAGE_PATHS: Record<
  string,
  { path: string; scale: number }
> = {
  "18": { path: "mecatol.webp", scale: 2.25 }, // Mecatol Rex (1.5 * 1.5 = 2.25)
  "66": { path: "hopesend.webp", scale: 1.75 }, // Hope's End
  "65": { path: "primor.png", scale: 1.0 }, // Primor
  "237": { path: "silence.webp", scale: 1.0 }, // Silence
  "240": { path: "prism.png", scale: 1.0 }, // Prism
  "253": { path: "domna.webp", scale: 1.0 }, // Domna
  "239": { path: "tarrock.webp", scale: 1.0 }, // Tarrock
  "238": { path: "echo.webp", scale: 1.0 }, // Echo
};

export function hasLegendaryImage(systemId: string): boolean {
  return ["18", "66", "240", "65", "237", "253", "239", "238"].includes(
    systemId,
  );
}
