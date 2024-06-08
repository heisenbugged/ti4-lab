import {
  Box,
  Button,
  SimpleGrid,
  Stack,
  Table,
  Textarea,
  Title,
} from "@mantine/core";
import { useDraft } from "~/draftStore";
import { Section, SectionTitle } from "~/components/Section";
import { MapSection } from "~/routes/draft/MapSection";
import { SummaryRow } from "./SummaryRow";
import { useMemo, useState } from "react";
import { SummaryCard } from "./MidDraftSummary";
import { Link } from "@remix-run/react";
import { PlayerInputSection } from "~/routes/draft.new/components/PlayerInputSection";
import { factionSystems, systemData } from "~/data/systemData";

type Props = {
  adminMode: boolean;
  onSelectSystemTile: (systemId: number) => void;
  onSavePlayerNames: () => void;
};

export function FinalizedDraft({
  adminMode,
  onSelectSystemTile,
  onSavePlayerNames,
}: Props) {
  const draft = useDraft();
  const slices = draft.slices;
  const players = draft.players;
  const [exportingImage, setExportingImage] = useState(false);

  const sortedPlayers = useMemo(
    () => players.sort((a, b) => a.speakerOrder! - b.speakerOrder!),
    [players],
  );

  // TODO: Move this to an actual reusable function
  const mapString = draft.hydratedMap
    .slice(1, draft.hydratedMap.length)
    .map((t) => {
      if (t.type === "HOME") {
        if (t.player?.faction === undefined) return "0";
        return factionSystems[t.player.faction].id;
      }
      if (t.system) return t.system.id;
      return "-1";
    })
    .join(" ");

  return (
    <Stack mt="lg" gap={30}>
      <Title>Draft complete!</Title>
      <SimpleGrid cols={{ base: 1, sm: 1, md: 1, lg: 2 }} style={{ gap: 60 }}>
        {adminMode && (
          <>
            <div />
            {adminMode && (
              <Box>
                <PlayerInputSection
                  players={draft.players}
                  onChangeName={(playerIdx, name) => {
                    draft.updatePlayer(playerIdx, { name });
                  }}
                />
                <Button mt="lg" onClick={onSavePlayerNames}>
                  Save
                </Button>
              </Box>
            )}
          </>
        )}
        <Stack flex={1} gap="xl">
          <Section>
            <SectionTitle title="Draft Summary" />
            <Stack mt="lg" gap="md" hiddenFrom="sm">
              {players.map((p) => (
                <SummaryCard
                  config={draft.config}
                  key={p.id}
                  player={p}
                  slice={
                    p.sliceIdx !== undefined ? slices[p.sliceIdx] : undefined
                  }
                  showSeat={draft.draftSpeaker}
                />
              ))}
            </Stack>
            <Table visibleFrom="sm">
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
                    systems={slices[p.sliceIdx!]}
                  />
                ))}
              </Table.Tbody>
            </Table>
          </Section>
          <Section>
            <SectionTitle title="Map String" />
            <Textarea>{mapString}</Textarea>
          </Section>
          <Section>
            <SectionTitle title="Export image" />
            <Link
              to={`/map-image/draft/${draft.draftUrl}/generate`}
              reloadDocument
              onClick={() => {
                setExportingImage(true);
                // cannot actually know when the image finishes downloading
                // so it's just an approximation
                setTimeout(() => setExportingImage(false), 5000);
              }}
            >
              <Button loading={exportingImage}>Download image</Button>
            </Link>
          </Section>
        </Stack>
        <Stack flex={1} gap="xl">
          <MapSection
            config={draft.config}
            map={draft.hydratedMap}
            allowSeatSelection={false}
            mode={adminMode ? "create" : "draft"}
            onDeleteSystemTile={(tile) => draft.removeSystemFromMap(tile)}
            onSelectSystemTile={onSelectSystemTile}
          />
        </Stack>
      </SimpleGrid>
    </Stack>
  );
}
