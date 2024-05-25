import { Box, Button, Flex, Group, Stack, Text, Title } from "@mantine/core";
import { FactionIcon } from "~/components/icons/FactionIcon";
import { Faction, Player } from "~/types";
import { PlayerChip } from "./PlayerChip";
import { PlayerChipOrSelect } from "./PlayerChipOrSelect";

type Props = {
  faction: Faction;
  player?: Player;
  onSelect?: () => void;
};

export function DraftableFaction({ faction, player, onSelect }: Props) {
  return (
    <Stack
      gap="md"
      bg="gray.1"
      px="sm"
      py={8}
      style={{
        borderRadius: 8,
        border: "1px solid rgba(0,0,0,0.1)",
        cursor: "pointer",
        position: "relative",
      }}
    >
      <Group
        align="center"
        flex={1}
        style={{
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
          overflow: "hidden",
          flexWrap: "nowrap",
        }}
        pt={5}
      >
        <Flex visibleFrom="sm" align="center" w="25px" h="25px">
          <FactionIcon
            faction={faction.id}
            style={{ maxWidth: 25, maxHeight: 25 }}
          />
        </Flex>
        <Text flex={1} size="14px" ff="heading" fw="bold">
          {faction.name}
        </Text>
      </Group>

      <PlayerChipOrSelect player={player} onSelect={onSelect} />
    </Stack>
  );
}
