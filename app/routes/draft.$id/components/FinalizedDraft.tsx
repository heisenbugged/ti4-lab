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
import { SummaryRow } from "./SummaryRow";
import { useMemo, useState } from "react";
import { SummaryCard } from "./MidDraftSummary";
import { Link, useOutletContext } from "@remix-run/react";
import { PlayerInputSection } from "~/routes/draft.new/components/PlayerInputSection";
import {
  hydratedMapStringAtom,
  useHydratedDraft,
} from "~/hooks/useHydratedDraft";
import { useDraftConfig } from "~/hooks/useDraftConfig";
import { MapSection } from "../sections";
import { useAtom } from "jotai";
import { useSyncDraft } from "~/hooks/useSyncDraft";
import { PlanetFinder } from "./PlanetFinder";

export function FinalizedDraft() {
  const { adminMode } = useOutletContext<{
    adminMode: boolean;
  }>();

  const config = useDraftConfig();
  const draftUrl = useDraft((state) => state.draftUrl);
  const draft = useDraft((state) => state.draft);
  const { updatePlayerName } = useDraft((state) => state.actions);
  const {
    slices,
    players,
    settings: { draftSpeaker, draftPlayerColors },
  } = draft;
  const usingMinorFactions = useDraft(
    (state) =>
      state.draft.settings.minorFactionsInSharedPool ||
      state.draft.availableMinorFactions !== undefined,
  );
  const { hydratedPlayers } = useHydratedDraft();
  const { syncDraft } = useSyncDraft();

  const [exportingImage, setExportingImage] = useState(false);
  const sortedPlayers = useMemo(
    () => hydratedPlayers.sort((a, b) => a.speakerOrder! - b.speakerOrder!),
    [hydratedPlayers],
  );
  const [mapString] = useAtom(hydratedMapStringAtom);

  return (
    <Stack mt="lg" gap={30}>
      <PlanetFinder onSystemSelected={syncDraft} />
      <Title>Draft complete!</Title>
      <SimpleGrid cols={{ base: 1, sm: 1, md: 1, lg: 2 }} style={{ gap: 30 }}>
        <Stack flex={1} gap="xl">
          <Section>
            <SectionTitle title="Draft Summary" />
            <Stack mt="lg" gap="md" hiddenFrom="sm">
              {hydratedPlayers.map((p) => (
                <SummaryCard
                  config={config}
                  key={p.id}
                  player={p}
                  slice={
                    p.sliceIdx !== undefined ? slices[p.sliceIdx] : undefined
                  }
                  showSeat={draftSpeaker}
                  showPlayerColor={!!draftPlayerColors}
                  showMinorFaction={usingMinorFactions}
                />
              ))}
            </Stack>
            <Table visibleFrom="sm">
              <Table.Thead>
                <Table.Tr>
                  <Table.Th>Name</Table.Th>
                  <Table.Th>Faction</Table.Th>
                  <Table.Th>Speaker Order</Table.Th>
                  {draftSpeaker && <Table.Th>Seat</Table.Th>}
                  <Table.Th>Optimal Value</Table.Th>
                  <Table.Th>Total Value</Table.Th>
                  <Table.Th>Features</Table.Th>
                  {draftPlayerColors && <Table.Th>Color</Table.Th>}
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {sortedPlayers.map((p) => (
                  <SummaryRow
                    key={p.id}
                    player={p}
                    slice={slices[p.sliceIdx!]}
                    draftSpeaker={draftSpeaker}
                    showPlayerColor={!!draftPlayerColors}
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
              to={`/map-image/draft/${draftUrl}/generate`}
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

          {adminMode && (
            <Box>
              <PlayerInputSection
                players={players}
                onChangeName={(playerIdx, name) => {
                  updatePlayerName(playerIdx, name);
                }}
              />
              <Button mt="lg" onClick={syncDraft}>
                Save
              </Button>
            </Box>
          )}
        </Stack>
        <Stack flex={1} gap="xl">
          <MapSection />
        </Stack>
      </SimpleGrid>
    </Stack>
  );
}
