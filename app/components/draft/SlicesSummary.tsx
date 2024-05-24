import { Table } from "@mantine/core";
import { PlanetStatsPill } from "../Slice/PlanetStatsPill";

type Props = {
  slices: string[][];
};

export function SlicesSummary({ slices }: Props) {
  return (
    <Table>
      <Table.Thead>
        <Table.Tr>
          <Table.Th>Name</Table.Th>
          <Table.Th>Optimal</Table.Th>
          <Table.Th>Total</Table.Th>
        </Table.Tr>
      </Table.Thead>
      <Table.Tbody>
        {slices.map((slice, idx) => (
          <Table.Tr key={idx}>
            <Table.Td>{`Slice ${idx + 1}`}</Table.Td>
            <Table.Td>
              <PlanetStatsPill size="sm" resources={9} influence={2} />
            </Table.Td>
            <Table.Td>
              <PlanetStatsPill size="sm" resources={9} influence={2} />
            </Table.Td>
          </Table.Tr>
        ))}
      </Table.Tbody>
    </Table>
  );
}
