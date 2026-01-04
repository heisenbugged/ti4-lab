import { useContext } from "react";
import { Hex } from "../Hex";
import type { HomeTile, SystemTile, FactionId, Player } from "~/types";
import { MapContext } from "~/contexts/MapContext";
import { PlayerChip } from "~/routes/draft.$id/components/PlayerChip";
import { calcScale } from "./calcScale";
import { SystemId } from "../SystemId";
import { factionSystems } from "~/data/systemData";
import { useHydratedDraft } from "~/hooks/useHydratedDraft";
import { useSafeOutletContext } from "~/useSafeOutletContext";
import { OriginalArtTile } from "./OriginalArtTile";
import { useRawDraftContext } from "~/contexts/RawDraftContext";
import classes from "./Tiles.module.css";
import { SystemTile as SystemTileComponent } from "./SystemTile";
import type { CoreSliceData } from "~/hooks/useCoreSliceValues";
import {
  EmptySeatContent,
  SliceStatsContent,
  PlayerContent,
} from "./HomeTileContent";

import type { SliceStats } from "~/mapgen/utils/sliceScoring";

type Props = {
  mapId: string;
  tile: HomeTile;
  selectable?: boolean;
  onSelect?: () => void;
  sliceValue?: number;
  sliceStats?: SliceStats;
  coreSliceData?: CoreSliceData;
  onHomeHover?: (idx: number | null) => void;
};

export function HomeTile({
  mapId,
  tile,
  onSelect,
  selectable = false,
  sliceValue,
  sliceStats,
  coreSliceData,
  onHomeHover,
}: Props) {
  const { originalArt } = useSafeOutletContext();
  const { radius, disabled } = useContext(MapContext);
  const { hydratedPlayers } = useHydratedDraft();
  const rawDraftContext = useRawDraftContext();

  // Use raw draft players if available, otherwise use regular draft players
  const players = rawDraftContext?.players || hydratedPlayers;

  const player =
    tile.playerId !== undefined
      ? players.find((p) => p.id === tile.playerId)
      : undefined;

  const scale = calcScale(radius);
  const systemIdSize = radius >= 53 ? "10px" : "8px";
  const fontSize = radius >= 60 ? "xs" : "10px";

  const handleMouseEnter = () => onHomeHover?.(tile.idx);
  const handleMouseLeave = () => onHomeHover?.(null);

  // Original art mode with faction - render as faction home system
  if (
    originalArt &&
    player &&
    hasFaction(player) &&
    factionSystems[player.faction]
  ) {
    return (
      <div onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
        <OriginalArtTile
          mapId={mapId}
          tile={
            {
              ...tile,
              systemId: factionSystems[player.faction].id,
              type: "SYSTEM",
            } as SystemTile
          }
        >
          <PlayerChip player={player} size="lg" visibleFrom="lg" />
          <PlayerChip player={player} size="md" hiddenFrom="lg" />
        </OriginalArtTile>
      </div>
    );
  }

  // Player with home system faction - render as system tile with player overlay
  if (
    player &&
    hasHomeSystemFactionId(player) &&
    factionSystems[player.homeSystemFactionId]
  ) {
    return (
      <div
        style={{ position: "relative" }}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <SystemTileComponent
          mapId={mapId}
          tile={
            {
              ...tile,
              systemId: factionSystems[player.homeSystemFactionId].id,
              type: "SYSTEM",
            } as SystemTile
          }
        />
        <div
          style={{
            position: "absolute",
            top: 10,
            left: "50%",
            transform: "translateX(-50%)",
            pointerEvents: "none",
          }}
        >
          <PlayerChip player={player} size="md" visibleFrom="lg" />
          <PlayerChip player={player} size="sm" hiddenFrom="lg" />
        </div>
      </div>
    );
  }

  // Default hex rendering with content based on state
  return (
    <div onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
      <Hex id={`${mapId}-home`} radius={radius} colorClass={classes.home}>
        {/* Show faction system ID if player has faction */}
        {player && hasFaction(player) && factionSystems[player.faction] && (
          <SystemId
            id={factionSystems[player.faction].id}
            radius={radius}
            size={systemIdSize}
            scale={scale}
          />
        )}

        {/* Content based on state: player, stats mode, or empty seat */}
        {player ? (
          <PlayerContent player={player} radius={radius} />
        ) : sliceStats ? (
          <SliceStatsContent
            seat={tile.seat}
            sliceValue={sliceValue}
            sliceStats={sliceStats}
            coreSliceData={coreSliceData}
            fontSize={fontSize}
          />
        ) : (
          <EmptySeatContent
            seat={tile.seat}
            coreSliceData={coreSliceData}
            selectable={selectable}
            onSelect={onSelect}
            disabled={disabled}
          />
        )}
      </Hex>
    </div>
  );
}

type PlayerWithFaction = { faction: FactionId } & Player;
const hasFaction = (p: Player): p is PlayerWithFaction =>
  p != null && "faction" in p && typeof p.faction === "string";

type PlayerWithHomeSystem = { homeSystemFactionId: FactionId } & Player;
const hasHomeSystemFactionId = (p: Player): p is PlayerWithHomeSystem =>
  p != null &&
  "homeSystemFactionId" in p &&
  typeof p.homeSystemFactionId === "string";
