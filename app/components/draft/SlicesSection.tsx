import { Button, SimpleGrid, Table, Tabs } from "@mantine/core";
import { Section, SectionTitle } from "./Section";
import { Slice } from "../Slice";
import { PlanetStatsPill } from "../Slice/PlanetStatsPill";

type Props = {
  slices: string[][];
  onAddNewSlice: () => void;
  onSelectTile: (sliceIdx: number, tileIdx: number) => void;
};

export function SlicesSection({ slices, onAddNewSlice, onSelectTile }: Props) {
  return (
    <Section>
      <SectionTitle title="Slices">
        <Button onMouseDown={onAddNewSlice}>Add New Slice</Button>
      </SectionTitle>
      <Tabs defaultValue="detailed">
        <Tabs.List mb="sm">
          <Tabs.Tab value="detailed">Detailed</Tabs.Tab>
          <Tabs.Tab value="summary">Summary</Tabs.Tab>
        </Tabs.List>
        <Tabs.Panel value="detailed">
          <SimpleGrid
            flex={1}
            cols={{ base: 1, sm: 2, md: 2, lg: 2 }}
            spacing="lg"
            style={{ alignItems: "flex-start" }}
          >
            {slices.map((slice, idx) => (
              <Slice
                key={idx}
                id={`slice-${idx}`}
                name={`Slice ${idx + 1}`}
                mode="create"
                systems={slice}
                onSelectTile={(tile) => {
                  onSelectTile(idx, tile.idx);
                }}
              />
            ))}
          </SimpleGrid>
        </Tabs.Panel>
        <Tabs.Panel value="summary">
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
        </Tabs.Panel>
      </Tabs>
    </Section>
  );
}
