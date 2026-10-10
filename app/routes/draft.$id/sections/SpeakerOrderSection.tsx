import { SectionHeader } from "~/ui";
import { useDraft } from "~/draftStore";
import { DraftableSpeakerOrder } from "../components/DraftableSpeakerOrder";
import { useHydratedDraft } from "~/hooks/useHydratedDraft";
import { useSyncDraft } from "~/hooks/useSyncDraft";
import { usePendingPick } from "../components/pendingPick";
import classes from "../components/DraftLayout.module.css";

export const playerSpeakerOrder = [
  "Speaker",
  "2nd",
  "3rd",
  "4th",
  "5th",
  "6th",
  "7th",
  "8th",
];

export function SpeakerOrderSection() {
  const { hydratedPlayers, activePlayer, currentlyPicking } =
    useHydratedDraft();
  const { selectSpeakerOrder } = useDraft((state) => state.draftActions);
  const { syncDraft } = useSyncDraft();
  const { toggle, isPending } = usePendingPick();
  const canSelect =
    currentlyPicking &&
    !!activePlayer &&
    activePlayer.speakerOrder === undefined;

  const positions = playerSpeakerOrder.slice(0, hydratedPlayers.length);
  const open = positions.filter(
    (_, idx) => !hydratedPlayers.some((p) => p.speakerOrder === idx),
  ).length;
  const youHave =
    currentlyPicking && activePlayer?.speakerOrder !== undefined
      ? playerSpeakerOrder[activePlayer.speakerOrder]
      : undefined;
  const meta = youHave
    ? `You have ${youHave === "Speaker" ? "speaker" : youHave}.`
    : canSelect
      ? `${open} of ${positions.length} open. Select one.`
      : `${open} of ${positions.length} open.`;

  return (
    <section className={classes.sec}>
      <SectionHeader title="Speaker order" meta={meta} />
      <div className={classes.speakers} style={{ "--n": positions.length } as React.CSSProperties}>
        {positions.map((so, idx) => {
          const player = hydratedPlayers.find((p) => p.speakerOrder === idx);
          const key = `speaker-${idx}`;
          return (
            <DraftableSpeakerOrder
              key={so}
              speakerOrder={so}
              player={player}
              selected={isPending(key)}
              openNote="Open"
              onSelect={() => {
                if (!activePlayer || !canSelect) return;
                toggle({
                  key,
                  label: so === "Speaker" ? "Speaker" : `${so} in speaker order`,
                  commit: () => {
                    selectSpeakerOrder(activePlayer.id, idx);
                    syncDraft();
                  },
                });
              }}
              canSelectSpeakerOrder={canSelect}
            />
          );
        })}
      </div>
    </section>
  );
}
