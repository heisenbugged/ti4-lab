import { Group, Indicator, Input, Stack } from "@mantine/core";
import { Section, SectionTitle } from "~/components/Section";
import { playerColors } from "~/data/factionData";
import { Player } from "~/types";

type Props = {
  players: Player[];
  onChangeName: (playerIdx: number, name: string) => void;
};

export function PlayerInputSection({ players, onChangeName }: Props) {
  return (
    <Section>
      <SectionTitle title="Players" />
      <Stack gap="xs">
        {players.map((player, idx) => (
          <Group key={idx}>
            <Input
              key={idx}
              flex={1}
              size="md"
              value={player.name}
              placeholder={`Player ${idx + 1}`}
              onChange={(e) => onChangeName(idx, e.currentTarget.value)}
            />
            <Indicator color={playerColors[player.id]} size={18} zIndex={0} />
          </Group>
        ))}
      </Stack>
    </Section>
  );
}
