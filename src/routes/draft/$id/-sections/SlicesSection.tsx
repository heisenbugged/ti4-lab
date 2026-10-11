import { Panel, SectionHeader, cx } from "~/ui";
import { useDraft } from "~/draftStore";
import { DraftableSlice } from "../-components/DraftableSlice";
import { useSyncDraft } from "~/hooks/useSyncDraft";
import { useHydratedDraft } from "~/hooks/useHydratedDraft";
import { useDraftUiSettings } from "~/draftUiSettings";
import { useSortedSlices } from "~/routes/draft/-components/useSortedSlices";
import { SlicesTable } from "~/routes/draft/-components/SlicesTable";
import { useDraftedSlices } from "~/hooks/useDraftedSlices";
import { usePendingPick } from "../-components/pendingPick";
import classes from "../-components/DraftLayout.module.css";
import { playerColorOf, playerLetter } from "../-components/draftOrderUtils";

export function SlicesSection() {
  const slices = useDraft((state) => state.draft.slices);
  const draftGameMode = useDraft((state) => state.draft.settings.draftGameMode);
  const nucleusStyle = useDraft((state) => state.draft.settings.nucleusStyle);

  const { adminMode } = useDraftUiSettings();
  const { selectSlice } = useDraft((state) => state.draftActions);
  const { syncDraft } = useSyncDraft();
  const { activePlayer, hydratedPlayers, currentlyPicking } =
    useHydratedDraft();
  const sortedSlices = useSortedSlices(slices);
  const { select, isPending } = usePendingPick();

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
              id={key}
              slice={slice}
              player={hydratedPlayers.find((p) => p.sliceIdx === idx)}
              modifiable={adminMode}
              selected={isPending(key)}
              onSelect={
                canSelectSlice
                  ? () =>
                      select({
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
    </section>
  );
}

/** Every slice side by side. Always open: it is the main comparison while picking. */
export function SliceSummarySection() {
  const slices = useDraft((state) => state.draft.slices);
  const draftedSlices = useDraftedSlices();
  const { hydratedPlayers } = useHydratedDraft();
  const owners = Object.fromEntries(
    hydratedPlayers
      .filter((p) => p.sliceIdx !== undefined)
      .map((p) => [p.sliceIdx!, { name: p.name, color: playerColorOf(p.id), letter: playerLetter(p.id) }]),
  );
  return (
    <Panel title="Slice summary" flush>
      <SlicesTable slices={slices} draftedSlices={draftedSlices} owners={owners} />
    </Panel>
  );
}
