import {
  Box,
  Button,
  SimpleGrid,
  Stack,
  Table,
  Textarea,
  Title,
} from "@mantine/core";
import { useDraft, useDraft } from "~/draftStore";
import { Section, SectionTitle } from "~/components/Section";

import { SummaryRow } from "./SummaryRow";
import { useMemo, useState } from "react";
import { SummaryCard } from "./MidDraftSummary";
import { Link, useOutletContext } from "@remix-run/react";
import { PlayerInputSection } from "~/routes/draft.new/components/PlayerInputSection";
import { factionSystems, systemData } from "~/data/systemData";
import { useHydratedDraft } from "~/hooks/useHydratedDraft";
import { useDraftConfig } from "~/hooks/useDraftConfig";
import { systemIdsInSlice, systemsInSlice } from "~/utils/slice";
import { MapSection } from "../sections";

export function FinalizedDraft() {
  const { adminMode } = useOutletContext<{
    adminMode: boolean;
  }>();

  const config = useDraftConfig();
  const draftUrl = useDraft((state) => state.draftUrl);
  const draft = useDraft((state) => state.draft);
  const {
    slices,
    players,
    settings: { draftSpeaker },
  } = draft;
  const { hydratedPlayers } = useHydratedDraft();

  const [exportingImage, setExportingImage] = useState(false);
  const sortedPlayers = useMemo(
    () => hydratedPlayers.sort((a, b) => b.speakerOrder! - a.speakerOrder!),
    [hydratedPlayers],
  );

  const mapString = "";
  // TODO: Move this to an actual reusable function
  // const mapString = draft.hydratedMap
  //   .slice(1, draft.hydratedMap.length)
  //   .map((t) => {
  //     if (t.type === "HOME") {
  //       if (t.player?.faction === undefined) return "0";
  //       return factionSystems[t.player.faction].id;
  //     }
  //     if (t.system) return t.system.id;
  //     return "-1";
  //   })
  //   .join(" ");

  // TODO: Implement
  const onSavePlayerNames = () => {};

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
                  players={players}
                  onChangeName={(playerIdx, name) => {
                    // FIX
                    // draft.updatePlayer(playerIdx, { name });
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
              {hydratedPlayers.map((p) => (
                <SummaryCard
                  config={config}
                  key={p.id}
                  player={p}
                  slice={
                    p.sliceIdx !== undefined ? slices[p.sliceIdx] : undefined
                  }
                  showSeat={draftSpeaker}
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
                    key={p.id}
                    player={p}
                    slice={slices[p.sliceIdx!]}
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
        </Stack>
        <Stack flex={1} gap="xl">
          <MapSection />
        </Stack>
      </SimpleGrid>
    </Stack>
  );
}
