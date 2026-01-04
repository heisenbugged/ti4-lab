import {
  Box,
  Button,
  Group,
  SimpleGrid,
  Stack,
  Text,
  TextInput,
  useMantineTheme,
} from "@mantine/core";
import { IconBrandDiscordFilled } from "@tabler/icons-react";
import { playerColors } from "~/data/factionData";
import { DiscordData, Player } from "~/types";

type Props = {
  players: Player[];
  discordData?: DiscordData;
  maxPlayers?: number;
  onChangeName: (playerIdx: number, name: string) => void;
  onIncreasePlayers?: () => void;
  onDecreasePlayers?: () => void;
  forcePlayerCount?: number;
  disabledTooltip?: string;
};

const placeholderName = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J"];

export function PlayerInputSection({
  players,
  discordData,
  maxPlayers = 8,
  onIncreasePlayers,
  onDecreasePlayers,
  onChangeName,
  forcePlayerCount,
  disabledTooltip,
}: Props) {
  const { colors } = useMantineTheme();

  return (
    <Stack gap="xs">
      {/* Header */}
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

      {/* Player Grid */}
      <SimpleGrid cols={{ base: 1, xs: 2 }} spacing="xs" verticalSpacing={6}>
        {players.map((player, idx) => {
          const discordPlayer = discordData?.players.find(
            (dp) => dp.playerId === idx,
          );
          const color = playerColors[player.id];

          return (
            <Group key={idx} gap="xs" wrap="nowrap">
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
      </SimpleGrid>
    </Stack>
  );
}
