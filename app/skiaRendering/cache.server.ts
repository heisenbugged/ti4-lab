import { loadImage, FontLibrary } from "skia-canvas";
import path from "path";
import { TechSpecialty, Anomaly, FactionId } from "~/types";
import {
  TECH_ICON_PATHS,
  ANOMALY_IMAGE_PATHS,
  LEGENDARY_IMAGE_PATHS,
} from "./constants";
import { factions } from "~/data/factionData";

// Cache for loaded tech icons
let techIconCache: Record<TechSpecialty, any> | null = null;
// Cache for loaded anomaly images
let anomalyImageCache: Record<Anomaly, any> | null = null;
// Cache for loaded legendary planet images
let legendaryImageCache: Record<string, any> | null = null;
// Cache for legendary icon
let legendaryIconCache: any | null = null;
// Cache for faction icons
let factionIconCache: Record<string, any> | null = null;
// Cache for background tile image
let backgroundTileCache: any | null = null;
// Cache for logo image
let logoCache: any | null = null;
// Cache for trade station image
let tradeStationCache: any | null = null;

export function initializeFonts(): void {
  const orbitronPath = path.join(process.cwd(), "public", "orbitron.ttf");
  const quanticoBoldPath = path.join(
    process.cwd(),
    "public",
    "Quantico-Bold.ttf",
  );
  FontLibrary.use(orbitronPath);
  FontLibrary.use(quanticoBoldPath);
}

export async function loadAllAssets(): Promise<void> {
  // Load tech icons if not cached
  if (!techIconCache) {
    techIconCache = {} as Record<TechSpecialty, any>;
    for (const [tech, filename] of Object.entries(TECH_ICON_PATHS)) {
      const iconPath = path.join(process.cwd(), "public", filename);
      try {
        techIconCache[tech as TechSpecialty] = await loadImage(iconPath);
      } catch (error) {
        console.error(`Failed to load tech icon ${tech}:`, error);
      }
    }
  }

  // Load anomaly images if not cached
  if (!anomalyImageCache) {
    anomalyImageCache = {} as Record<Anomaly, any>;
    for (const [anomaly, filename] of Object.entries(ANOMALY_IMAGE_PATHS)) {
      if (filename) {
        const imagePath = path.join(process.cwd(), "public", filename);
        try {
          anomalyImageCache[anomaly as Anomaly] = await loadImage(imagePath);
        } catch (error) {
          console.error(`Failed to load anomaly image ${anomaly}:`, error);
        }
      }
    }
  }

  // Load legendary planet images if not cached
  if (!legendaryImageCache) {
    legendaryImageCache = {} as Record<string, any>;
    for (const [systemId, config] of Object.entries(LEGENDARY_IMAGE_PATHS)) {
      const imagePath = path.join(process.cwd(), "public", config.path);
      try {
        legendaryImageCache[systemId] = await loadImage(imagePath);
      } catch (error) {
        console.error(
          `Failed to load legendary image for system ${systemId}:`,
          error,
        );
      }
    }
  }

  // Load legendary icon if not cached
  if (!legendaryIconCache) {
    const legendaryIconPath = path.join(
      process.cwd(),
      "public",
      "legendary.webp",
    );
    try {
      legendaryIconCache = await loadImage(legendaryIconPath);
    } catch (error) {
      console.error("Failed to load legendary icon:", error);
    }
  }

  // Load faction icons if not cached
  if (!factionIconCache) {
    factionIconCache = {} as Record<string, any>;
    for (const [factionId, factionData] of Object.entries(factions)) {
      const iconPath = path.join(process.cwd(), "public", factionData.iconPath);
      try {
        factionIconCache[factionId] = await loadImage(iconPath);
      } catch (error) {
        console.error(`Failed to load faction icon ${factionId}:`, error);
      }
    }
  }

  // Load background tile if not cached
  if (!backgroundTileCache) {
    const bgTilePath = path.join(process.cwd(), "public", "tilebg.jpg");
    try {
      backgroundTileCache = await loadImage(bgTilePath);
    } catch (error) {
      console.error("Failed to load background tile:", error);
    }
  }

  // Load logo if not cached
  if (!logoCache) {
    const logoPath = path.join(process.cwd(), "public", "logo.webp");
    try {
      logoCache = await loadImage(logoPath);
    } catch (error) {
      console.error("Failed to load logo:", error);
    }
  }

  // Load trade station image if not cached
  if (!tradeStationCache) {
    const tradeStationPath = path.join(
      process.cwd(),
      "public",
      "tradestation.png",
    );
    try {
      tradeStationCache = await loadImage(tradeStationPath);
    } catch (error) {
      console.error("Failed to load trade station image:", error);
    }
  }
}

// Export cache getters
export function getTechIconCache() {
  return techIconCache;
}

export function getAnomalyImageCache() {
  return anomalyImageCache;
}

export function getLegendaryImageCache() {
  return legendaryImageCache;
}

export function getLegendaryIconCache() {
  return legendaryIconCache;
}

export function getFactionIconCache() {
  return factionIconCache;
}

export function getBackgroundTileCache() {
  return backgroundTileCache;
}

export function getLogoCache() {
  return logoCache;
}

export function getTradeStationCache() {
  return tradeStationCache;
}
