import { useDraft } from "~/draftStore";
import { useHydratedDraft } from "~/hooks/useHydratedDraft";
import { useSyncDraft } from "~/hooks/useSyncDraft";
import { PlayerChipOrSelect } from "../components/PlayerChipOrSelect";
import { SectionHeader, SelectableCard } from "~/ui";
import { playerColorOf } from "../components/draftOrderUtils";
import { usePendingPick } from "../components/pendingPick";
import classes from "../components/DraftLayout.module.css";

const colors = [
  "Green",
  "Blue",
  "Yellow",
  "Red",
  "Purple",
  "Black",
  "Orange",
  "Magenta",
] as const;

export function DraftablePlayerColorsSection() {
  const draftPlayerColors = useDraft(
    (state) => state.draft.settings.draftPlayerColors,
  );
  const { selectPlayerColor } = useDraft((state) => state.draftActions);
  const { hydratedPlayers, currentlyPicking, activePlayer } =
    useHydratedDraft();
  const { select, isPending } = usePendingPick();

  const { syncDraft } = useSyncDraft();
  const canSelect =
    currentlyPicking &&
    !!activePlayer &&
    activePlayer.factionColor === undefined;

  if (!draftPlayerColors) return null;
  const taken = hydratedPlayers.filter((p) => p.factionColor).length;
  return (
    <section className={classes.sec}>
      <SectionHeader
        title="In-game colour"
        meta={`${colors.length - taken} of ${colors.length} open.${canSelect ? " Select one." : ""}`}
      />
      <div className={classes.colors}>
        {colors.map((color) => {
          const player = hydratedPlayers.find((p) => p.factionColor === color);
          const key = `color-${color}`;

          const handleSelect = canSelect
            ? () =>
                select({
                  key,
                  label: `${color} plastic`,
                  commit: () => {
                    selectPlayerColor(activePlayer.id, color);
                    syncDraft();
                  },
                })
            : undefined;

          return (
            <SelectableCard
              key={color}
              selected={!!player}
              selectedColor={player ? playerColorOf(player.id) : undefined}
              pending={isPending(key)}
              onSelect={!player ? handleSelect : undefined}
              header={
                <>
                  <span style={{ flex: 1, minWidth: 0, fontWeight: 600, fontSize: 15 }}>{color}</span>
                  <PlayerChipOrSelect
                    player={player}
                    selected={isPending(key)}
                    onSelect={handleSelect}
                  />
                </>
              }
            />
          );
        })}
      </div>
    </section>
  );
}
