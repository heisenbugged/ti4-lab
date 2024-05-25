import { useContext } from "react";
import { Hex } from "../Hex";
import { Button, Stack, Text } from "@mantine/core";
import { HomeTile as THomeTile } from "~/types";
import { MapContext } from "~/contexts/MapContext";
import { FactionIcon } from "../icons/FactionIcon";
import { PlayerChip } from "~/routes/draft.$id/components/PlayerChip";

type Props = {
  mapId: string;
  tile: THomeTile;
  selectable?: boolean;
  onSelect?: () => void;
};

export function HomeTile({ mapId, tile, onSelect, selectable = false }: Props) {
  const { radius } = useContext(MapContext);

  return (
    <Hex id={`${mapId}-home`} radius={radius} color="#aed6b6">
      {!tile.player && selectable && (
        <Button ta="center" lh={1} size="xs" onMouseDown={onSelect}>
          Select Seat
        </Button>
      )}
      {tile.player && (
        <Stack align="center" gap="6px" w={radius * 1.25} justify="center">
          {tile.player.faction && (
            <FactionIcon
              visibleFrom="xs"
              faction={tile.player.faction}
              style={{ maxWidth: radius * 0.6, maxHeight: radius * 0.6 }}
            />
          )}
          <PlayerChip player={tile.player} size="lg" visibleFrom="lg" />
          <PlayerChip player={tile.player} size="md" hiddenFrom="lg" />
        </Stack>
      )}
    </Hex>
  );
}
