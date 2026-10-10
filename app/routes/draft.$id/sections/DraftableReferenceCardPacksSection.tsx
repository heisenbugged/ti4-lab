import { Bracket, SectionHeader } from "~/ui";
import { useDraft } from "~/draftStore";
import { useHydratedDraft } from "~/hooks/useHydratedDraft";
import { useSyncDraft } from "~/hooks/useSyncDraft";
import { ReferenceCardPack } from "~/components/ReferenceCardPack";
import { usePendingPick } from "../components/pendingPick";
import classes from "../components/DraftLayout.module.css";

export function DraftableReferenceCardPacksSection() {
  const draftGameMode = useDraft(
    (state) => state.draft.settings.draftGameMode,
  );
  const referenceCardPacks = useDraft(
    (state) => state.draft.availableReferenceCardPacks,
  );
  const { selectReferenceCardPack } = useDraft((state) => state.draftActions);
  const { hydratedPlayers, currentlyPicking, activePlayer } =
    useHydratedDraft();
  const { select, isPending } = usePendingPick();

  const { syncDraft } = useSyncDraft();
  const canSelect =
    currentlyPicking &&
    !!activePlayer &&
    activePlayer.referenceCardPackIdx === undefined;

  if (
    draftGameMode !== "twilightsFall" ||
    !referenceCardPacks ||
    referenceCardPacks.length === 0
  ) {
    return null;
  }
  const taken = hydratedPlayers.filter(
    (p) => p.referenceCardPackIdx !== undefined,
  ).length;

  return (
    <section className={classes.sec}>
      <SectionHeader
        title="Faction reference card packs"
        meta={`${referenceCardPacks.length - taken} of ${referenceCardPacks.length} open.${canSelect ? " Select one." : ""}`}
      />
      <div className={classes.packs}>
        {referenceCardPacks.map((pack, packIdx) => {
          const player = hydratedPlayers.find(
            (p) => p.referenceCardPackIdx === packIdx,
          );

          return (
            <Bracket key={packIdx} active={isPending(`pack-${packIdx}`)}>
              <ReferenceCardPack
                pack={pack}
                packIdx={packIdx}
                player={player}
                onSelect={
                  canSelect
                    ? () =>
                        select({
                          key: `pack-${packIdx}`,
                          label: `Reference card pack ${packIdx + 1}`,
                          commit: () => {
                            selectReferenceCardPack(activePlayer.id, packIdx);
                            syncDraft();
                          },
                        })
                    : undefined
                }
              />
            </Bracket>
          );
        })}
      </div>
    </section>
  );
}
