import { SliceFeatures } from "~/components/Slice/SliceFeatures";
import { optimalStatsForSystems } from "~/utils/map";
import { useSortedSlices } from "./useSortedSlices";
import { Slice } from "~/types";
import { systemsInSlice } from "~/utils/slice";
import { useSliceValue } from "~/hooks/useSliceValue";
import { Table, ValuePill } from "~/ui";

import classes from "./SlicesTable.module.css";

type Props = {
  slices: Slice[];
  draftedSlices?: number[];
};

function SliceRow({ slice, isDrafted }: { slice: Slice; isDrafted: boolean }) {
  const systems = systemsInSlice(slice);
  const optimal = optimalStatsForSystems(systems);
  const sliceValue = useSliceValue(slice);

  return (
    <Table.Tr className={isDrafted ? classes.drafted : undefined}>
      <Table.Td className={classes.name}>{slice.name}</Table.Td>
      <Table.Td numeric className={classes.sv}>
        {sliceValue % 1 === 0 ? sliceValue : sliceValue.toFixed(1)}
      </Table.Td>
      <Table.Td>
        <ValuePill
          size="sm"
          r={optimal.resources}
          i={optimal.influence}
          f={optimal.flex}
          total={optimal.resources + optimal.influence + optimal.flex}
        />
      </Table.Td>
      <Table.Td className={classes.features}>
        <SliceFeatures slice={slice} />
      </Table.Td>
    </Table.Tr>
  );
}

export function SlicesTable({ slices, draftedSlices = [] }: Props) {
  const sortedSlices = useSortedSlices(slices, draftedSlices);
  return (
    <Table>
      <Table.Thead>
        <Table.Tr>
          <Table.Th>Name</Table.Th>
          <Table.Th>SV</Table.Th>
          <Table.Th>Optimal</Table.Th>
          <Table.Th className={classes.features}>Features</Table.Th>
        </Table.Tr>
      </Table.Thead>
      <Table.Tbody>
        {sortedSlices.map(({ slice, idx }) => (
          <SliceRow
            key={idx}
            slice={slice}
            isDrafted={draftedSlices.includes(idx)}
          />
        ))}
      </Table.Tbody>
    </Table>
  );
}
