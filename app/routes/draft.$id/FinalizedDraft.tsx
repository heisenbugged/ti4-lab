import { Group, SimpleGrid, Stack, Table, Text, Title } from "@mantine/core";
import { DraftableFaction } from "~/components/DraftableFaction";
import { factions as allFactions } from "~/data/factionData";
import { MapSection } from "~/components/draft";
import { useDraft } from "~/draftStore";
import { Section, SectionTitle } from "~/components/draft/Section";
import { PlanetStatsPill } from "~/components/Slice/PlanetStatsPill";
import { useSlice } from "~/components/Slice/useSlice";
import { Player } from "~/types";
import { FactionIcon } from "~/components/features/FactionIcon";

export function FinalizedDraft() {
  const draft = useDraft();
  const slices = draft.slices;
  const players = draft.players;

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
                {players.map((p) => (
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

function SummaryRow({
  player,
  systems,
}: {
  player: Player;
  systems: string[];
}) {
  console.log("player", player);
  const faction = allFactions[player.faction!!];
  const { total, optimal, specialties } = useSlice(systems);
  return (
    <Table.Tr>
      <Table.Td>{player?.name}</Table.Td>
      <Table.Td>
        <Group>
          <FactionIcon faction={player.faction!!} style={{ height: 36 }} />
          <Text>{faction.name}</Text>
        </Group>
      </Table.Td>
      <Table.Td>{player.seatIdx + 1}</Table.Td>
      <Table.Td>
        <PlanetStatsPill
          size="sm"
          resources={optimal.resources}
          influence={optimal.influence}
        />
      </Table.Td>
      <Table.Td>
        <PlanetStatsPill
          size="sm"
          resources={total.resources}
          influence={total.influence}
        />
      </Table.Td>
    </Table.Tr>
  );
}
