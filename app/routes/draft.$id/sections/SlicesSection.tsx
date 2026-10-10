import { Panel, SectionHeader, cx } from "~/ui";
import { useDraft } from "~/draftStore";
import { DraftableSlice } from "../components/DraftableSlice";
import { useSyncDraft } from "~/hooks/useSyncDraft";
import { useHydratedDraft } from "~/hooks/useHydratedDraft";
import { useSafeOutletContext } from "~/useSafeOutletContext";
import { useSortedSlices } from "~/routes/draft/useSortedSlices";
import { SlicesTable } from "~/routes/draft/SlicesTable";
import { useDraftedSlices } from "~/hooks/useDraftedSlices";
import { usePendingPick } from "../components/pendingPick";
import classes from "../components/DraftLayout.module.css";

export function SlicesSection() {
  const slices = useDraft((state) => state.draft.slices);
  const draftGameMode = useDraft((state) => state.draft.settings.draftGameMode);
  const nucleusStyle = useDraft((state) => state.draft.settings.nucleusStyle);

  const { adminMode } = useSafeOutletContext();
  const { selectSlice } = useDraft((state) => state.draftActions);
  const { syncDraft } = useSyncDraft();
  const { activePlayer, hydratedPlayers, currentlyPicking } =
    useHydratedDraft();
  const sortedSlices = useSortedSlices(slices, []);
  const draftedSlices = useDraftedSlices();
  const { toggle, isPending } = usePendingPick();

  const {
    removeSystemFromSlice,
    openPlanetFinderForSlice,
    updateSliceName,
    randomizeSlice,
    clearSlice,
  } = useDraft((state) => state.actions);

  const canSelectSlice =
    currentlyPicking && !!activePlayer && activePlayer.sliceIdx === undefined;

  const isTwilightsFallFullWidth =
    draftGameMode === "twilightsFall" && !nucleusStyle;

  const taken = hydratedPlayers.filter((p) => p.sliceIdx !== undefined).length;
  const open = slices.length - taken;
  const youHave =
    currentlyPicking && activePlayer?.sliceIdx !== undefined
      ? slices[activePlayer.sliceIdx]?.name
      : undefined;
  const meta = youHave
    ? `You have ${youHave}.`
    : `${open} of ${slices.length} open.${canSelectSlice ? " Select one." : ""}`;

  return (
    <section className={classes.sec}>
      <SectionHeader title="Slices" meta={meta} />

      <div className={cx(classes.slices, isTwilightsFallFullWidth && classes.slicesWide)}>
        {sortedSlices.map(({ slice, idx }) => {
          const key = `slice-${idx}`;
          return (
            <DraftableSlice
              key={idx}
              id={`slice-${idx}`}
              slice={slice}
              player={hydratedPlayers.find((p) => p.sliceIdx === idx)}
              modifiable={adminMode}
              selected={isPending(key)}
              onSelect={
                canSelectSlice
                  ? () =>
                      toggle({
                        key,
                        label: slice.name,
                        commit: () => {
                          selectSlice(activePlayer.id, idx);
                          syncDraft();
                        },
                      })
                  : undefined
              }
              onSelectTile={
                adminMode
                  ? (tile) => openPlanetFinderForSlice(idx, tile.idx)
                  : undefined
              }
              onDeleteTile={
                adminMode
                  ? (tile) => removeSystemFromSlice(idx, tile.idx)
                  : undefined
              }
              onRandomizeSlice={adminMode ? () => randomizeSlice(idx) : undefined}
              onClearSlice={adminMode ? () => clearSlice(idx) : undefined}
              onNameChange={
                adminMode ? (name) => updateSliceName(idx, name) : undefined
              }
            />
          );
        })}
      </div>

      <Panel title="Slice summary" collapsible defaultOpen={false} flush summary="Compare every slice">
        <SlicesTable slices={slices} draftedSlices={draftedSlices} />
      </Panel>
    </section>
  );
}
