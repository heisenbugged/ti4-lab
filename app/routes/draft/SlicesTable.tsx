import { Box, Group, Table } from "@mantine/core";
import { PlanetStatsPill } from "~/components/Slice/PlanetStatsPill";
import { SliceFeatures } from "~/components/Slice/SliceFeatures";
import { valueSlice } from "~/stats";
import { optimalStatsForSystems, totalStatsForSystems } from "~/utils/map";
import { useSortedSlices } from "./useSortedSlices";
import { Slice } from "~/types";
import { systemsInSlice } from "~/utils/slice";

import classes from "~/components/Table.module.css";
import { useDraft } from "~/draftStore";

type Props = {
  slices: Slice[];
  draftedSlices?: number[];
};

export function SlicesTable({ slices, draftedSlices = [] }: Props) {
  const entropicScarValue = useDraft(
    (state) => state.draft.settings.sliceGenerationConfig?.entropicScarValue,
  );
  const sortedSlices = useSortedSlices(slices, draftedSlices, entropicScarValue);
  return (
    <Table className={classes.table}>
      <Table.Thead>
        <Table.Tr>
          <Table.Th>Name</Table.Th>
          <Table.Th>Optimal</Table.Th>
          <Table.Th>Total</Table.Th>
          <Table.Th visibleFrom="xs">Features</Table.Th>
        </Table.Tr>
      </Table.Thead>
      <Table.Tbody>
        {sortedSlices.map(({ slice, idx }) => {
          const systems = systemsInSlice(slice);
          const total = totalStatsForSystems(systems);
          const optimal = optimalStatsForSystems(systems, entropicScarValue);
          const isDrafted = draftedSlices.includes(idx);
          return (
            <Table.Tr
              key={idx}
              className={isDrafted ? classes.isDrafted : undefined}
              opacity={isDrafted ? 0.6 : 1}
            >
              <Table.Td>{slice.name}</Table.Td>
              <Table.Td>
                <Group gap={2}>
                  <PlanetStatsPill
                    size="sm"
                    resources={optimal.resources}
                    influence={optimal.influence}
                    flex={optimal.flex}
                  />
                  <Box visibleFrom="xs">({valueSlice(systems, entropicScarValue).toString()})</Box>
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
