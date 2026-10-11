import { IconEye } from "@tabler/icons-react";
import { useState } from "react";
import { Button, Heading, PlayerHex, Text, cx } from "~/ui";
import { useDraft } from "~/draftStore";
import { useHydratedDraft } from "~/hooks/useHydratedDraft";
import { playerColorOf, playerLetter } from "./draftOrderUtils";
import classes from "./PlayerSelectionScreen.module.css";

type Props = {
  onDraftJoined: (playerId: number) => void;
};

const SPECTATOR_ID = -1;

/** "Who are you?" Pick your name (or watch as a spectator) to join the draft. */
export function PlayerSelectionScreen({ onDraftJoined }: Props) {
  const { hydratedPlayers } = useHydratedDraft();
  const draftUrl = useDraft((state) => state.draftUrl);

  const [selectedPlayer, setSelectedPlayer] = useState<number | undefined>(
    undefined,
  );

  const join = () =>
    selectedPlayer !== undefined && onDraftJoined(selectedPlayer);

  return (
    <div className={classes.screen}>
      <div className={classes.inner}>
        <div className={classes.head}>
          <Heading variant="title">Who are you?</Heading>
          <Text size="sm" tone="muted" align="center">
            Pick your name to join {draftUrl ? <b className={classes.draftName}>{draftUrl}</b> : "the draft"}.
          </Text>
        </div>
        <div className={classes.list} role="radiogroup" aria-label="Players">
          {hydratedPlayers.map((player) => (
            <button
              key={player.id}
              type="button"
              role="radio"
              aria-checked={selectedPlayer === player.id}
              className={cx(classes.option, selectedPlayer === player.id && classes.selected)}
              style={{ "--p": `var(--player-${playerColorOf(player.id)})` } as React.CSSProperties}
              onMouseDown={() => setSelectedPlayer(player.id)}
              onClick={() => setSelectedPlayer(player.id)}
              onDoubleClick={() => onDraftJoined(player.id)}
            >
              <PlayerHex color={playerColorOf(player.id)} size="md">
                {playerLetter(player.id)}
              </PlayerHex>
              <span className={classes.name}>{player.name}</span>
            </button>
          ))}
          <button
            type="button"
            role="radio"
            aria-checked={selectedPlayer === SPECTATOR_ID}
            className={cx(classes.option, classes.spectator, selectedPlayer === SPECTATOR_ID && classes.selected)}
            onMouseDown={() => setSelectedPlayer(SPECTATOR_ID)}
            onClick={() => setSelectedPlayer(SPECTATOR_ID)}
          >
            <IconEye size={20} />
            <span className={classes.name}>Watch as a spectator</span>
          </button>
        </div>
        <div className={classes.actions}>
          <Button
            variant="primary"
            size="lg"
            block
            disabled={selectedPlayer === undefined}
            onClick={join}
          >
            Join draft
          </Button>
        </div>
      </div>
    </div>
  );
}
