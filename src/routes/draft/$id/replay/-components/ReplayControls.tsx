import { Button, PlayerTag, Progress } from "~/ui";
import classes from "./ReplayControls.module.css";
import { playerColorOf, playerLetter } from "~/routes/draft/$id/-components/draftOrderUtils";
import {
  IconPlayerSkipBack,
  IconPlayerTrackPrev,
  IconPlayerTrackNext,
  IconPlayerSkipForward,
} from "@tabler/icons-react";
import { useDraft } from "~/draftStore";
import { useHydratedDraft } from "~/hooks/useHydratedDraft";
import { factions } from "~/data/factionData";
import { DraftSelection, Player } from "~/types";

function getSelectionPlayer(
  selection: DraftSelection,
  players: Player[],
): Player | undefined {
  if (!("playerId" in selection)) return undefined;
  return players.find((p) => p.id === selection.playerId);
}

export function ReplayControls() {
  const replaySelections = useDraft((state) => state.replaySelections);
  const replayIndex = useDraft((state) => state.replayIndex);
  const replayActions = useDraft((state) => state.replayActions);
  const draft = useDraft((state) => state.draft);
  const { activePlayer } = useHydratedDraft();

  const totalPicks = replaySelections?.length ?? 0;
  const currentPick = replayIndex ?? 0;
  const progress = totalPicks > 0 ? (currentPick / totalPicks) * 100 : 0;

  const canGoBack = currentPick > 0;
  const canGoForward = currentPick < totalPicks;

  const getCurrentPickDescription = () => {
    if (currentPick === 0) return "Draft start";
    if (currentPick >= totalPicks) return "Draft complete";
    if (!replaySelections) return "Loading…";

    const selection = replaySelections[currentPick - 1];
    const player = getSelectionPlayer(selection, draft.players);

    switch (selection.type) {
      case "SELECT_FACTION": {
        const faction = factions[selection.factionId];
        return `${player?.name} selected ${faction.name}`;
      }
      case "SELECT_SLICE": {
        const slice = draft.slices[selection.sliceIdx];
        return `${player?.name} selected ${slice.name}`;
      }
      case "SELECT_SPEAKER_ORDER":
        return `${player?.name} selected speaker order ${selection.speakerOrder + 1}`;
      case "SELECT_MINOR_FACTION": {
        const faction = factions[selection.minorFactionId];
        return `${player?.name} selected minor faction ${faction.name}`;
      }
      case "SELECT_PLAYER_COLOR":
        return `${player?.name} selected ${selection.color}`;
      case "SELECT_SEAT":
        return `${player?.name} selected seat ${selection.seatIdx + 1}`;
      case "BAN_FACTION": {
        const faction = factions[selection.factionId];
        return `${player?.name} banned ${faction.name}`;
      }
      default:
        return "Unknown action";
    }
  };

  return (
    <div className={classes.bar}>
      <div className={classes.head}>
        <h3 className={classes.title}>Draft replay</h3>
        <span className={classes.count}>
          Pick {currentPick} of {totalPicks}
        </span>
        {activePlayer && (
          <span className={classes.current}>
            <span className={classes.currentLabel}>Current</span>
            <PlayerTag
              size="sm"
              color={playerColorOf(activePlayer.id)}
              letter={playerLetter(activePlayer.id)}
              name={activePlayer.name}
            />
          </span>
        )}
      </div>

      <Progress value={progress} label="Replay progress" size="xs" />

      <div className={classes.row}>
        <p className={classes.step} aria-live="polite">
          {getCurrentPickDescription()}
        </p>
        <div className={classes.buttons}>
          <Button
            size="sm"
            icon={<IconPlayerSkipBack size={16} />}
            onClick={replayActions.jumpToStart}
            disabled={!canGoBack}
          >
            Start
          </Button>
          <Button
            size="sm"
            icon={<IconPlayerTrackPrev size={16} />}
            onClick={replayActions.stepBackward}
            disabled={!canGoBack}
          >
            Back
          </Button>
          <Button
            size="sm"
            iconRight={<IconPlayerTrackNext size={16} />}
            onClick={replayActions.stepForward}
            disabled={!canGoForward}
          >
            Forward
          </Button>
          <Button
            size="sm"
            iconRight={<IconPlayerSkipForward size={16} />}
            onClick={replayActions.jumpToEnd}
            disabled={!canGoForward}
          >
            End
          </Button>
        </div>
      </div>
    </div>
  );
}
