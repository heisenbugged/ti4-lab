import { Badge, Box, Flex, Group, Stack, Text, Table } from "@mantine/core";
import { FactionIcon } from "~/components/icons/FactionIcon";
import { Faction } from "~/types";
import { factionSystems } from "~/data/systemData";
import { RawSystemTile } from "~/components/tiles/SystemTile";

import classes from "~/components/Surface.module.css";

type Props = {
  faction: Faction;
};

export function NewDraftReferenceCard({ faction }: Props) {
  const homeSystem = factionSystems[faction.id];
  const priorityOrder = faction.priorityOrder ?? Math.floor(Math.random() * 100);

  return (
    <Stack gap={0}>
      <Stack
        gap={4}
        px="sm"
        py={8}
        pb={4}
        className={`${classes.surface} ${classes.withBorder}`}
        style={{
          borderRadius: "var(--mantine-radius-md)",
          position: "relative",
          borderBottomLeftRadius: 0,
          borderBottomRightRadius: 0,
        }}
      >
        <Group
          align="center"
          flex={1}
          style={{
            overflow: "hidden",
            flexWrap: "nowrap",
          }}
          pt={5}
          pb={10}
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
      </Stack>
      <Box
        style={{
          borderRadius: "0 0 var(--mantine-radius-md) var(--mantine-radius-md)",
          borderTop: 0,
        }}
        className={`${classes.surface} ${classes.withBorder}`}
        p="xs"
      >
        <Group align="flex-start" gap="xs" wrap="nowrap">
          {homeSystem && (
            <Box>
              <RawSystemTile
                mapId={`reference-${faction.id}`}
                tile={{ type: "SYSTEM", systemId: homeSystem.id }}
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
    </Stack>
  );
}
