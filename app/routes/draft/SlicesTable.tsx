import { Box, Group, Table } from "@mantine/core";
import { useMemo } from "react";
import { PlanetStatsPill } from "~/components/Slice/PlanetStatsPill";
import { SliceFeatures } from "~/components/Slice/SliceFeatures";
import { valueSlice } from "~/stats";
import {
  optimalStatsForSystems,
  systemsInSlice,
  totalStatsForSystems,
} from "~/utils/map";
import { useSortedSlices } from "./useSortedSlices";

import "./SlicesTable.css";

type Props = {
  slices: string[][];
  draftedSlices?: number[];
};

export function SlicesTable({ slices, draftedSlices = [] }: Props) {
  const sortedSlices = useSortedSlices(slices, draftedSlices);
  return (
    <Table>
      <Table.Thead>
        <Table.Tr>
          <Table.Th>Name</Table.Th>
          <Table.Th>Value</Table.Th>
          <Table.Th>Optimal</Table.Th>
          <Table.Th>Total</Table.Th>
          <Table.Th visibleFrom="xs">Features</Table.Th>
        </Table.Tr>
      </Table.Thead>
      <Table.Tbody>
        {sortedSlices.map(({ slice, idx }) => {
          const systems = systemsInSlice(slice);
          const total = totalStatsForSystems(systems);
          const optimal = optimalStatsForSystems(systems);
          const isDrafted = draftedSlices.includes(idx);
          return (
            <Table.Tr
              key={idx}
              bg={isDrafted ? "gray.2" : undefined}
              opacity={isDrafted ? 0.6 : 1}
            >
              <Table.Td>{`Slice ${idx + 1}`}</Table.Td>
              <Table.Td>{valueSlice(systems)}</Table.Td>
              <Table.Td>
                <Group gap={2}>
                  <PlanetStatsPill
                    size="sm"
                    resources={optimal.resources}
                    influence={optimal.influence}
                    flex={optimal.flex}
                  />
                  <Box visibleFrom="xs">
                    (
                    {(
                      optimal.resources +
                      optimal.influence +
                      optimal.flex
                    ).toString()}
                    )
                  </Box>
                </Group>
              </Table.Td>
              <Table.Td>
                <Group gap={2}>
                  <PlanetStatsPill
                    size="sm"
                    resources={total.resources}
                    influence={total.influence}
                  />
                  <Box visibleFrom="xs">
                    ({(total.resources + total.influence).toString()})
                  </Box>
                </Group>
              </Table.Td>
              <Table.Td visibleFrom="xs">
                <SliceFeatures slice={slice} />
              </Table.Td>
            </Table.Tr>
          );
        })}
      </Table.Tbody>
    </Table>
  );
}
