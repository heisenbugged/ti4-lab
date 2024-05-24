import { Button, SimpleGrid, Table, Tabs } from "@mantine/core";
import { Section, SectionTitle } from "~/components/Section";
import { Slice } from "~/components/Slice";
import { PlanetStatsPill } from "~/components/Slice/PlanetStatsPill";
import { Player } from "~/types";

type Props = {
  mode: "create" | "draft";
  slices: string[][];
  allowSliceSelection?: boolean;
  players?: Player[];
  onAddNewSlice?: () => void;
  onSelectSlice?: (sliceIdx: number) => void;
  onSelectTile?: (sliceIdx: number, tileIdx: number) => void;
};

export function SlicesSection({
  slices,
  players,
  mode = "create",
  allowSliceSelection = true,
  onAddNewSlice,
  onSelectTile,
  onSelectSlice,
}: Props) {
  return (
    <Section>
      <div style={{ position: "sticky", top: 60, zIndex: 5 }}>
        <SectionTitle title="Slices">
          {mode === "create" && (
            <Button onMouseDown={onAddNewSlice}>Add New Slice</Button>
          )}
        </SectionTitle>
      </div>
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
                player={players?.find((p) => p.sliceIdx === idx)}
                mode={mode}
                systems={slice}
                onSelectTile={(tile) => {
                  onSelectTile?.(idx, tile.idx);
                }}
                onSelectSlice={
                  allowSliceSelection ? () => onSelectSlice?.(idx) : undefined
                }
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
