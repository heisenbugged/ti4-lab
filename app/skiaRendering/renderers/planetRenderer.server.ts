import { Planet, PlanetTrait, TechSpecialty } from "~/types";
import {
  PLANET_RADIUS,
  LEGENDARY_PLANET_RADIUS,
  PLANET_TRAIT_COLORS,
  LEGENDARY_IMAGE_PATHS,
} from "../constants";
import {
  getLegendaryImageCache,
  getLegendaryIconCache,
  getTechIconCache,
  getTradeStationCache,
} from "../cache.server";
import { withContext, drawRotatedImage } from "../canvasUtils.server";

export function drawPlanet(
  ctx: CanvasRenderingContext2D,
  planet: Planet,
  systemId: string,
  hasLegendary: boolean,
  centerX: number,
  centerY: number,
): void {
  const planetRadius = planet.legendary
    ? LEGENDARY_PLANET_RADIUS
    : PLANET_RADIUS;

  // Check if this is a trade station
  if (planet.tradeStation) {
    drawTradeStation(ctx, centerX, centerY, planetRadius);
  } else if (hasLegendary) {
    drawLegendaryImage(ctx, systemId, centerX, centerY, planetRadius);
  } else {
    drawPlanetCircle(ctx, planet, centerX, centerY, planetRadius);
  }

  // Draw resource and influence stats
  drawPlanetStats(ctx, planet, centerX, centerY, systemId);

  // Draw tech specialties
  if (planet.tech && planet.tech.length > 0) {
    drawTechSpecialties(ctx, planet.tech, centerX, centerY, planetRadius);
  }
}

function drawTradeStation(
  ctx: CanvasRenderingContext2D,
  centerX: number,
  centerY: number,
  planetRadius: number,
): void {
  const tradeStationCache = getTradeStationCache();
  if (!tradeStationCache) return;

  const stationSize = planetRadius * 2.7;
  drawRotatedImage(
    ctx,
    tradeStationCache,
    centerX - 5,
    centerY - 15,
    stationSize,
    -20,
  );
}

function drawLegendaryImage(
  ctx: CanvasRenderingContext2D,
  systemId: string,
  centerX: number,
  centerY: number,
  planetRadius: number,
): void {
  const legendaryImageCache = getLegendaryImageCache();
  if (!legendaryImageCache) return;

  const legendaryConfig = LEGENDARY_IMAGE_PATHS[systemId];
  const legendaryImage = legendaryImageCache[systemId];

  if (legendaryImage && legendaryConfig) {
    const imageScale = legendaryConfig.scale;
    const imageSize = planetRadius * 2 * imageScale;
    ctx.drawImage(
      legendaryImage,
      centerX - imageSize / 2,
      centerY - imageSize / 2,
      imageSize,
      imageSize,
    );
  }
}

function drawPlanetCircle(
  ctx: CanvasRenderingContext2D,
  planet: Planet,
  centerX: number,
  centerY: number,
  planetRadius: number,
): void {
  if (!planet.trait || planet.trait.length === 0) {
    // Gray planet for no trait
    ctx.fillStyle = "#868e96";
    ctx.beginPath();
    ctx.arc(centerX, centerY, planetRadius, 0, Math.PI * 2);
    ctx.fill();
  } else if (planet.trait.length === 1) {
    // Single trait: solid color
    ctx.fillStyle = PLANET_TRAIT_COLORS[planet.trait[0]];
    ctx.beginPath();
    ctx.arc(centerX, centerY, planetRadius, 0, Math.PI * 2);
    ctx.fill();
  } else {
    // Multi-trait: gradient split (half and half)
    const numTraits = planet.trait.length;
    const anglePerTrait = (Math.PI * 2) / numTraits;

    planet.trait.forEach((trait, index) => {
      const startAngle = index * anglePerTrait - Math.PI / 2;
      const endAngle = (index + 1) * anglePerTrait - Math.PI / 2;

      ctx.fillStyle = PLANET_TRAIT_COLORS[trait];
      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.arc(centerX, centerY, planetRadius, startAngle, endAngle);
      ctx.closePath();
      ctx.fill();
    });
  }
}

function drawPlanetStats(
  ctx: CanvasRenderingContext2D,
  planet: Planet,
  centerX: number,
  centerY: number,
  systemId?: string,
): void {
  // Mecatol Rex (systemId 18) and trade stations get legendary stat styling
  const isLegendaryStyled =
    planet.legendary || planet.tradeStation || systemId === "18";
  // Trade stations should use regular planet radius for positioning, only legendary planets use larger radius
  const planetRadius =
    planet.legendary || systemId === "18"
      ? LEGENDARY_PLANET_RADIUS
      : PLANET_RADIUS;

  drawResourceInfluenceStats(
    ctx,
    planet,
    centerX,
    centerY,
    isLegendaryStyled,
  );
  drawPlanetLabel(ctx, planet, centerX, centerY, planetRadius, systemId);
}

function drawResourceInfluenceStats(
  ctx: CanvasRenderingContext2D,
  planet: Planet,
  centerX: number,
  centerY: number,
  isLegendaryStyled: boolean,
): void {
  const fontSize = 34;
  const gap = isLegendaryStyled ? 9 : 4;

  ctx.font = `bold ${fontSize}px Quantico, sans-serif`;
  ctx.textBaseline = "middle";
  ctx.textAlign = "center";

  const resourceText = planet.resources.toString();
  const influenceText = planet.influence.toString();

  const resourceWidth = ctx.measureText(resourceText).width;
  const influenceWidth = ctx.measureText(influenceText).width;
  const totalWidth = resourceWidth + gap + influenceWidth;

  const resourceX = centerX - totalWidth / 2 + resourceWidth / 2;
  const influenceX = centerX + totalWidth / 2 - influenceWidth / 2;

  if (isLegendaryStyled) {
    drawLegendaryStats(
      ctx,
      resourceText,
      influenceText,
      resourceX,
      influenceX,
      centerY,
      fontSize,
      resourceWidth,
      influenceWidth,
    );
  } else {
    drawRegularStats(
      ctx,
      resourceText,
      influenceText,
      resourceX,
      influenceX,
      centerY,
    );
  }
}

function drawLegendaryStats(
  ctx: CanvasRenderingContext2D,
  resourceText: string,
  influenceText: string,
  resourceX: number,
  influenceX: number,
  centerY: number,
  fontSize: number,
  resourceWidth: number,
  influenceWidth: number,
): void {
  const padding = 3;
  const borderRadius = 12;

  // Draw resource background (orange)
  const resourceBoxX = resourceX - resourceWidth / 2 - padding;
  const resourceBoxY = centerY - fontSize / 2 - padding;
  const resourceBoxWidth = resourceWidth + padding * 2;
  const resourceBoxHeight = fontSize + padding * 2;

  ctx.fillStyle = "#FC7E13";
  ctx.beginPath();
  ctx.roundRect(
    resourceBoxX,
    resourceBoxY,
    resourceBoxWidth,
    resourceBoxHeight,
    borderRadius,
  );
  ctx.fill();

  ctx.fillStyle = "white";
  ctx.fillText(resourceText, resourceX, centerY);

  // Draw influence background (blue)
  const influenceBoxX = influenceX - influenceWidth / 2 - padding;
  const influenceBoxY = centerY - fontSize / 2 - padding;
  const influenceBoxWidth = influenceWidth + padding * 2;
  const influenceBoxHeight = fontSize + padding * 2;

  ctx.fillStyle = "#228be6";
  ctx.beginPath();
  ctx.roundRect(
    influenceBoxX,
    influenceBoxY,
    influenceBoxWidth,
    influenceBoxHeight,
    borderRadius,
  );
  ctx.fill();

  ctx.fillStyle = "white";
  ctx.fillText(influenceText, influenceX, centerY);
}

function drawRegularStats(
  ctx: CanvasRenderingContext2D,
  resourceText: string,
  influenceText: string,
  resourceX: number,
  influenceX: number,
  centerY: number,
): void {
  // Draw resource (yellow with thin gray stroke)
  ctx.strokeStyle = "rgba(64, 87, 138, 0.37)";
  ctx.lineWidth = 1.5;
  ctx.fillStyle = "#EDFF00";
  ctx.strokeText(resourceText, resourceX, centerY);
  ctx.fillText(resourceText, resourceX, centerY);

  // Draw influence (blue with thin gray stroke)
  ctx.strokeStyle = "rgba(64, 87, 138, 0.37)";
  ctx.lineWidth = 1.5;
  ctx.fillStyle = "#1B63AB";
  ctx.strokeText(influenceText, influenceX, centerY);
  ctx.fillText(influenceText, influenceX, centerY);
}

function drawPlanetLabel(
  ctx: CanvasRenderingContext2D,
  planet: Planet,
  centerX: number,
  centerY: number,
  planetRadius: number,
  systemId?: string,
): void {
  const labelHeight = 16;
  const labelOffsetAdjustment = systemId === "18" ? planetRadius * 0.5 : 0;
  const labelY = centerY + planetRadius - 15 + labelOffsetAdjustment;
  const labelWidth = planetRadius * 2 + 4;
  const labelX = centerX - planetRadius - 2;

  if (planet.legendary && planet.trait && planet.trait.length > 0) {
    drawLegendaryLabel(
      ctx,
      planet,
      labelX,
      labelY,
      labelWidth,
      labelHeight,
    );
  } else {
    // Regular black background box for non-legendary
    ctx.fillStyle = "rgba(0, 0, 0, 0.7)";
    ctx.fillRect(labelX, labelY, labelWidth, labelHeight);
  }

  // Draw planet name text
  ctx.fillStyle = "white";
  ctx.font = "bold 13px Quantico, sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(planet.name, centerX, labelY + labelHeight / 2);
}

function drawLegendaryLabel(
  ctx: CanvasRenderingContext2D,
  planet: Planet,
  labelX: number,
  labelY: number,
  labelWidth: number,
  labelHeight: number,
): void {
  const traitColors: Record<PlanetTrait, { bg: string; border: string }> = {
    CULTURAL: { bg: "#1864ab", border: "#4DABF7" },
    HAZARDOUS: { bg: "#c92a2a", border: "#fc6b6b" },
    INDUSTRIAL: { bg: "#2b8a3e", border: "#51CF66" },
  };

  const traitColor = traitColors[planet.trait![0]];

  // Draw colored background box
  ctx.fillStyle = traitColor.bg;
  ctx.fillRect(labelX, labelY, labelWidth, labelHeight);

  // Draw border
  ctx.strokeStyle = traitColor.border;
  ctx.lineWidth = 2;
  ctx.strokeRect(labelX, labelY, labelWidth, labelHeight);

  // Draw legendary icon
  const legendaryIconCache = getLegendaryIconCache();
  if (legendaryIconCache) {
    const iconSize = 26.25;
    const iconX = labelX - iconSize + 6;
    const iconY = labelY - iconSize + 6;
    ctx.drawImage(legendaryIconCache, iconX, iconY, iconSize, iconSize);
  }
}

function drawTechSpecialties(
  ctx: CanvasRenderingContext2D,
  techs: TechSpecialty[],
  centerX: number,
  centerY: number,
  planetRadius: number,
): void {
  const techIconCache = getTechIconCache();
  if (!techIconCache) return;

  const iconSize = 30;
  const topOffset = -5;
  const rightOffset = 5;
  const spacing = 30;

  techs.forEach((tech, index) => {
    const icon = techIconCache[tech];
    if (!icon) return;

    const x =
      centerX + planetRadius - iconSize + rightOffset - index * spacing;
    const y = centerY - planetRadius + topOffset;

    ctx.drawImage(icon, x, y, iconSize, iconSize);
  });
}
