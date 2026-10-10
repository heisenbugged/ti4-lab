import { playerColors } from "~/data/factionData";
import { FactionId, HydratedPlayer } from "~/types";
import { Card, PickButton, PlayerColor, PlayerTag, Row, Stack, Text } from "~/ui";
import { ReferenceCardGrid } from "./ReferenceCardGrid";

type Props = {
  pack: FactionId[];
  packIdx: number;
  player?: HydratedPlayer;
  onSelect?: () => void;
};

export function ReferenceCardPack({ pack, packIdx, player, onSelect }: Props) {
  const playerColor = player
    ? (playerColors[player.id] as PlayerColor)
    : undefined;
  const selectable = !!onSelect && !player;

  return (
    <Card
      interactive={selectable}
      playerColor={playerColor}
      padding={4}
      style={{
        cursor: selectable ? "pointer" : "default",
        opacity: player ? 0.5 : 1,
      }}
      onClick={selectable ? onSelect : undefined}
    >
      <Stack gap={3}>
        <Row justify="between" wrap={false}>
          <Text size="sm" weight={600} tone="muted">
            Pack {packIdx + 1}
          </Text>
          {selectable && (
            <PickButton
              onClick={(e) => {
                e.stopPropagation();
                onSelect();
              }}
            />
          )}
          {player && (
            <PlayerTag color={playerColor} name={player.name} size="sm" />
          )}
        </Row>
        <ReferenceCardGrid pack={pack} cols={{ base: 1, sm: 3 }} spacing="xs" />
      </Stack>
    </Card>
  );
}
