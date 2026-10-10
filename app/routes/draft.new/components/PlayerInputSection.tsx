import {
  ActionIcon,
  Box,
  Button,
  Group,
  Stack,
  Text,
  TextInput,
  UnstyledButton,
  useMantineTheme,
} from "@mantine/core";
import { IconBrandDiscordFilled, IconPlus, IconX } from "@tabler/icons-react";
import { playerColors } from "~/data/factionData";
import { DiscordData, Player } from "~/types";
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
  const { colors } = useMantineTheme();

  return (
    <Stack gap="xs">
      {/* Header */}
      {showHeader && (
        <Group justify="space-between">
          <Text
            size="sm"
            fw={600}
            tt="uppercase"
            style={{ letterSpacing: "0.05em", fontFamily: "Orbitron" }}
          >
            Players
          </Text>
          {onIncreasePlayers && onDecreasePlayers && (
            <Group gap={2}>
              <Button
                size="compact-xs"
                variant="subtle"
                color="gray"
                disabled={players.length <= 4}
                onMouseDown={onDecreasePlayers}
              >
                -
              </Button>
              <Text size="sm" fw={600} miw={20} ta="center" c="purple.3">
                {players.length}
              </Text>
              <Button
                size="compact-xs"
                variant="subtle"
                color="gray"
                disabled={players.length >= maxPlayers}
                onMouseDown={onIncreasePlayers}
              >
                +
              </Button>
            </Group>
          )}
        </Group>
      )}

      {/* Player Grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns:
            "repeat(auto-fit, minmax(min(100%, 160px), 1fr))",
          gap: "6px 10px",
        }}
      >
        {players.map((player, idx) => {
          const discordPlayer = discordData?.players.find(
            (dp) => dp.playerId === idx,
          );
          const color = playerColors[player.id];

          return (
            <Group
              key={idx}
              gap="xs"
              wrap="nowrap"
              className={classes.playerRow}
            >
              {/* Color accent bar */}
              <Box
                w={3}
                h={28}
                style={{
                  borderRadius: 1,
                  background: `var(--mantine-color-${color}-5)`,
                  flexShrink: 0,
                }}
              />

              {discordPlayer?.type === "identified" ? (
                <Group gap="xs" flex={1} wrap="nowrap">
                  <IconBrandDiscordFilled
                    size={16}
                    color={colors[color]?.[5] || colors.blue?.[5] || "#228be6"}
                  />
                  <Text size="sm" truncate flex={1}>
                    {discordPlayer.nickname ?? discordPlayer.username}
                  </Text>
                </Group>
              ) : (
                <TextInput
                  size="xs"
                  flex={1}
                  value={player.name}
                  placeholder={`Player ${placeholderName[idx]}`}
                  onChange={(e) => onChangeName(idx, e.currentTarget.value)}
                  rightSection={
                    onRemovePlayer && (
                      <ActionIcon
                        size="sm"
                        variant="subtle"
                        color="gray"
                        className={classes.removePlayer}
                        aria-label={`Remove ${player.name || `player ${placeholderName[idx]}`}`}
                        onClick={() => onRemovePlayer(idx)}
                      >
                        <IconX size={14} />
                      </ActionIcon>
                    )
                  }
                  styles={{
                    input: {
                      height: 28,
                    },
                  }}
                />
              )}
            </Group>
          );
        })}
        {onAddPlayer && (
          <Group gap="xs" wrap="nowrap">
            <Box w={3} style={{ flexShrink: 0 }} />
            <UnstyledButton className={classes.addPlayer} onClick={onAddPlayer}>
              <IconPlus size={14} />
              Add player
            </UnstyledButton>
          </Group>
        )}
      </div>
    </Stack>
  );
}
