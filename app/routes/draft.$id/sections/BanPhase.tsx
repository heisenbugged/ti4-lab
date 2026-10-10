import { useMemo, useState } from "react";
import {
  Button,
  Grid,
  Modal,
  PlayerHex,
  SectionHeader,
  Stack,
  Text,
  playerVar,
} from "~/ui";
import { DraftOrderSection } from "./DraftOrderSection";
import { useDraft } from "~/draftStore";
import { DraftableFaction } from "../components/DraftableFaction";
import { factions as allFactions } from "~/data/factionData";
import { useSyncDraft } from "~/hooks/useSyncDraft";
import { useHydratedDraft } from "~/hooks/useHydratedDraft";
import { PlayerInputSection } from "~/routes/draft.new/components/PlayerInputSection";
import { useSafeOutletContext } from "~/useSafeOutletContext";
import { FactionId } from "~/types";
import { PhaseBanner } from "../components/SimultaneousPhaseHeader";
import { playerColorOf, playerLetter } from "../components/draftOrderUtils";
import classes from "./BanPhase.module.css";

export function BanPhase() {
  const { adminMode } = useSafeOutletContext();
  const players = useDraft((state) => state.draft.players);
  const factionPool = useDraft((state) => state.factionPool);
  const numBans = useDraft(
    (state) => state.draft.settings.modifiers?.banFactions?.numFactions ?? 1,
  );
  const { banFaction } = useDraft((state) => state.draftActions);
  const { updatePlayerName } = useDraft((state) => state.actions);
  const [pendingBan, setPendingBan] = useState<FactionId | null>(null);
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
  const canSelect = currentlyPicking && !!activePlayer;
  const bannedCount = hydratedPlayers.reduce(
    (sum, p) => sum + (p.bannedFactions?.length ?? 0),
    0,
  );

  const confirmBan = () => {
    const factionId = pendingBan;
    setPendingBan(null);
    if (!factionId || !canSelect || !activePlayer) return;
    banFaction(activePlayer.id, factionId);
    syncDraft();
  };

  const activeColor = activePlayer ? playerColorOf(activePlayer.id) : undefined;

  return (
    <Stack gap={6} className={classes.page}>
      {activePlayer && (
        <PhaseBanner
          tint={playerVar(activeColor)}
          badge={
            <PlayerHex color={activeColor} size="lg">
              {playerLetter(activePlayer.id)}
            </PlayerHex>
          }
          title={
            canSelect
              ? `Your ban, ${activePlayer.name}`
              : `It's ${activePlayer.name}'s turn to ban`
          }
          description={`Ban phase: each player bans ${numBans === 1 ? "one faction" : `${numBans} factions`} before the draft starts.`}
        />
      )}

      <DraftOrderSection />

      <section>
        <SectionHeader
          title="Ban phase"
          meta={`${bannedCount} of ${players.length * numBans} banned`}
        />
        <Grid minWidth={230} gap={3} className={classes.grid}>
          {sortedFactionPool.map((factionId) => {
            const player = hydratedPlayers.find((p) =>
              p.bannedFactions?.includes(factionId),
            );
            return (
              <DraftableFaction
                key={factionId}
                player={player}
                disabled={!!player}
                selectTitle="Ban"
                faction={allFactions[factionId]}
                onSelect={
                  canSelect && !player
                    ? () => setPendingBan(factionId)
                    : undefined
                }
              />
            );
          })}
        </Grid>
      </section>

      {adminMode && (
        <div className={classes.admin}>
          <PlayerInputSection
            players={players}
            onChangeName={updatePlayerName}
          />
          <div>
            <Button variant="primary" onClick={syncDraft} loading={syncing}>
              Save
            </Button>
          </div>
        </div>
      )}

      <Modal
        opened={pendingBan !== null}
        onClose={() => setPendingBan(null)}
        title={pendingBan ? `Ban ${allFactions[pendingBan].name}?` : undefined}
        size="sm"
        footer={
          <>
            <Button variant="tertiary" onClick={() => setPendingBan(null)}>
              Cancel
            </Button>
            <Button variant="danger" onClick={confirmBan} autoFocus>
              Ban faction
            </Button>
          </>
        }
      >
        <Text size="sm" tone="muted">
          {pendingBan &&
            `Banning faction ${allFactions[pendingBan].name}. It leaves the pool for every player.`}
        </Text>
      </Modal>
    </Stack>
  );
}
