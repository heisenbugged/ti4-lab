import { AnimatedText } from "~/components/AnimatedText/AnimatedText";
import { PlayerHex, cx } from "~/ui";
import { PickToken, SelectionToken, type PickKind } from "./PickToken";
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
import classes from "./CurrentPickBanner.module.css";

type Need = { kind: PickKind; label: string; phrase: string };

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
  const needs: Need[] = [];
  if (player.faction === undefined && mode !== "twilightsFall") needs.push({ kind: "faction", label: "Faction", phrase: "a faction" });
  if (minorFactionsInPool && player.minorFaction === undefined) needs.push({ kind: "minor", label: "Minor", phrase: "a minor faction" });
  if (player.sliceIdx === undefined && mode !== "presetMap" && mode !== "texasStyle") needs.push({ kind: "slice", label: "Slice", phrase: "a slice" });
  if (settings.draftSpeaker && player.speakerOrder === undefined) needs.push({ kind: "speaker", label: "Speaker", phrase: "a speaker position" });
  if (player.seatIdx === undefined) needs.push({ kind: "seat", label: "Seat", phrase: "a seat" });
  if (settings.draftPlayerColors && player.factionColor === undefined) needs.push({ kind: "color", label: "Colour", phrase: "a colour" });
  if (mode === "twilightsFall" && player.referenceCardPackIdx === undefined) needs.push({ kind: "pack", label: "Pack", phrase: "a reference card pack" });
  return needs;
}

/**
 * The pick bar: whose pick it is and what just happened. Picking happens from each Select (it opens a confirmation).
 * Sticks under the app header.
 */
export function CurrentPickBanner() {
  const { activePlayer, hydratedPlayers, currentlyPicking, currentPick } =
    useHydratedDraft();
  const selectedPlayer = useDraft((state) => state.selectedPlayer);
  const selections = useDraft((state) => state.draft.selections);
  const slices = useDraft((state) => state.draft.slices);
  const pickOrder = useDraft((state) => state.draft.pickOrder);
  const needs = useStillNeeds(activePlayer);

  if (!activePlayer) return null;

  const isYou = activePlayer.id === selectedPlayer;
  const heading = isYou
    ? `Your pick, ${activePlayer.name}`
    : currentlyPicking
      ? `Picking for ${activePlayer.name}`
      : `${activePlayer.name} is picking`;

  const lastSelection = selections[selections.length - 1];
  const lastEvent = describeSelection(lastSelection, { slices }, hydratedPlayers);
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
      ? `${isYou ? "You still need" : `${activePlayer.name} still needs`} ${joinNeeds(needs.map((n) => n.phrase))}.`
      : undefined;
  // Full sentence for screen readers; sighted users get the scannable meta row below.
  const sub = [lastEvent, progress, needLine].filter(Boolean).join(" ");
  const lastPlayer =
    lastSelection && "playerId" in lastSelection
      ? hydratedPlayers.find((p) => p.id === lastSelection.playerId)
      : undefined;

  return (
    <div
      className={cx(classes.bar, isYou && classes.yours)}
      style={{ "--p": `var(--player-${playerColorOf(activePlayer.id)})` } as React.CSSProperties}
      role="status"
      aria-live="polite"
    >
      {/* Re-keyed per turn so the splash sweeps in again for the next player. */}
      <span key={`${activePlayer.id}-${currentPick}`} className={classes.wash} aria-hidden />
      <div className={classes.who}>
        <PlayerHex color={playerColorOf(activePlayer.id)} size="lg">
          {playerLetter(activePlayer.id)}
        </PlayerHex>
        <div className={classes.text}>
          <AnimatedText text={heading} className={classes.heading} />
          {sub && <span className="visually-hidden">{sub}</span>}
          <div className={classes.meta} aria-hidden>
            {lastPlayer && (
              <span className={classes.item}>
                <span className={classes.label}>Last</span>
                <span className={classes.byline}>
                  <i style={{ "--p": `var(--player-${playerColorOf(lastPlayer.id)})` } as React.CSSProperties} />
                  {lastPlayer.name}
                </span>
                <SelectionToken selection={lastSelection} draft={{ slices }} />
              </span>
            )}
            {position >= 0 && (
              <span className={classes.item}>
                <span className={classes.label}>Round {round}</span>
                <span className={classes.track}>
                  <i style={{ width: `${((position + 1) / Math.max(1, entries.length)) * 100}%` }} />
                </span>
                <span className={classes.count}>
                  {position + 1}/{entries.length}
                </span>
              </span>
            )}
            {currentlyPicking && needs.length > 0 && (
              <span className={classes.item}>
                <span className={classes.label}>{isYou ? "You need" : "Needs"}</span>
                {needs.map((n) => (
                  <PickToken key={n.kind} kind={n.kind} label={n.label} variant="chip" className={classes.need} />
                ))}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
