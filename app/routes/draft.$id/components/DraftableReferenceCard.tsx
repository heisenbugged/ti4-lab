import { Badge, Box, Flex, Group, Text, Table } from "@mantine/core";
import { FactionIcon } from "~/components/icons/FactionIcon";
import { Faction, HydratedPlayer } from "~/types";
import { PlayerChipOrSelect } from "./PlayerChipOrSelect";
import { factionSystems } from "~/data/systemData";
import { RawSystemTile } from "~/components/tiles/SystemTile";

import { playerColors } from "~/data/factionData";
import { SelectableCard, PlayerColor } from "~/ui";

type Props = {
  faction: Faction;
  player?: HydratedPlayer;
  disabled?: boolean;
  onSelect?: () => void;
};

export function DraftableReferenceCard({
  faction,
  player,
  disabled = false,
  onSelect,
}: Props) {
  const playerColor =
    player?.id !== undefined ? (playerColors[player.id] as PlayerColor) : undefined;

  const homeSystem = factionSystems[faction.id];
  const priorityOrder = faction.priorityOrder ?? Math.floor(Math.random() * 100);

  return (
    <SelectableCard
      selected={!!player}
      selectedColor={playerColor}
      hoverable={!!onSelect}
      disabled={disabled}
      onSelect={onSelect && !disabled ? onSelect : undefined}
      header={
        <>
          <Group
            align="center"
            flex={1}
            style={{
              overflow: "hidden",
              flexWrap: "nowrap",
            }}
            pt={5}
            pb={10}
            px="sm"
          >
            <Flex align="center" w="25px" h="25px">
              <FactionIcon
                faction={faction.id}
                style={{ width: 25, height: 25 }}
              />
            </Flex>
            <Text flex={1} size="14px" ff="heading" fw="bold">
              {faction.name}
            </Text>
            <Badge size="sm" color="blue" variant="filled">
              Priority: {priorityOrder}
            </Badge>
          </Group>

          <PlayerChipOrSelect
            player={player}
            selectTitle="Select"
            onSelect={
              onSelect
                ? (e) => {
                    e.preventDefault();
                    onSelect();
                  }
                : undefined
            }
            disabled={disabled}
            isMinor={false}
          />
        </>
      }
      body={
        <Box p="xs">
        <Group align="flex-start" gap="xs" wrap="nowrap">
          {homeSystem && (
            <Box>
              <RawSystemTile
                mapId={`reference-${faction.id}`}
                tile={{ type: "SYSTEM", systemId: homeSystem.id, idx: 0, position: { x: 0, y: 0 } }}
                radius={40}
                disablePopover={true}
              />
            </Box>
          )}
          <Table
            horizontalSpacing={4}
            verticalSpacing={1}
            style={{
              fontSize: "10px",
              flex: 1,
            }}
          >
            <Table.Tbody>
              <Table.Tr>
                <Table.Td c="dimmed" p={2}>Carrier</Table.Td>
                <Table.Td ta="right" p={2}>2</Table.Td>
              </Table.Tr>
              <Table.Tr>
                <Table.Td c="dimmed" p={2}>Dreadnought</Table.Td>
                <Table.Td ta="right" p={2}>1</Table.Td>
              </Table.Tr>
              <Table.Tr>
                <Table.Td c="dimmed" p={2}>Fighter</Table.Td>
                <Table.Td ta="right" p={2}>3</Table.Td>
              </Table.Tr>
              <Table.Tr>
                <Table.Td c="dimmed" p={2}>Infantry</Table.Td>
                <Table.Td ta="right" p={2}>4</Table.Td>
              </Table.Tr>
              <Table.Tr>
                <Table.Td c="dimmed" p={2}>Space Dock</Table.Td>
                <Table.Td ta="right" p={2}>1</Table.Td>
              </Table.Tr>
            </Table.Tbody>
          </Table>
        </Group>
        </Box>
      }
    />
  );
}
