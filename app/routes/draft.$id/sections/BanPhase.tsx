import { Button, Grid, SimpleGrid, Stack } from "@mantine/core";
import { CurrentPickBanner } from "../components/CurrentPickBanner";
import { DraftOrderSection } from "./DraftOrderSection";
import { SectionTitle } from "~/components/Section";
import { useDraft } from "~/draftStore";
import { DraftableFaction } from "../components/DraftableFaction";
import { factions as allFactions } from "~/data/factionData";
import { useMemo } from "react";
import { useSyncDraft } from "~/hooks/useSyncDraft";
import { useHydratedDraft } from "~/hooks/useHydratedDraft";
import { PlayerInputSection } from "~/routes/draft.new/components/PlayerInputSection";
import { useSafeOutletContext } from "~/useSafeOutletContext";

export function BanPhase() {
  const { adminMode } = useSafeOutletContext();
  const players = useDraft((state) => state.draft.players);
  const factionPool = useDraft((state) => state.factionPool);
  const { banFaction } = useDraft((state) => state.draftActions);
  const { updatePlayerName } = useDraft((state) => state.actions);
  const sortedFactionPool = useMemo(() => {
    return [...factionPool].sort((a, b) => {
      const aFaction = allFactions[a];
      const bFaction = allFactions[b];
      return aFaction.name.localeCompare(bFaction.name);
    });
  }, [factionPool]);

  const { syncDraft, syncing } = useSyncDraft();

  const { currentlyPicking, hydratedPlayers, activePlayer } =
    useHydratedDraft();

  return (
    <>
      <Stack gap="sm" mb="60" mt="lg">
        <CurrentPickBanner
          title={`It's ${activePlayer?.name}'s turn to ban!`}
        />
        <div style={{ height: 15 }} />
      </Stack>
      <Grid gutter="xl">
        <Grid.Col span={12}>
          <DraftOrderSection />
        </Grid.Col>
        <Grid.Col span={12}>
          <SectionTitle title="Ban Phase" />
          <SimpleGrid
            cols={{ base: 2, xs: 2, sm: 3, md: 4, xl: 6, xxl: 8 }}
            spacing="xs"
            mt="md"
          >
            {sortedFactionPool.map((factionId) => {
              const player = hydratedPlayers.find((p) =>
                p.bannedFactions?.includes(factionId),
              );
              return (
                <DraftableFaction
                  key={factionId}
                  player={player}
                  disabled={!!player}
                  selectTitle={"Ban"}
                  faction={allFactions[factionId]}
                  onSelect={
                    currentlyPicking && !player
                      ? () => {
                          if (
                            confirm(
                              `Banning faction ${allFactions[factionId].name}`,
                            )
                          ) {
                            banFaction(activePlayer.id, factionId);
                            syncDraft();
                          }
                        }
                      : undefined
                  }
                />
              );
            })}
          </SimpleGrid>
        </Grid.Col>
        {adminMode && (
          <Grid.Col offset={6} span={6} order={{ base: 7 }}>
            <PlayerInputSection
              players={players}
              onChangeName={(playerIdx, name) => {
                updatePlayerName(playerIdx, name);
              }}
            />
            <Button mt="lg" onClick={syncDraft} loading={syncing}>
              Save
            </Button>
          </Grid.Col>
        )}
      </Grid>
    </>
  );
}
