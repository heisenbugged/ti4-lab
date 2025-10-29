import { Badge, Box, Flex, Group, Stack, Text, Table } from "@mantine/core";
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

export function CompactReferenceCard({
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
            pt={2}
            pb={4}
            gap={8}
            px="xs"
          >
            <Flex align="center" w="18px" h="18px">
              <FactionIcon
                faction={faction.id}
                style={{ width: 18, height: 18 }}
              />
            </Flex>
            <Text flex={1} size="11px" ff="heading" fw="bold" lh={1}>
              {faction.name}
            </Text>
            <Badge size="xs" color="blue" variant="filled" style={{ fontSize: "9px" }}>
              P: {priorityOrder}
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
        <Box p={4}>
        <Stack
          gap={6}
          hiddenFrom="lg"
          style={{ alignItems: "center" }}
        >
          {homeSystem && (
            <Box>
              <RawSystemTile
                mapId={`reference-${faction.id}`}
                tile={{ type: "SYSTEM", systemId: homeSystem.id, idx: 0, position: { x: 0, y: 0 } }}
                radius={60}
                disablePopover={true}
                hideValues={true}
              />
            </Box>
          )}
          <Table
            horizontalSpacing={3}
            verticalSpacing={0}
            withRowBorders={false}
            style={{
              fontSize: "11px",
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
        </Stack>
        <Group align="flex-start" gap={6} wrap="nowrap" visibleFrom="lg">
          {homeSystem && (
            <Box>
              <RawSystemTile
                mapId={`reference-${faction.id}`}
                tile={{ type: "SYSTEM", systemId: homeSystem.id, idx: 0, position: { x: 0, y: 0 } }}
                radius={60}
                disablePopover={true}
                hideValues={true}
              />
            </Box>
          )}
          <Table
            horizontalSpacing={3}
            verticalSpacing={0}
            withRowBorders={false}
            style={{
              fontSize: "11px",
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
