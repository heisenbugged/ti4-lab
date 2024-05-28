import { Button, Group, SimpleGrid, Table, Tabs } from "@mantine/core";
import { Section, SectionTitle } from "~/components/Section";
import { Slice } from "~/components/Slice";
import { PlanetStatsPill } from "~/components/Slice/PlanetStatsPill";
import { SliceFeatures } from "~/components/Slice/SliceFeatures";
import { valueSlice, valueSystem } from "~/stats";
import { Player } from "~/types";
import {
  MapConfig,
  mapConfig,
  optimalStatsForSystems,
  systemsInSlice,
  totalStatsForSystems,
} from "~/utils/map";

type Props = {
  fullView?: boolean;
  config: MapConfig;
  mode: "create" | "draft";
  slices: string[][];
  allowSliceSelection?: boolean;
  players?: Player[];
  onRandomizeSlices?: () => void;
  onAddNewSlice?: () => void;
  onSelectSlice?: (sliceIdx: number) => void;
  onSelectTile?: (sliceIdx: number, tileIdx: number) => void;
  onDeleteTile?: (sliceIdx: number, tileIdx: number) => void;
};

export function SlicesSection({
  fullView = false,
  config,
  slices,
  players,
  mode = "create",
  allowSliceSelection = true,
  onRandomizeSlices,
  onAddNewSlice,
  onSelectTile,
  onDeleteTile,
  onSelectSlice,
}: Props) {
  const cols = fullView
    ? { base: 1, xs: 2, sm: 2, md: 3, lg: 3, xl: 4, xxl: 6 }
    : { base: 1, sm: 2, md: 2, lg: 2 };
  return (
    <Section>
      <div style={{ position: "sticky", top: 60, zIndex: 5 }}>
        <SectionTitle title="Slices">
          {mode === "create" && (
            <Group gap={4}>
              <Button onMouseDown={onRandomizeSlices} variant="light">
                Generate Random Slices
              </Button>
              <Button onMouseDown={onAddNewSlice}>Add New Slice</Button>
            </Group>
          )}
        </SectionTitle>
      </div>
      <Tabs defaultValue="detailed" variant="outline">
        <Tabs.List mb="sm">
          <Tabs.Tab value="detailed">Detailed</Tabs.Tab>
          <Tabs.Tab value="summary">Summary</Tabs.Tab>
        </Tabs.List>
        <Tabs.Panel value="detailed">
          <SimpleGrid
            flex={1}
            cols={cols}
            spacing="lg"
            style={{ alignItems: "flex-start" }}
          >
            {slices.map((slice, idx) => (
              <Slice
                key={idx}
                config={config}
                id={`slice-${idx}`}
                name={`Slice ${idx + 1}`}
                mode={mode}
                systems={slice}
                player={players?.find((p) => p.sliceIdx === idx)}
                onSelectTile={(tile) => onSelectTile?.(idx, tile.idx)}
                onDeleteTile={(tile) => onDeleteTile?.(idx, tile.idx)}
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
                <Table.Th>Value</Table.Th>
                <Table.Th>Optimal</Table.Th>
                <Table.Th>Total</Table.Th>
                <Table.Th visibleFrom="xs">Features</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {slices.map((slice, idx) => {
                const systems = systemsInSlice(slice);
                const total = totalStatsForSystems(systems);
                const optimal = optimalStatsForSystems(systems);
                return (
                  <Table.Tr key={idx}>
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
                        (
                        {(
                          optimal.resources +
                          optimal.influence +
                          optimal.flex
                        ).toString()}
                        )
                      </Group>
                    </Table.Td>
                    <Table.Td>
                      <Group gap={2}>
                        <PlanetStatsPill
                          size="sm"
                          resources={total.resources}
                          influence={total.influence}
                        />
                        ({(total.resources + total.influence).toString()})
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
        </Tabs.Panel>
      </Tabs>
    </Section>
  );
}
