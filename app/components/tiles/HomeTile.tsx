import { useContext } from "react";
import { Hex } from "../Hex";
import { Button, Group, Stack, Text, Modal } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
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
import { CoreSliceData } from "~/hooks/useCoreSliceValues";
import { SliceValuePopover } from "../Slice/SliceValuePopover";
import { factions } from "~/data/factionData";

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
  coreSliceData?: CoreSliceData;
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
  coreSliceData,
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

  const assignedColor =
    player && rawDraftContext?.playerColorAssignments
      ? rawDraftContext.playerColorAssignments[player.id]
      : undefined;

  const rawDraftFaction =
    player && rawDraftContext?.playerFactions
      ? rawDraftContext.playerFactions[player.id]
      : undefined;

  const faction: FactionId | undefined =
    rawDraftFaction ||
    (player && hasFaction(player) ? player.faction : undefined);

  const [
    factionModalOpened,
    { open: openFactionModal, close: closeFactionModal },
  ] = useDisclosure();

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

  const homeColorClass = assignedColor
    ? classes[assignedColor as keyof typeof classes] || classes.home
    : classes.home;

  const isClickable = rawDraftContext && player && faction !== undefined;

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (isClickable && (e.key === "Enter" || e.key === " ")) {
      e.preventDefault();
      openFactionModal();
    }
  };

  return (
    <>
      <div
        style={isClickable ? { cursor: "pointer" } : undefined}
        onClick={isClickable ? openFactionModal : undefined}
        onKeyDown={isClickable ? handleKeyDown : undefined}
        role={isClickable ? "button" : undefined}
        tabIndex={isClickable ? 0 : undefined}
      >
        <Hex id={`${mapId}-home`} radius={radius} colorClass={homeColorClass}>
          {faction && factionSystems[faction] && (
            <SystemId
              id={factionSystems[faction].id}
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
              {coreSliceData && (
                <Group gap={4} align="center">
                  <Text fz={{ base: "sm", xs: "lg" }} fw="bold" c="yellow.5">
                    {coreSliceData.value.toFixed(1)}
                  </Text>
                  <SliceValuePopover
                    breakdown={coreSliceData.breakdown}
                    title="Seat Value"
                    variant="dark"
                  />
                </Group>
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
                  {sliceStats.resources}/{sliceStats.influence}{" "}
                  {sliceStats.techs}
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
              {faction && (
                <FactionIcon
                  faction={faction}
                  style={{ maxWidth: radius * 0.6, maxHeight: radius * 0.6 }}
                />
              )}
              {/* Use smaller sizes in raw draft mode, and also smaller in regular draft */}
              {rawDraftContext ? (
                <>
                  <PlayerChip
                    player={player}
                    size="sm"
                    visibleFrom="lg"
                    color={assignedColor}
                  />
                  <PlayerChip
                    player={player}
                    size="sm"
                    visibleFrom="md"
                    hiddenFrom="lg"
                    color={assignedColor}
                  />
                  <PlayerChip
                    player={player}
                    size="sm"
                    hiddenFrom="md"
                    color={assignedColor}
                  />
                  {faction && (
                    <Text
                      size="xs"
                      fw={500}
                      c="white"
                      ta="center"
                      style={{ textShadow: "1px 1px 2px rgba(0,0,0,0.8)" }}
                    >
                      {factions[faction].name}
                    </Text>
                  )}
                </>
              ) : (
                <>
                  <PlayerChip player={player} size="md" visibleFrom="lg" compact />
                  <PlayerChip
                    player={player}
                    size="sm"
                    visibleFrom="md"
                    hiddenFrom="lg"
                    compact
                  />
                  <PlayerChip player={player} size="sm" hiddenFrom="md" compact />
                </>
              )}
            </Stack>
          )}
        </Hex>
      </div>
      {faction && (
        <Modal
          opened={factionModalOpened}
          onClose={closeFactionModal}
          size="100%"
          title={factions[faction].name}
          centered
        >
          <img
            src={`/factioncards/${faction}.png`}
            alt={`${factions[faction].name} faction card`}
            style={{
              objectFit: "contain",
              maxHeight: 500,
              maxWidth: "100%",
              margin: "auto",
              display: "block",
            }}
          />
        </Modal>
      )}
    </>
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
