import { Group, Table, Text } from "@mantine/core";
import { PlanetStatsPill } from "~/components/Slice/PlanetStatsPill";
import { SliceFeatures } from "~/components/Slice/SliceFeatures";
import { calculateSliceValue } from "~/stats";
import { optimalStatsForSystems } from "~/utils/map";
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
          <Table.Th>SV</Table.Th>
          <Table.Th>Optimal</Table.Th>
          <Table.Th visibleFrom="xs">Features</Table.Th>
        </Table.Tr>
      </Table.Thead>
      <Table.Tbody>
        {sortedSlices.map(({ slice, idx }) => {
          const systems = systemsInSlice(slice);
          const optimal = optimalStatsForSystems(systems);
          const sliceValue = calculateSliceValue(systems, entropicScarValue);
          const isDrafted = draftedSlices.includes(idx);
          return (
            <Table.Tr
              key={idx}
              className={isDrafted ? classes.isDrafted : undefined}
              opacity={isDrafted ? 0.6 : 1}
            >
              <Table.Td>{slice.name}</Table.Td>
              <Table.Td>
                <Text fw={700} c="yellow.5">
                  {sliceValue % 1 === 0 ? sliceValue : sliceValue.toFixed(1)}
                </Text>
              </Table.Td>
              <Table.Td>
                <Group gap={4}>
                  <PlanetStatsPill
                    size="sm"
                    resources={optimal.resources}
                    influence={optimal.influence}
                    flex={optimal.flex}
                  />
                  <Text size="xs" c="dimmed">
                    ({optimal.resources + optimal.influence + optimal.flex})
                  </Text>
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
