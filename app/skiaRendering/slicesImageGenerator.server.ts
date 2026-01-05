import { Draft, Slice, Tile, System, Wormhole, TechSpecialty } from "~/types";
import { calcHexHeight } from "~/utils/positioning";
import {
  initializeFonts,
  loadAllAssets,
  getLegendaryIconCache,
  getTechIconCache,
  getFactionIconCache,
} from "./cache.server";
import { drawHexTile } from "./renderers/hexRenderer.server";
import {
  drawBackground,
  drawBranding,
  createCanvas,
} from "./canvasUtils.server";
import { systemData } from "~/data/systemData";
import { factions } from "~/data/factionData";
import { calculateSliceValue } from "~/stats";
import { getBaseUrl } from "~/env.server";

export async function generateDraftSlicesImage(
  draft: Draft,
  draftId: string,
): Promise<Buffer> {
  initializeFonts();
  await loadAllAssets();

  const slices = draft.slices;
  const slicesPerRow = 3;
  const rows = Math.ceil(slices.length / slicesPerRow);

  // Calculate dimensions for slice rendering
  const sliceWidth = 700;
  const sliceHeaderHeight = 80;
  const gap = 20;
  const padding = 100;
  const factionColumnWidth = 600;
  const factionColumnGap = 40;

  const slicesWidth = slicesPerRow * sliceWidth + (slicesPerRow + 1) * gap;
  const canvasWidth = slicesWidth + factionColumnGap + factionColumnWidth;
  const canvasHeight =
    rows * (sliceWidth + sliceHeaderHeight) + (rows + 1) * gap + padding * 2;

  const { canvas, ctx } = createCanvas(canvasWidth, canvasHeight);

  const baseUrl = getBaseUrl();
  // Draw background
  drawBackground(ctx, canvasWidth, canvasHeight, {
    withGradient: true,
    tileOpacity: 0.5,
  });

  // Draw branding
  drawBranding(ctx, canvasWidth, canvasHeight, {
    urlText: `${baseUrl}/draft/${draftId}`,
    urlPosition: "inline",
    logoX: 20,
    logoY: 20,
  });

  // Draw section labels
  const slicesLabelY = padding + 10;
  const sectionLabelHeight = 60;
  drawSectionLabel(ctx, "Slices", gap, slicesLabelY, slicesWidth);
  drawSectionLabel(
    ctx,
    "Factions",
    slicesWidth + factionColumnGap,
    slicesLabelY,
    factionColumnWidth,
  );

  // Draw faction list
  drawFactionList(
    ctx,
    draft,
    slicesWidth + factionColumnGap,
    slicesLabelY + sectionLabelHeight + 15,
  );

  // Draw each slice
  slices.forEach((slice, index) => {
    const row = Math.floor(index / slicesPerRow);
    const col = index % slicesPerRow;

    const x = gap + col * (sliceWidth + gap);
    const y =
      slicesLabelY +
      sectionLabelHeight +
      gap +
      row * (sliceWidth + sliceHeaderHeight + gap);

    drawSlice(
      ctx,
      slice,
      x,
      y,
      sliceWidth,
      sliceHeaderHeight,
      draft.settings.type,
    );
  });

  return await canvas.toBuffer("png");
}

function drawSectionLabel(
  ctx: CanvasRenderingContext2D,
  label: string,
  x: number,
  y: number,
  width: number,
): void {
  // Draw label text
  ctx.font = "bold 32px Quantico, sans-serif";
  ctx.fillStyle = "white";
  ctx.textAlign = "left";
  ctx.textBaseline = "top";
  ctx.fillText(label, x, y);

  // Draw glowing line underneath
  ctx.save();
  ctx.shadowColor = "rgba(255, 255, 255, 0.6)";
  ctx.shadowBlur = 10;
  ctx.strokeStyle = "white";
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(x, y + 45);
  ctx.lineTo(x + width - 20, y + 45);
  ctx.stroke();
  ctx.restore();
}

function drawFactionList(
  ctx: CanvasRenderingContext2D,
  draft: Draft,
  x: number,
  y: number,
): void {
  const factionIconCache = getFactionIconCache();
  if (!factionIconCache || !draft.availableFactions) return;

  const iconSize = 80;
  const rowHeight = 110;
  const factionColumnWidth = 600;
  let currentY = y;

  draft.availableFactions.forEach((factionId, index) => {
    const faction = factions[factionId];
    const icon = factionIconCache[factionId];

    if (icon && faction) {
      // Draw alternating background with sci-fi edge glow
      if (index % 2 === 0) {
        ctx.fillStyle = "rgba(0, 100, 150, 0.08)";
        ctx.fillRect(x - 10, currentY - 5, factionColumnWidth - 20, rowHeight);

        // Add subtle left edge glow
        ctx.strokeStyle = "rgba(0, 150, 255, 0.15)";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(x - 10, currentY - 5);
        ctx.lineTo(x - 10, currentY - 5 + rowHeight);
        ctx.stroke();
      }

      // Draw faction icon with subtle glow
      const iconY = currentY + (rowHeight - iconSize) / 2;
      ctx.save();
      ctx.shadowColor = "rgba(0, 150, 255, 0.4)";
      ctx.shadowBlur = 6;
      ctx.drawImage(icon, x, iconY, iconSize, iconSize);
      ctx.restore();

      // Draw faction name - centered vertically with the icon
      ctx.font = "32px Quantico, sans-serif";
      ctx.fillStyle = "white";
      ctx.textAlign = "left";
      ctx.textBaseline = "middle";
      ctx.fillText(faction.name, x + iconSize + 20, currentY + rowHeight / 2);

      currentY += rowHeight;
    }
  });
}

function drawSlice(
  ctx: CanvasRenderingContext2D,
  slice: Slice,
  x: number,
  y: number,
  width: number,
  headerHeight: number,
  draftType: string,
): void {
  // Draw slice background box with subtle sci-fi gradient
  const gradient = ctx.createLinearGradient(x, y, x, y + width + headerHeight);
  gradient.addColorStop(0, "rgba(10, 20, 30, 0.5)");
  gradient.addColorStop(1, "rgba(5, 10, 20, 0.7)");
  ctx.fillStyle = gradient;
  ctx.fillRect(x, y, width, width + headerHeight);

  // Draw subtle border with slight glow
  ctx.save();
  ctx.shadowColor = "rgba(0, 150, 255, 0.2)";
  ctx.shadowBlur = 4;
  ctx.strokeStyle = "rgba(0, 150, 255, 0.2)";
  ctx.lineWidth = 2;
  ctx.strokeRect(x, y, width, width + headerHeight);
  ctx.restore();

  // Draw slice name (remove "Slice" from the name if present)
  const sliceName = slice.name.replace(/slice/gi, "").trim();
  ctx.font = "bold 30px Quantico, sans-serif";
  ctx.fillStyle = "white";
  ctx.textAlign = "left";
  ctx.textBaseline = "top";
  ctx.fillText(sliceName, x + 15, y + 15);

  // Draw slice stats
  const stats = calculateSliceStats(slice);
  const sliceValue = calculateSliceValueForSlice(slice);
  ctx.font = "26px Quantico, sans-serif";

  ctx.fillStyle = "#fcc419";
  const svText = `SV: ${sliceValue % 1 === 0 ? sliceValue : sliceValue.toFixed(1)}`;
  ctx.fillText(svText, x + 15, y + 55);

  ctx.fillStyle = "#51cf66";
  const optimalSum = stats.optimal.resources + stats.optimal.influence + stats.optimal.flex;
  const optimalText = `Opt: ${stats.optimal.resources}/${stats.optimal.influence}/${stats.optimal.flex} (${optimalSum})`;
  ctx.fillText(optimalText, x + 150, y + 55);

  // Draw slice features in top right
  drawSliceFeatures(ctx, slice, x, y, width);

  // Draw slice map with top padding
  const mapY = y + headerHeight + 20;
  drawSliceMap(ctx, slice.tiles, x, mapY, width, draftType);
}

function drawSliceMap(
  ctx: CanvasRenderingContext2D,
  tiles: Tile[],
  x: number,
  y: number,
  width: number,
  draftType: string,
): void {
  const gap = 6;
  const radius = 120; // Fixed radius matching completed draft
  const hexHeight = calcHexHeight(radius);

  // Calculate slice height based on draft type (different configs have different slice heights)
  const sliceHeight = getSliceHeightForDraftType(draftType);
  const height = hexHeight * sliceHeight + gap;

  const hOffset = y + height - hexHeight - 10;
  const wOffset = x + width * 0.5 - radius;

  tiles
    .filter((t) => !!t.position)
    .forEach((tile) => {
      drawHexTile(ctx, tile, [], radius, gap, hOffset, wOffset);
    });
}

function drawSliceFeatures(
  ctx: CanvasRenderingContext2D,
  slice: Slice,
  x: number,
  y: number,
  width: number,
): void {
  const systems = slice.tiles
    .filter((t) => t.type === "SYSTEM")
    .map((t) => systemData[t.systemId])
    .filter((s) => !!s);

  const hasLegendary = systems.some((s) => s.planets.some((p) => p.legendary));
  const wormholes: Wormhole[] = systems
    .flatMap((s) => s.wormholes)
    .filter((w) => !!w);

  // Get tech specialties
  const techSpecialties: TechSpecialty[] = [];
  systems.forEach((s) => {
    s.planets.forEach((p) => {
      if (p.tech) {
        p.tech.forEach((t) => {
          if (!techSpecialties.includes(t)) {
            techSpecialties.push(t);
          }
        });
      }
    });
  });

  const iconSize = 44;
  const gap = 10;
  let currentX = x + width - 15 - iconSize;

  // Draw wormholes
  wormholes.forEach((wormhole) => {
    drawSimpleWormholeIcon(ctx, wormhole, currentX, y + 15, iconSize);
    currentX -= iconSize + gap;
  });

  // Draw legendary icon
  if (hasLegendary) {
    const legendaryIcon = getLegendaryIconCache();
    if (legendaryIcon) {
      ctx.drawImage(legendaryIcon, currentX, y + 15, iconSize, iconSize);
      currentX -= iconSize + gap;
    }
  }

  // Draw tech icons
  const techIconCache = getTechIconCache();
  if (techIconCache) {
    techSpecialties.forEach((tech) => {
      const icon = techIconCache[tech];
      if (icon) {
        ctx.drawImage(icon, currentX, y + 15, iconSize, iconSize);
        currentX -= iconSize + gap;
      }
    });
  }
}

const wormholeColors: Record<Wormhole, string> = {
  ALPHA: "#fd7e14",
  BETA: "#2f9e44",
  DELTA: "#1971c2",
  GAMMA: "#9c36b5",
  EPSILON: "#e03131",
};

function drawSimpleWormholeIcon(
  ctx: CanvasRenderingContext2D,
  wormhole: Wormhole,
  x: number,
  y: number,
  size: number,
): void {
  const color = wormholeColors[wormhole];
  const radius = size / 2;
  const centerX = x + radius;
  const centerY = y + radius;

  // Draw outer glow
  ctx.save();
  ctx.shadowColor = color;
  ctx.shadowBlur = 8;

  // Draw colored circle
  ctx.beginPath();
  ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
  ctx.fillStyle = color;
  ctx.fill();

  ctx.restore();

  // Draw inner darker circle
  ctx.beginPath();
  ctx.arc(centerX, centerY, radius * 0.5, 0, Math.PI * 2);
  ctx.fillStyle = "rgba(0, 0, 0, 0.3)";
  ctx.fill();

  // Draw letter
  const fontSize = Math.round(size * 0.5);
  ctx.font = `bold ${fontSize}px Quantico, sans-serif`;
  ctx.fillStyle = "white";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(wormhole.slice(0, 1), centerX, centerY);
}

function getSliceHeightForDraftType(draftType: string): number {
  // Map draft types to their slice heights (from draftConfig)
  if (draftType.startsWith("milty")) return 3;
  if (draftType === "prechoice") return 3;
  return 3; // default
}

function calculateSliceStats(slice: Slice): {
  optimal: { resources: number; influence: number; flex: number };
} {
  let optimalResources = 0;
  let optimalInfluence = 0;
  let optimalFlex = 0;

  slice.tiles.forEach((tile) => {
    if (tile.type === "SYSTEM") {
      const system = systemData[tile.systemId];
      if (system) {
        optimalResources += system.optimalSpend.resources;
        optimalInfluence += system.optimalSpend.influence;
        optimalFlex += system.optimalSpend.flex;
      }
    }
  });

  return {
    optimal: {
      resources: optimalResources,
      influence: optimalInfluence,
      flex: optimalFlex,
    },
  };
}

function calculateSliceValueForSlice(slice: Slice): number {
  const systems: System[] = slice.tiles
    .filter((t) => t.type === "SYSTEM")
    .map((t) => systemData[t.systemId])
    .filter((s) => !!s);

  return calculateSliceValue(systems);
}
