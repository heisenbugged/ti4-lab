import { Stack, Text, Group, Box, ThemeIcon, Badge } from "@mantine/core";
import { IconCheck } from "@tabler/icons-react";
import { Surface } from "~/ui";
import { factions as allFactions } from "~/data/factionData";
import { HydratedPlayer } from "~/types";
import { FactionIcon } from "~/components/icons/FactionIcon";

interface PlayerSelectionSidebarProps {
  players: HydratedPlayer[];
  pickForAnyone: boolean;
  selectedPlayerId: number | null;
  defaultPlayerId: number | undefined;
  stagingValues: Record<number, string> | undefined;
  onPlayerSelect: (playerId: number) => void;
  onPlayerHover: (playerId: number | null) => void;
  currentPlayerId?: number;
  spectatorMode?: boolean;
}

export function PlayerSelectionSidebar({
  players,
  pickForAnyone,
  selectedPlayerId,
  defaultPlayerId,
  stagingValues,
  onPlayerSelect,
  onPlayerHover,
  currentPlayerId,
  spectatorMode = false,
}: PlayerSelectionSidebarProps) {
  return (
    <Stack gap="md" miw={250}>
      <Text size="lg" fw="bold" ta="center">
        Players to pick
      </Text>
      {players.map((player) => {
        const isReady = stagingValues?.[player.id] !== undefined;
        const isSelected = pickForAnyone
          ? selectedPlayerId === player.id ||
            (selectedPlayerId === null && defaultPlayerId === player.id)
          : currentPlayerId === player.id;
        const faction = player.faction
          ? allFactions[player.faction]
          : undefined;
        const canClick = spectatorMode || pickForAnyone;

        const priorityValueFaction = player.priorityValueFactionId
          ? allFactions[player.priorityValueFactionId]
          : undefined;

        const speakerOrderLabel =
          player.speakerOrder !== undefined
            ? speakerOrderLabels[player.speakerOrder]
            : undefined;

        return (
          <Box key={player.id} pos="relative">
            {speakerOrderLabel && (
              <Badge
                color="blue"
                variant="filled"
                size="sm"
                radius="xl"
                pos="absolute"
                top={-8}
                right={-8}
                style={{ zIndex: 1 }}
              >
                {speakerOrderLabel}
              </Badge>
            )}
            <Surface
              variant={canClick && !isReady ? "interactive" : "card"}
              color={isReady ? "green" : undefined}
              style={{
                cursor: canClick ? "pointer" : "default",
                borderWidth: isSelected ? 2 : undefined,
                borderStyle: isSelected ? "solid" : undefined,
                borderColor: isSelected
                  ? "var(--mantine-color-blue-5)"
                  : undefined,
                borderRadius: 8,
              }}
              onMouseEnter={() => canClick && onPlayerHover(player.id)}
              onMouseLeave={() => onPlayerHover(null)}
              onClick={() => canClick && onPlayerSelect(player.id)}
            >
              <Stack gap="xs" style={{ padding: "10px 12px" }}>
                <Group justify="space-between" align="center" gap="md">
                  <Group gap="sm" align="center" wrap="nowrap">
                    {faction && (
                      <Box
                        component="img"
                        src={faction.iconPath}
                        alt={faction.name}
                        w={32}
                        h={32}
                      />
                    )}
                    <Text size="sm" fw="bold">
                      {player.name}
                    </Text>
                  </Group>
                  {isReady && (
                    <ThemeIcon color="green" radius="xl" size="md">
                      <IconCheck size={16} />
                    </ThemeIcon>
                  )}
                </Group>
                {priorityValueFaction && (
                  <Group gap="xs" align="center">
                    <FactionIcon
                      faction={priorityValueFaction.id}
                      style={{ width: 16, height: 16 }}
                    />
                    <Text size="xs" c="dimmed">
                      Priority {priorityValueFaction.priorityOrder}:{" "}
                      {priorityValueFaction.name}
                    </Text>
                  </Group>
                )}
              </Stack>
            </Surface>
          </Box>
        );
      })}
    </Stack>
  );
}

const speakerOrderLabels = [
  "Speaker",
  "1st",
  "2nd",
  "3rd",
  "4th",
  "5th",
  "6th",
  "7th",
  "8th",
];
