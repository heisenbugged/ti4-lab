import { SimpleGrid, Stack, Table, Textarea, Title } from "@mantine/core";
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
    () => players.sort((a, b) => a.speakerOrder!! - b.speakerOrder!!),
    [players],
  );

  // TODO: Move this to an actual reusable function
  const mapString = draft.hydratedMap
    .slice(1, draft.hydratedMap.length)
    .map((t) => {
      if (t.type === "HOME") return "0";
      if (t.system) return t.system.id;
      return "-1";
    })
    .join(" ");

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
                  <Table.Th>Speaker Order</Table.Th>
                  <Table.Th>Seat</Table.Th>
                  <Table.Th>Optimal Value</Table.Th>
                  <Table.Th>Total Value</Table.Th>
                  <Table.Th>Features</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {sortedPlayers.map((p) => (
                  <SummaryRow
                    config={draft.config}
                    key={p.id}
                    player={p}
                    systems={slices[p.sliceIdx!!]}
                  />
                ))}
              </Table.Tbody>
            </Table>
          </Section>
          <Section>
            <SectionTitle title="Map String" />
            <Textarea>{mapString}</Textarea>
          </Section>
        </Stack>
        <Stack flex={1} gap="xl">
          <MapSection
            config={draft.config}
            map={draft.hydratedMap}
            allowSeatSelection={false}
            mode="draft"
          />
        </Stack>
      </SimpleGrid>
    </Stack>
  );
}
