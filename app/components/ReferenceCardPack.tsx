import { Badge, Button, Group, SimpleGrid, Stack, Text } from "@mantine/core";
import { factions as allFactions, playerColors } from "~/data/factionData";
import { FactionId, HydratedPlayer } from "~/types";
import { PlayerColor, Surface } from "~/ui";
import { NewDraftReferenceCard } from "~/routes/draft.new/components/NewDraftReferenceCard";

type Props = {
  pack: FactionId[];
  packIdx: number;
  player?: HydratedPlayer;
  onSelect?: () => void;
};

export function ReferenceCardPack({ pack, packIdx, player, onSelect }: Props) {
  const sortedPack = [...pack].sort((a, b) => {
    const factionA = allFactions[a];
    const factionB = allFactions[b];
    const priorityA = factionA.priorityOrder ?? 999;
    const priorityB = factionB.priorityOrder ?? 999;
    return priorityA - priorityB;
  });

  const playerColor = player
    ? (playerColors[player.id] as PlayerColor)
    : undefined;

  const variant = onSelect && !player ? "interactive" : "card";

  return (
    <Surface
      variant={variant}
      color={player ? playerColor : undefined}
      style={{
        cursor: onSelect ? "pointer" : "default",
        opacity: player ? 0.5 : 1,
      }}
      onClick={onSelect && !player ? onSelect : undefined}
    >
      <Stack gap="xs" p="md">
        <Group justify="space-between" align="center">
          <Text size="sm" fw="bold" c="dimmed">
            Pack {packIdx + 1}
          </Text>
          {!player && onSelect && (
            <Button
              lh={1}
              py={6}
              px={10}
              h="auto"
              onMouseDown={onSelect}
              variant="filled"
              size="sm"
            >
              Select
            </Button>
          )}
          {player && (
            <Badge color={playerColor} size="md">
              {player.name}
            </Badge>
          )}
        </Group>
        <SimpleGrid cols={{ base: 1, sm: 3 }} spacing="xs">
          {sortedPack.map((factionId) => {
            const faction = allFactions[factionId];
            return <NewDraftReferenceCard key={factionId} faction={faction} />;
          })}
        </SimpleGrid>
      </Stack>
    </Surface>
  );
}
