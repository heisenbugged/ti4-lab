import { HydratedPlayer } from "~/types";
import { PLAYER_COLORS } from "../constants";
import { getFactionIconCache } from "../cache.server";
import {
  measureAndTruncateText,
  drawRoundedRect,
} from "../canvasUtils.server";

export function drawHomeTileContent(
  ctx: CanvasRenderingContext2D,
  player: HydratedPlayer,
  centerX: number,
  centerY: number,
  radius: number,
): void {
  const factionIconCache = getFactionIconCache();
  if (!player.faction || !factionIconCache) return;

  const factionIcon = factionIconCache[player.faction];
  if (!factionIcon) return;

  // Draw faction icon centered (60% of hex radius)
  const iconSize = radius * 0.6;
  const iconX = centerX - iconSize / 2;
  const iconY = centerY - iconSize / 2 - 15;

  ctx.drawImage(factionIcon, iconX, iconY, iconSize, iconSize);

  // Draw player name pill below the icon
  const pillY = centerY + iconSize / 2;
  drawPlayerNamePill(ctx, player.name, player.id, centerX, pillY);
}

function drawPlayerNamePill(
  ctx: CanvasRenderingContext2D,
  playerName: string,
  playerId: number,
  centerX: number,
  centerY: number,
): void {
  const maxPillWidth = 180;
  const displayName = playerName.toUpperCase();

  const { displayText, fontSize, width } = measureAndTruncateText(
    ctx,
    displayName,
    maxPillWidth - 24,
    16,
    14,
    "Quantico, sans-serif",
  );

  // Pill dimensions
  const horizontalPadding = 12;
  const verticalPadding = 6;
  const pillWidth = Math.min(width + horizontalPadding * 2, maxPillWidth);
  const pillHeight = fontSize + verticalPadding * 2;
  const borderRadius = pillHeight / 2;

  const pillX = centerX - pillWidth / 2;
  const pillY = centerY - pillHeight / 2;

  const playerColor = PLAYER_COLORS[playerId % PLAYER_COLORS.length];

  // Draw pill background
  drawRoundedRect(ctx, pillX, pillY, pillWidth, pillHeight, borderRadius, playerColor);

  // Draw player name text
  ctx.fillStyle = "white";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(displayText, centerX, centerY);
}
