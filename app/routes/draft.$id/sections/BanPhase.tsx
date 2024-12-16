import { Box, Grid, SimpleGrid, Stack } from "@mantine/core";
import { CurrentPickBanner } from "../components/CurrentPickBanner";
import { DraftOrderSection } from "./DraftOrderSection";
import { SectionTitle } from "~/components/Section";
import { useDraft } from "~/draftStore";
import { DraftableFaction } from "../components/DraftableFaction";
import { factions as allFactions } from "~/data/factionData";
import { useMemo } from "react";
import { useSyncDraft } from "~/hooks/useSyncDraft";
import { useHydratedDraft } from "~/hooks/useHydratedDraft";

export function BanPhase() {
  const factionPool = useDraft((state) => state.factionPool);
  const { banFaction } = useDraft((state) => state.draftActions);
  const sortedFactionPool = useMemo(() => {
    return [...factionPool].sort((a, b) => {
      const aFaction = allFactions[a];
      const bFaction = allFactions[b];
      return aFaction.name.localeCompare(bFaction.name);
    });
  }, [factionPool]);

  const { syncDraft } = useSyncDraft();

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
            cols={{ base: 1, xs: 2, sm: 3, md: 4, xl: 4, xxl: 8 }}
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
                  faction={allFactions[factionId]}
                  onSelect={
                    currentlyPicking
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
      </Grid>
    </>
  );
}
