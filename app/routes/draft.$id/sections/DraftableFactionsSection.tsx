import { Badge, Box, Group, SimpleGrid, Stack } from "@mantine/core";
import { factions as allFactions, playerColors } from "~/data/factionData";
import { Section, SectionTitle } from "~/components/Section";
import { DraftableFaction } from "../components/DraftableFaction";
import { useDraft } from "~/draftStore";
import { useHydratedDraft } from "~/hooks/useHydratedDraft";
import { useSyncDraft } from "~/hooks/useSyncDraft";

import classes from "~/components/Surface.module.css";
import { FactionId, PlayerId } from "~/types";

export function DraftableFactionsSection() {
  const playerFactionPool = useDraft((state) => state.draft.playerFactionPool);

  return (
    <Section>
      <SectionTitle title="Available Factions" />
      {!!playerFactionPool && (
        <GroupedFactionSelection playerFactionPools={playerFactionPool} />
      )}
      {!playerFactionPool && <PoolFactionSelection />}
    </Section>
  );
}

function PoolFactionSelection() {
  const factions = useDraft((state) => state.draft.availableFactions);
  const minorFactionsInSharedPool = useDraft(
    (state) => state.draft.settings.minorFactionsInSharedPool,
  );
  const { selectFaction, selectMinorFaction } = useDraft(
    (state) => state.draftActions,
  );
  const { hydratedPlayers, currentlyPicking, activePlayer } =
    useHydratedDraft();

  const { syncDraft } = useSyncDraft();
  const canSelect = currentlyPicking && activePlayer?.faction === undefined;
  const canSelectMinor =
    currentlyPicking && activePlayer?.minorFaction === undefined;

  return (
    <SimpleGrid cols={{ base: 2, sm: 3, md: 4, lg: 3, xl: 4 }}>
      {factions.map((factionId) => {
        const player = hydratedPlayers.find(
          (p) => p.faction === factionId || p.minorFaction === factionId,
        );

        return (
          <DraftableFaction
            key={factionId}
            player={player}
            disabled={!!player}
            faction={allFactions[factionId]}
            onSelect={
              canSelect
                ? () => {
                    if (
                      confirm(
                        `Selecting faction ${allFactions[factionId].name}`,
                      )
                    ) {
                      selectFaction(activePlayer.id, factionId);
                      syncDraft();
                    }
                  }
                : undefined
            }
            onSelectMinor={
              canSelectMinor && minorFactionsInSharedPool
                ? () => {
                    if (
                      confirm(
                        `Selecting minor faction ${allFactions[factionId].name}`,
                      )
                    ) {
                      selectMinorFaction(activePlayer.id, factionId);
                      syncDraft();
                    }
                  }
                : undefined
            }
          />
        );
      })}
    </SimpleGrid>
  );
}

type GroupedFactionSelectionProps = {
  playerFactionPools: Record<PlayerId, FactionId[]>;
};

function GroupedFactionSelection({
  playerFactionPools,
}: GroupedFactionSelectionProps) {
  const { hydratedPlayers, currentlyPicking, activePlayer } =
    useHydratedDraft();
  const { selectFaction } = useDraft((state) => state.draftActions);
  const { syncDraft } = useSyncDraft();
  const canSelect = currentlyPicking && activePlayer?.faction === undefined;

  return Object.entries(playerFactionPools).map(([playerId, factions]) => {
    const player = hydratedPlayers.find((p) => p.id === Number(playerId))!;
    const color = playerColors[player.id];
    return (
      <Stack key={playerId} gap="xs" style={{ position: "relative" }}>
        {!player.faction && (
          <Badge
            color={color}
            size="md"
            style={{ position: "absolute", right: 0 }}
          >
            {player.name}
          </Badge>
        )}

        <Group
          p="md"
          style={{
            borderRadius: "var(--mantine-radius-md)",
          }}
          className={
            !player.faction
              ? `${classes.surface} ${classes.withBorder} ${classes.onlyBg} ${classes[color]}`
              : undefined
          }
        >
          {factions.map((factionId) => {
            return (
              <Box miw="250px" key={factionId}>
                <DraftableFaction
                  key={factionId}
                  player={player.faction === factionId ? player : undefined}
                  disabled={!!player.faction && player.faction !== factionId}
                  faction={allFactions[factionId]}
                  onSelect={
                    canSelect && player.id === activePlayer.id
                      ? () => {
                          if (
                            confirm(
                              `Selecting faction ${allFactions[factionId].name}`,
                            )
                          ) {
                            selectFaction(activePlayer.id, factionId);
                            syncDraft();
                          }
                        }
                      : undefined
                  }
                />
              </Box>
            );
          })}
        </Group>
      </Stack>
    );
  });
}
