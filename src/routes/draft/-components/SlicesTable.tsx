import { SliceFeatures } from "~/components/Slice/SliceFeatures";
import { optimalStatsForSystems } from "~/utils/map";
import { useSortedSlices } from "./useSortedSlices";
import { Slice } from "~/types";
import { systemsInSlice } from "~/utils/slice";
import { useSliceValue } from "~/hooks/useSliceValue";
import { PlayerHex, Table, ValuePill } from "~/ui";
import classes from "./SlicesTable.module.css";

export type SliceOwner = { name: string; color: string; letter?: string };

type Props = {
  slices: Slice[];
  draftedSlices?: number[];
  /** Who took each slice, by slice index. Picked rows show the owner instead of fading. */
  owners?: Record<number, SliceOwner>;
};

function SliceRow({ slice, isDrafted, owner }: { slice: Slice; isDrafted: boolean; owner?: SliceOwner }) {
  const systems = systemsInSlice(slice);
  const optimal = optimalStatsForSystems(systems);
  const sliceValue = useSliceValue(slice);

  return (
    <Table.Tr className={isDrafted ? classes.drafted : undefined}>
      <Table.Td className={classes.name}>
        <span className={classes.nameRow}>
          <span className={classes.nameText} title={slice.name}>
            {slice.name.replace(/^Slice\s+/i, "")}
          </span>
          {owner && (
            <span className={classes.owner} title={`Taken by ${owner.name}`}>
              <PlayerHex color={owner.color} size="sm">
                {owner.letter}
              </PlayerHex>
              <span className={classes.ownerName}>{owner.name}</span>
            </span>
          )}
        </span>
      </Table.Td>
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

export function SlicesTable({ slices, draftedSlices, owners }: Props) {
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
            isDrafted={!!draftedSlices?.includes(idx)}
            owner={owners?.[idx]}
          />
        ))}
      </Table.Tbody>
    </Table>
  );
}
