import { useContext } from "react";
import { Hex } from "../Hex";
import { MapContext } from "../MapContext";
import { Button, Stack, Text } from "@mantine/core";
import { HomeTile as THomeTile } from "~/types";
import { FactionIcon } from "../features/FactionIcon";

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
        <Stack align="center" gap={12} w={radius * 1.25} justify="center">
          {tile.player.faction && (
            <FactionIcon
              faction={tile.player.faction}
              style={{ maxWidth: radius * 0.6, maxHeight: radius * 0.6 }}
            />
          )}
          <Text
            ta="center"
            lh={1}
            c="violet.9"
            fw="bold"
            tt="uppercase"
            size="xs"
          >
            {tile.player.name}
          </Text>
        </Stack>
      )}
    </Hex>
  );
}
