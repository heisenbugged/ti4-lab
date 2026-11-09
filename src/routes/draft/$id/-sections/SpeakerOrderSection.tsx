import { SectionHeader } from "~/ui";
import { useDraft } from "~/draftStore";
import { DraftableSpeakerOrder } from "../-components/DraftableSpeakerOrder";
import { useHydratedDraft } from "~/hooks/useHydratedDraft";
import { useSyncDraft } from "~/hooks/useSyncDraft";
import { usePendingPick } from "../-components/pendingPick";
import { speakerOrdinal } from "../-components/draftOrderUtils";
import classes from "../-components/DraftLayout.module.css";

export function SpeakerOrderSection() {
  const { hydratedPlayers, activePlayer, currentlyPicking } =
    useHydratedDraft();
  const { selectSpeakerOrder } = useDraft((state) => state.draftActions);
  const { syncDraft } = useSyncDraft();
  const { select, isPending } = usePendingPick();
  const canSelect =
    currentlyPicking &&
    !!activePlayer &&
    activePlayer.speakerOrder === undefined;

  const positions = hydratedPlayers.map((_, idx) => speakerOrdinal(idx + 1));
  const youHave =
    currentlyPicking && activePlayer?.speakerOrder !== undefined
      ? speakerOrdinal(activePlayer.speakerOrder + 1)
      : undefined;
  const meta = youHave
    ? `You have ${youHave === "Speaker" ? "speaker" : youHave}.`
    : undefined;

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
              onSelect={() => {
                if (!activePlayer || !canSelect) return;
                select({
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
