import {
  Box,
  Button,
  SimpleGrid,
  Stack,
  Table,
  Text,
  Title,
  Group,
  Anchor,
  Divider,
} from "@mantine/core";
import {
  IconShare,
  IconPlayerPlay,
  IconArrowBackUp,
  IconMicrophone2,
} from "@tabler/icons-react";
import { useDraft } from "~/draftStore";
import { Section, SectionTitle } from "~/components/Section";
import { SummaryRow } from "./SummaryRow";
import { useMemo } from "react";
import { SummaryCard } from "./MidDraftSummary";
import { useNavigate } from "react-router";
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
import { trackButtonClick } from "~/lib/analytics.client";
import { LabArtToggleButton } from "~/components/LabArtToggleButton";
import { StartingUnitsTable } from "~/components/StartingUnitsTable";
import { FactionIcon } from "~/components/icons/FactionIcon";
import { factions as allFactions } from "~/data/factionData";

export function FinalizedDraft() {
  const navigate = useNavigate();
  const { adminMode, originalArt, setOriginalArt } = useSafeOutletContext();

  const config = useDraftConfig();
  const draftUrl = useDraft((state) => state.draftUrl);
  const draft = useDraft((state) => state.draft);
  const { updatePlayerName } = useDraft((state) => state.actions);
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
  const { syncDraft, undoLastPick } = useSyncDraft();

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
    <Stack mt="lg" gap="xl">
      <PlanetFinder onSystemSelected={syncDraft} />

      {/* Header */}
      <Box>
        <Group justify="space-between" align="flex-start" wrap="wrap" gap="md">
          <Title order={1}>Draft Complete</Title>
          <Group gap="sm">
            <Anchor href={`/draft/${draftUrl}.png`} target="_blank">
              <Button
                size="md"
                color="green"
                leftSection={<IconShare size={18} />}
              >
                Share Image
              </Button>
            </Anchor>
            <Button
              size="md"
              variant="light"
              color="orange"
              leftSection={<IconMicrophone2 size={18} />}
              onClick={handleSoundboardClick}
            >
              Soundboard
            </Button>
          </Group>
        </Group>

        <Divider my="md" />

        <Group gap="xs">
          <Button
            size="xs"
            variant="subtle"
            color="gray"
            leftSection={<IconPlayerPlay size={14} />}
            onClick={() => navigate(`/draft/${draftUrl}/replay`)}
          >
            Replay Draft
          </Button>
          <Button
            size="xs"
            variant="subtle"
            color="gray"
            leftSection={<IconArrowBackUp size={14} />}
            onClick={async () => {
              if (confirm("Are you sure you want to undo the last selection?")) {
                await undoLastPick();
              }
            }}
            disabled={selections.length === 0}
          >
            Undo Last
          </Button>
        </Group>
      </Box>
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
                  <Table.Th>SV</Table.Th>
                  <Table.Th>Optimal</Table.Th>
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
        <Stack flex={1} gap="md">
          <MapSection
            titleChildren={
              <LabArtToggleButton
                originalArt={originalArt}
                onToggle={() => setOriginalArt(!originalArt)}
              />
            }
          />
        </Stack>
      </SimpleGrid>
    </Stack>
  );
}
