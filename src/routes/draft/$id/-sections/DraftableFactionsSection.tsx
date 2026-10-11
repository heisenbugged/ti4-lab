import { factions as allFactions } from "~/data/factionData";
import { DraftableFaction } from "../-components/DraftableFaction";
import { PlayerChip } from "../-components/PlayerChip";
import { useDraft } from "~/draftStore";
import { useHydratedDraft } from "~/hooks/useHydratedDraft";
import { useSyncDraft } from "~/hooks/useSyncDraft";
import { FactionId, PlayerId } from "~/types";
import { Card, SectionHeader, Text } from "~/ui";
import { playerColorOf } from "../-components/draftOrderUtils";
import { usePendingPick } from "../-components/pendingPick";
import classes from "../-components/DraftLayout.module.css";

export function DraftableFactionsSection() {
  const playerFactionPool = useDraft((state) => state.draft.playerFactionPool);
  const factions = useDraft((state) => state.draft.availableFactions);
  const { hydratedPlayers, currentlyPicking, activePlayer } = useHydratedDraft();

  const taken = factions.filter((f) =>
    hydratedPlayers.some((p) => p.faction === f || p.minorFaction === f),
  ).length;
  const canSelect =
    currentlyPicking && !!activePlayer && activePlayer.faction === undefined;
  const youHave =
    currentlyPicking && activePlayer?.faction
      ? allFactions[activePlayer.faction].name
      : undefined;
  const meta = playerFactionPool
    ? "Each player picks from their own factions."
    : youHave
      ? `You have ${youHave}.`
      : `${factions.length - taken} of ${factions.length} open.${canSelect ? " Select one." : ""}`;

  return (
    <section className={classes.sec}>
      <SectionHeader title="Factions" meta={meta} />
      {!!playerFactionPool && (
        <GroupedFactionSelection playerFactionPools={playerFactionPool} />
      )}
      {!playerFactionPool && <PoolFactionSelection />}
    </section>
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
  const { select, isPending } = usePendingPick();

  const { syncDraft } = useSyncDraft();
  const canSelect =
    currentlyPicking && !!activePlayer && activePlayer.faction === undefined;
  const canSelectMinor =
    currentlyPicking &&
    !!activePlayer &&
    activePlayer.minorFaction === undefined;

  return (
    <div className={classes.factions}>
      {factions.map((factionId) => {
        const player = hydratedPlayers.find(
          (p) => p.faction === factionId || p.minorFaction === factionId,
        );
        const name = allFactions[factionId].name;

        return (
          <DraftableFaction
            key={factionId}
            player={player}
            disabled={!!player}
            faction={allFactions[factionId]}
            pending={isPending(`faction-${factionId}`)}
            pendingMinor={isPending(`minor-${factionId}`)}
            onSelect={
              canSelect
                ? () =>
                    select({
                      key: `faction-${factionId}`,
                      label: name,
                      commit: () => {
                        selectFaction(activePlayer.id, factionId);
                        syncDraft();
                      },
                    })
                : undefined
            }
            onSelectMinor={
              canSelectMinor && minorFactionsInSharedPool
                ? () =>
                    select({
                      key: `minor-${factionId}`,
                      label: `${name} as your minor faction`,
                      commit: () => {
                        selectMinorFaction(activePlayer.id, factionId);
                        syncDraft();
                      },
                    })
                : undefined
            }
          />
        );
      })}
    </div>
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
  const { select, isPending } = usePendingPick();
  const canSelect =
    currentlyPicking && !!activePlayer && activePlayer.faction === undefined;

  return (
    <div className={classes.groupPools}>
      {Object.entries(playerFactionPools).map(([playerId, factions]) => {
        const player = hydratedPlayers.find((p) => p.id === Number(playerId))!;
        return (
          <Card
            key={playerId}
            padding={3}
            playerColor={!player.faction ? playerColorOf(player.id) : undefined}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10, minWidth: 0 }}>
              <PlayerChip player={player} size="sm" />
              <Text size="sm" tone="muted">
                {player.faction ? "Picked" : "Choosing from"}
              </Text>
            </div>
            <div className={classes.factions}>
              {factions.map((factionId) => (
                <DraftableFaction
                  key={factionId}
                  player={player.faction === factionId ? player : undefined}
                  disabled={!!player.faction && player.faction !== factionId}
                  faction={allFactions[factionId]}
                  pending={isPending(`faction-${factionId}`)}
                  onSelect={
                    canSelect && player.id === activePlayer.id
                      ? () =>
                          select({
                            key: `faction-${factionId}`,
                            label: allFactions[factionId].name,
                            commit: () => {
                              selectFaction(activePlayer.id, factionId);
                              syncDraft();
                            },
                          })
                      : undefined
                  }
                />
              ))}
            </div>
          </Card>
        );
      })}
    </div>
  );
}
