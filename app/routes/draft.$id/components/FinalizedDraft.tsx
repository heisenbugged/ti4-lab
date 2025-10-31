import {
  Box,
  Button,
  SimpleGrid,
  Stack,
  Table,
  Text,
  Title,
  Badge,
  Group,
  Anchor,
} from "@mantine/core";
import { IconShare } from "@tabler/icons-react";
import { useDraft } from "~/draftStore";
import { Section, SectionTitle } from "~/components/Section";
import { SummaryRow } from "./SummaryRow";
import { useMemo } from "react";
import { SummaryCard } from "./MidDraftSummary";
import { useNavigate } from "@remix-run/react";
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
import styles from "./FinalizedDraft.module.css";
import { trackButtonClick } from "~/lib/analytics.client";
import { OriginalArtToggle } from "~/components/OriginalArtToggle";
import { StartingUnitsTable } from "~/components/StartingUnitsTable";
import { FactionIcon } from "~/components/icons/FactionIcon";
import { factions as allFactions } from "~/data/factionData";

export function FinalizedDraft() {
  const navigate = useNavigate();
  const { adminMode } = useSafeOutletContext();

  const config = useDraftConfig();
  const draftUrl = useDraft((state) => state.draftUrl);
  const draft = useDraft((state) => state.draft);
  const { updatePlayerName } = useDraft((state) => state.actions);
  const { undoLastSelection } = useDraft((state) => state.draftActions);
  const selections = useDraft((state) => state.draft.selections);
  const {
    slices,
    players,
    settings: { draftSpeaker, draftPlayerColors, draftGameMode },
  } = draft;
  const usingMinorFactions = useDraft(
    (state) =>
      state.draft.settings.minorFactionsInSharedPool ||
      state.draft.availableMinorFactions !== undefined,
  );
  const { hydratedPlayers } = useHydratedDraft();
  const { syncDraft } = useSyncDraft();

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
        <Group gap="md">
          <Button
            onClick={() => {
              if (confirm("Are you sure you want to undo the last selection?")) {
                undoLastSelection();
                syncDraft();
              }
            }}
            disabled={selections.length === 0}
          >
            Undo Last Selection
          </Button>
          <Button
            size="lg"
            variant="light"
            onClick={() => navigate(`/draft/${draftUrl}/replay`)}
          >
            Replay Draft
          </Button>
          <Anchor href={`/draft/${draftUrl}.png`} target="_blank">
            <Button
              size="lg"
              color="green"
              leftSection={<IconShare size={20} />}
            >
              Share
            </Button>
          </Anchor>
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
      </Group>
      <SimpleGrid
        cols={{ base: 1, sm: 1, md: 1, lg: 2 }}
        style={{ gap: 30 }}
        mb={20}
      >
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
          {draftGameMode === "twilightsFall" && (
            <Section>
              <SectionTitle title="Starting Units" />
              <Table striped highlightOnHover>
                <Table.Thead>
                  <Table.Tr>
                    <Table.Th>Player</Table.Th>
                    <Table.Th>Faction</Table.Th>
                    <Table.Th>Units</Table.Th>
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                  {sortedPlayers.map((player) => {
                    const startingUnitsFaction = player.startingUnitsFactionId
                      ? allFactions[player.startingUnitsFactionId]
                      : undefined;
                    const fleetComposition =
                      startingUnitsFaction?.fleetComposition;

                    if (!fleetComposition) return null;

                    return (
                      <Table.Tr key={player.id}>
                        <Table.Td>
                          <Text fw="bold">{player.name}</Text>
                        </Table.Td>
                        <Table.Td>
                          {player.startingUnitsFactionId &&
                            startingUnitsFaction && (
                              <Group gap="xs" align="center">
                                <FactionIcon
                                  faction={player.startingUnitsFactionId}
                                  style={{ maxHeight: 22 }}
                                />
                                <Text size="sm">
                                  {startingUnitsFaction.name}
                                </Text>
                              </Group>
                            )}
                        </Table.Td>
                        <Table.Td>
                          <StartingUnitsTable
                            fleetComposition={fleetComposition}
                            showTitle={false}
                          />
                        </Table.Td>
                      </Table.Tr>
                    );
                  })}
                </Table.Tbody>
              </Table>
            </Section>
          )}
          <Section>
            <SectionTitle title="Tiles" />
            <Text>
              {mapString
                .split(" ")
                .sort((a, b) => Number(a) - Number(b))
                .join(", ")}
            </Text>
            <div>
              <Button onClick={() => navigator.clipboard.writeText(mapString)}>
                Copy TTS String
              </Button>
            </div>
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
          <OriginalArtToggle />
          <MapSection />
        </Stack>
      </SimpleGrid>
    </Stack>
  );
}
