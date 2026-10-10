import { AnimatedText } from "~/components/AnimatedText/AnimatedText";
import { Button, PlayerHex, cx } from "~/ui";
import { useDraft } from "~/draftStore";
import { useHydratedDraft } from "~/hooks/useHydratedDraft";
import { HydratedPlayer } from "~/types";
import {
  describeSelection,
  getDraftOrderEntries,
  joinNeeds,
  playerColorOf,
  playerLetter,
} from "./draftOrderUtils";
import { usePendingPick, useHasPendingPickProvider } from "./pendingPick";
import classes from "./CurrentPickBanner.module.css";

type Props = {
  /** Replaces the default heading, e.g. for the ban phase. */
  title?: string;
};

/** What the active player still has to pick in this draft. */
function useStillNeeds(player: HydratedPlayer | undefined) {
  const settings = useDraft((state) => state.draft.settings);
  const minorFactionsInPool = useDraft(
    (state) =>
      !!state.draft.settings.minorFactionsInSharedPool ||
      state.draft.availableMinorFactions !== undefined,
  );
  if (!player) return [];
  const mode = settings.draftGameMode;
  const needs: string[] = [];
  if (player.faction === undefined && mode !== "twilightsFall") needs.push("a faction");
  if (minorFactionsInPool && player.minorFaction === undefined) needs.push("a minor faction");
  if (player.sliceIdx === undefined && mode !== "presetMap" && mode !== "texasStyle") needs.push("a slice");
  if (settings.draftSpeaker && player.speakerOrder === undefined) needs.push("a speaker position");
  if (player.seatIdx === undefined) needs.push("a seat");
  if (settings.draftPlayerColors && player.factionColor === undefined) needs.push("a colour");
  if (mode === "twilightsFall" && player.referenceCardPackIdx === undefined) needs.push("a reference card pack");
  return needs;
}

/**
 * The pick bar: whose pick it is, what just happened, what you have selected and Lock in pick.
 * Sticks under the app header.
 */
export function CurrentPickBanner({ title }: Props) {
  const { activePlayer, hydratedPlayers, currentlyPicking, currentPick } =
    useHydratedDraft();
  const selectedPlayer = useDraft((state) => state.selectedPlayer);
  const selections = useDraft((state) => state.draft.selections);
  const slices = useDraft((state) => state.draft.slices);
  const pickOrder = useDraft((state) => state.draft.pickOrder);
  const { pending, requestLockIn } = usePendingPick();
  const hasProvider = useHasPendingPickProvider();
  const needs = useStillNeeds(activePlayer);

  if (!activePlayer) return null;

  const isYou = activePlayer.id === selectedPlayer;
  const heading =
    title ??
    (isYou
      ? `Your pick, ${activePlayer.name}`
      : currentlyPicking
        ? `Picking for ${activePlayer.name}`
        : `${activePlayer.name} is picking`);

  const lastEvent = describeSelection(
    selections[selections.length - 1],
    { slices },
    hydratedPlayers,
  );
  const entries = getDraftOrderEntries(pickOrder, hydratedPlayers, currentPick);
  const position = entries.findIndex((e) => e.isActive);
  const round =
    position >= 0 ? Math.floor(position / Math.max(1, hydratedPlayers.length)) + 1 : undefined;
  const progress =
    position >= 0
      ? `Round ${round}, pick ${position + 1} of ${entries.length}.`
      : undefined;
  const needLine =
    currentlyPicking && needs.length > 0
      ? `${isYou ? "You still need" : `${activePlayer.name} still needs`} ${joinNeeds(needs)}.`
      : undefined;
  const sub = [lastEvent, progress, needLine].filter(Boolean).join(" ");
  const showLockIn = hasProvider && currentlyPicking;

  return (
    <div
      className={cx(classes.bar, isYou && classes.yours)}
      style={{ "--p": `var(--player-${playerColorOf(activePlayer.id)})` } as React.CSSProperties}
      role="status"
      aria-live="polite"
    >
      <div className={classes.who}>
        <PlayerHex color={playerColorOf(activePlayer.id)} size="lg">
          {playerLetter(activePlayer.id)}
        </PlayerHex>
        <div className={classes.text}>
          <AnimatedText text={heading} className={classes.heading} />
          {sub && <span className={classes.sub}>{sub}</span>}
        </div>
      </div>
      {showLockIn && (
        <div className={classes.sel}>
          <span className={classes.selText}>
            <small>Selected</small>
            <b title={pending?.label}>{pending?.label ?? "Nothing yet"}</b>
          </span>
          <Button variant="primary" disabled={!pending} onClick={requestLockIn}>
            Lock in pick
          </Button>
        </div>
      )}
    </div>
  );
}

/** Phone-only bar at the bottom of the screen with Lock in pick, padded by the safe area. */
export function PickLockBar() {
  const { currentlyPicking } = useHydratedDraft();
  const { pending, requestLockIn } = usePendingPick();
  const hasProvider = useHasPendingPickProvider();
  if (!hasProvider || !currentlyPicking) return null;
  return (
    <div className={classes.bottom}>
      <span className={classes.selText}>
        <small>Selected</small>
        <b title={pending?.label}>{pending?.label ?? "Select something to pick"}</b>
      </span>
      <Button variant="primary" disabled={!pending} onClick={requestLockIn}>
        Lock in pick
      </Button>
    </div>
  );
}
