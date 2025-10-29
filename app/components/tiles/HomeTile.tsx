import { useContext } from "react";
import { Hex } from "../Hex";
import { Button, Stack, Text } from "@mantine/core";
import type { HomeTile, SystemTile, FactionId, Player } from "~/types";
import { MapContext } from "~/contexts/MapContext";
import { FactionIcon } from "../icons/FactionIcon";
import { PlayerChip } from "~/routes/draft.$id/components/PlayerChip";
import { calcScale } from "./calcScale";
import { SystemId } from "../SystemId";
import { factionSystems } from "~/data/systemData";
import { useHydratedDraft } from "~/hooks/useHydratedDraft";
import { useDraft } from "~/draftStore";
import { useSafeOutletContext } from "~/useSafeOutletContext";
import { OriginalArtTile } from "./OriginalArtTile";
import { useRawDraftContext } from "~/contexts/RawDraftContext";
import classes from "./Tiles.module.css";
import { SystemTile as SystemTileComponent } from "./SystemTile";

type SliceStats = {
  resources: number;
  influence: number;
  techs: string;
  traits: string;
};

type Props = {
  mapId: string;
  tile: HomeTile;
  selectable?: boolean;
  onSelect?: () => void;
  showStats?: boolean;
  sliceValue?: number;
  sliceStats?: SliceStats;
};

const seatLabel = ["Speaker", "2nd", "3rd", "4th", "5th", "6th", "7th", "8th"];

export function HomeTile({
  mapId,
  tile,
  onSelect,
  selectable = false,
  showStats = false,
  sliceValue,
  sliceStats,
}: Props) {
  const { originalArt } = useSafeOutletContext();
  const { radius, disabled } = useContext(MapContext);
  const hydrated = useDraft((state) => state.hydrated);
  const draftSpeaker = useDraft((state) => state.draft.settings.draftSpeaker);
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

  if (
    originalArt &&
    player &&
    hasFaction(player) &&
    factionSystems[player.faction]
  ) {
    return (
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
    );
  }

  if (
    player &&
    hasHomeSystemFactionId(player) &&
    factionSystems[player.homeSystemFactionId]
  ) {
    return (
      <div style={{ position: "relative" }}>
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

  return (
    <Hex id={`${mapId}-home`} radius={radius} colorClass={classes.home}>
      {player && hasFaction(player) && factionSystems[player.faction] && (
        <SystemId
          id={factionSystems[player.faction].id}
          radius={radius}
          size={systemIdSize}
          scale={scale}
        />
      )}
      {!player && !showStats && (
        <Stack align="center" gap={2}>
          {!draftSpeaker && hydrated && tile.seat !== undefined && (
            <Text size="xl" fw="bold" className={classes.seatLabel}>
              {seatLabel[tile.seat]}
            </Text>
          )}
          {selectable && (
            <Button
              ta="center"
              lh={1}
              size="xs"
              onMouseDown={onSelect}
              disabled={disabled}
              style={{ zIndex: 1 }}
            >
              Select Seat
            </Button>
          )}
        </Stack>
      )}
      {!player && showStats && (
        <Stack align="center" gap={1} style={{ fontSize }}>
          {tile.seat !== undefined && (
            <Text fz={{ base: "xs", xs: "md" }} c="white">
              {seatLabel[tile.seat]}
            </Text>
          )}
          {sliceValue !== undefined && (
            <Text fz={{ base: "sm", xs: "lg" }} fw="bold" c="yellow.5">
              {sliceValue.toFixed(1)}
            </Text>
          )}
          {sliceStats && (
            <Text
              fz={{ base: "xs", xs: "md" }}
              fw="bolder"
              c="white"
              ta="center"
              lh={1.2}
            >
              {sliceStats.resources}/{sliceStats.influence} {sliceStats.techs}
            </Text>
          )}
        </Stack>
      )}
      {player && (
        <Stack
          align="center"
          gap={1}
          w={radius * 1.25}
          justify="center"
          style={{ zIndex: 1 }}
        >
          {hasFaction(player) && (
            <FactionIcon
              // visibleFrom="xs"
              faction={player.faction}
              style={{ maxWidth: radius * 0.6, maxHeight: radius * 0.6 }}
            />
          )}
          {/* Use smaller sizes in raw draft mode, and also smaller in regular draft */}
          {rawDraftContext ? (
            <>
              <PlayerChip player={player} size="sm" visibleFrom="lg" />
              <PlayerChip
                player={player}
                size="sm"
                visibleFrom="md"
                hiddenFrom="lg"
              />
              <PlayerChip player={player} size="sm" hiddenFrom="md" />
            </>
          ) : (
            <>
              <PlayerChip player={player} size="md" visibleFrom="lg" />
              <PlayerChip
                player={player}
                size="sm"
                visibleFrom="md"
                hiddenFrom="lg"
              />
              <PlayerChip player={player} size="sm" hiddenFrom="md" />
            </>
          )}
        </Stack>
      )}
    </Hex>
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
