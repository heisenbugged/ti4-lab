import { useContext } from "react";
import { Hex } from "../Hex";
import { Button, Stack, Text } from "@mantine/core";
import type { HomeTile } from "~/types";
import { MapContext } from "~/contexts/MapContext";
import { FactionIcon } from "../icons/FactionIcon";
import { PlayerChip } from "~/routes/draft.$id/components/PlayerChip";
import { calcScale } from "./calcScale";
import { SystemId } from "../SystemId";
import { factionSystems } from "~/data/systemData";
import { useHydratedDraft } from "~/hooks/useHydratedDraft";
import { useDraft } from "~/draftStore";

import classes from "./Tiles.module.css";

type Props = {
  mapId: string;
  tile: HomeTile;
  selectable?: boolean;
  onSelect?: () => void;
};

const seatLabel = ["Speaker", "2nd", "3rd", "4th", "5th", "6th"];

export function HomeTile({ mapId, tile, onSelect, selectable = false }: Props) {
  const { radius, disabled } = useContext(MapContext);
  const hydrated = useDraft((state) => state.hydrated);
  const draftSpeaker = useDraft((state) => state.draft.settings.draftSpeaker);
  const { hydratedPlayers } = useHydratedDraft();
  const player =
    tile.playerId !== undefined
      ? hydratedPlayers.find((p) => p.id === tile.playerId)
      : undefined;
  const scale = calcScale(radius);
  const systemIdSize = radius >= 53 ? "10px" : "8px";

  return (
    <Hex id={`${mapId}-home`} radius={radius} colorClass={classes.home}>
      {player?.faction && factionSystems[player.faction] && (
        <SystemId
          id={factionSystems[player.faction].id}
          radius={radius}
          size={systemIdSize}
          scale={scale}
        />
      )}
      {!player && (
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
            >
              Select Seat
            </Button>
          )}
        </Stack>
      )}
      {player && (
        <Stack
          align="center"
          gap="6px"
          w={radius * 1.25}
          justify="center"
          style={{ zIndex: 1 }}
        >
          {player.faction && (
            <FactionIcon
              visibleFrom="xs"
              faction={player.faction}
              style={{ maxWidth: radius * 0.6, maxHeight: radius * 0.6 }}
            />
          )}
          <PlayerChip player={player} size="lg" visibleFrom="lg" />
          <PlayerChip player={player} size="md" hiddenFrom="lg" />
        </Stack>
      )}
    </Hex>
  );
}
