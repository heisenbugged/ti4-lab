import { factions as allFactions } from "~/data/factionData";
import { DraftableFaction } from "../-components/DraftableFaction";
import { useDraft } from "~/draftStore";
import { useHydratedDraft } from "~/hooks/useHydratedDraft";
import { useSyncDraft } from "~/hooks/useSyncDraft";
import { SectionHeader } from "~/ui";
import { usePendingPick } from "../-components/pendingPick";
import classes from "../-components/DraftLayout.module.css";

export function DraftableMinorFactionsSection() {
  const factions = useDraft((state) => state.draft.availableMinorFactions);
  const { selectMinorFaction } = useDraft((state) => state.draftActions);
  const { hydratedPlayers, currentlyPicking, activePlayer } =
    useHydratedDraft();
  const { select, isPending } = usePendingPick();

  const { syncDraft } = useSyncDraft();
  const canSelect =
    currentlyPicking &&
    !!activePlayer &&
    activePlayer.minorFaction === undefined;

  if (!factions) return null;
  const taken = factions.filter((f) =>
    hydratedPlayers.some((p) => p.minorFaction === f),
  ).length;

  return (
    <section className={classes.sec}>
      <SectionHeader
        title="Minor factions"
        meta={`${factions.length - taken} of ${factions.length} open.${canSelect ? " Select one." : ""}`}
      />
      <div className={classes.factions}>
        {factions.map((factionId) => {
          const player = hydratedPlayers.find(
            (p) => p.minorFaction === factionId,
          );
          const key = `minor-${factionId}`;
          return (
            <DraftableFaction
              key={factionId}
              player={player}
              disabled={!!player}
              faction={allFactions[factionId]}
              pending={isPending(key)}
              onSelect={
                canSelect
                  ? () =>
                      select({
                        key,
                        label: `${allFactions[factionId].name} as your minor faction`,
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
    </section>
  );
}
