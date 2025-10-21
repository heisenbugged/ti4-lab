import { Badge, Box, Flex, Group, Stack, Text, Table } from "@mantine/core";
import { FactionIcon } from "~/components/icons/FactionIcon";
import { Faction, HydratedPlayer } from "~/types";
import { PlayerChipOrSelect } from "./PlayerChipOrSelect";
import { factionSystems } from "~/data/systemData";
import { RawSystemTile } from "~/components/tiles/SystemTile";

import classes from "~/components/Surface.module.css";
import { playerColors } from "~/data/factionData";

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
    player?.id !== undefined ? playerColors[player.id] : undefined;

  const homeSystem = factionSystems[faction.id];
  const priorityOrder = faction.priorityOrder ?? Math.floor(Math.random() * 100);

  return (
    <Stack gap={0}>
      <Stack
        gap={2}
        px="xs"
        py={4}
        pb={2}
        className={`${classes.surface} ${classes.withBorder} ${onSelect ? classes.hoverable : ""} ${playerColor ? classes[playerColor] : ""}`}
        style={{
          borderRadius: "var(--mantine-radius-md)",
          cursor: onSelect ? "pointer" : "default",
          position: "relative",
          opacity: disabled ? 0.5 : 1,
          borderBottomLeftRadius: 0,
          borderBottomRightRadius: 0,
        }}
        onClick={onSelect && !disabled ? onSelect : undefined}
      >
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
      </Stack>
      <Box
        style={{
          borderRadius: "0 0 var(--mantine-radius-md) var(--mantine-radius-md)",
          borderTop: 0,
        }}
        className={`${classes.surface} ${classes.withBorder}`}
        p={4}
      >
        <Stack
          gap={6}
          hiddenFrom="lg"
          style={{ alignItems: "center" }}
        >
          {homeSystem && (
            <Box>
              <RawSystemTile
                mapId={`reference-${faction.id}`}
                tile={{ type: "SYSTEM", systemId: homeSystem.id }}
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
                tile={{ type: "SYSTEM", systemId: homeSystem.id }}
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
    </Stack>
  );
}
