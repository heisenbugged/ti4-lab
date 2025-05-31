import {
  Box,
  Button,
  SimpleGrid,
  Stack,
  Table,
  Textarea,
  Title,
  Badge,
  Group,
} from "@mantine/core";
import { useDraft } from "~/draftStore";
import { Section, SectionTitle } from "~/components/Section";
import { SummaryRow } from "./SummaryRow";
import { useMemo, useState } from "react";
import { SummaryCard } from "./MidDraftSummary";
import { Link, useNavigate } from "@remix-run/react";
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
import { useSafeOutletContext } from "~/useSafeOutletContext";
import { DraftLogSection } from "./DraftLogSection";
import styles from "./FinalizedDraft.module.css";
import { trackButtonClick } from "~/lib/analytics.client";

export function FinalizedDraft() {
  const navigate = useNavigate();
  const { adminMode } = useSafeOutletContext();

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

  const handleSoundboardClick = () => {
    const factionIds = hydratedPlayers
      .map((p) => p.faction)
      .filter(Boolean)
      .join(",");

    // Track button click with PostHog
    trackButtonClick({
      buttonType: "load_soundboard",
      context: "finalized_draft",
    });

    navigate(`/voices?factions=${factionIds}`);
  };

  return (
    <Stack mt="lg" gap={30}>
      <PlanetFinder onSystemSelected={syncDraft} />
      <Group justify="space-between">
        <Title>Draft complete!</Title>
        <Box pos="relative">
          <Badge
            size="lg"
            variant="filled"
            color="orange"
            pos="absolute"
            top={-10}
            right={-10}
            style={{ zIndex: 1 }}
          >
            NEW
          </Badge>
          <Button
            size="xl"
            variant="outline"
            onClick={handleSoundboardClick}
            className={styles.soundboardButton}
          >
            Load Soundboard
          </Button>
        </Box>
      </Group>
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
          <DraftLogSection />
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
