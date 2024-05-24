import { SimpleGrid, Stack, Table, Title } from "@mantine/core";
import { useDraft } from "~/draftStore";
import { Section, SectionTitle } from "~/components/Section";
import { MapSection } from "~/routes/draft/MapSection";
import { SummaryRow } from "./SummaryRow";
import { useMemo } from "react";

export function FinalizedDraft() {
  const draft = useDraft();
  const slices = draft.slices;
  const players = draft.players;

  const sortedPlayers = useMemo(
    () => players.sort((a, b) => a.seatIdx!! - b.seatIdx!!),
    [players],
  );

  return (
    <Stack mt="lg" gap={30}>
      <Title>Draft complete!</Title>
      <SimpleGrid cols={{ base: 1, sm: 1, md: 1, lg: 2 }} style={{ gap: 60 }}>
        <Stack flex={1} gap="xl">
          <Section>
            <SectionTitle title="Draft Summary" />
            <Table>
              <Table.Thead>
                <Table.Tr>
                  <Table.Th>Name</Table.Th>
                  <Table.Th>Faction</Table.Th>
                  <Table.Th>Seat</Table.Th>
                  <Table.Th>Optimal Value</Table.Th>
                  <Table.Th>Total Value</Table.Th>
                  <Table.Th>Features</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {sortedPlayers.map((p) => (
                  <SummaryRow
                    key={p.id}
                    player={p}
                    systems={slices[p.sliceIdx!!]}
                  />
                ))}
              </Table.Tbody>
            </Table>
          </Section>
        </Stack>
        <Stack flex={1} gap="xl">
          <MapSection
            map={draft.hydratedMap}
            allowSeatSelection={false}
            mode="draft"
          />
        </Stack>
      </SimpleGrid>
    </Stack>
  );
}
