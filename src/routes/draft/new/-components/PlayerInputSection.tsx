import { IconBrandDiscordFilled, IconPlus, IconX } from "@tabler/icons-react";
import { playerColors } from "~/data/factionData";
import { DiscordData, Player } from "~/types";
import { IconButton, NumberStepper, SectionHeader, Stack, TextInput, playerVar } from "~/ui";
import classes from "./PlayerInputSection.module.css";

type Props = {
  players: Player[];
  discordData?: DiscordData;
  maxPlayers?: number;
  onChangeName: (playerIdx: number, name: string) => void;
  onIncreasePlayers?: () => void;
  onDecreasePlayers?: () => void;
  /** Per-row removal. Omit to hide the remove buttons. */
  onRemovePlayer?: (playerIdx: number) => void;
  /** Shows an "Add player" slot after the last player when provided. */
  onAddPlayer?: () => void;
  /** Hide the built-in header when a parent section supplies its own title. */
  showHeader?: boolean;
};

const placeholderName = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J"];

export function PlayerInputSection({
  players,
  discordData,
  maxPlayers = 8,
  onIncreasePlayers,
  onDecreasePlayers,
  onRemovePlayer,
  onAddPlayer,
  onChangeName,
  showHeader = true,
}: Props) {
  return (
    <Stack gap={3}>
      {showHeader && (
        <SectionHeader title="Players">
          {onIncreasePlayers && onDecreasePlayers && (
            <NumberStepper
              value={players.length}
              label="players"
              decrease={onDecreasePlayers}
              increase={onIncreasePlayers}
              decreaseDisabled={players.length <= 4}
              increaseDisabled={players.length >= maxPlayers}
            />
          )}
        </SectionHeader>
      )}

      <div className={classes.grid}>
        {players.map((player, idx) => {
          const discordPlayer = discordData?.players.find(
            (dp) => dp.playerId === idx,
          );
          const color = playerVar(playerColors[player.id]);
          const label = player.name || `Player ${placeholderName[idx]}`;

          if (discordPlayer?.type === "identified") {
            const name = discordPlayer.nickname ?? discordPlayer.username;
            return (
              <div
                key={idx}
                className={classes.discordPlayer}
                style={{ "--p": color } as React.CSSProperties}
                title={name}
              >
                <i className={classes.accent} />
                <IconBrandDiscordFilled size={16} className={classes.discordIcon} />
                <span className={classes.discordName}>{name}</span>
              </div>
            );
          }

          return (
            <TextInput
              key={idx}
              accent={color}
              value={player.name}
              placeholder={`Player ${placeholderName[idx]}`}
              aria-label={`Player ${placeholderName[idx]} name`}
              onChange={(e) => onChangeName(idx, e.currentTarget.value)}
              className={classes.input}
              right={
                onRemovePlayer && (
                  <IconButton
                    size="sm"
                    label={`Remove ${label}`}
                    onClick={() => onRemovePlayer(idx)}
                  >
                    <IconX />
                  </IconButton>
                )
              }
            />
          );
        })}
        {onAddPlayer && (
          <button
            type="button"
            className={classes.addPlayer}
            onClick={onAddPlayer}
          >
            <IconPlus size={15} aria-hidden />
            Add player
          </button>
        )}
      </div>
    </Stack>
  );
}
