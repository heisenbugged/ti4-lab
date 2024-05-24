import { Group, Input, Stack } from "@mantine/core";
import { Section, SectionTitle } from "~/components/Section";
import { Player } from "~/types";

type Props = {
  players: Player[];
  onChangeName: (playerIdx: number, name: string) => void;
};

export function PlayerInputSection({ players, onChangeName }: Props) {
  return (
    <Section>
      <SectionTitle title="Player Names" />
      <Stack>
        {players.map((player, idx) => (
          <Group key={idx}>
            <img src={`/avatar/avatar${idx}.png`} style={{ width: 60 }} />
            <Input
              key={idx}
              flex={1}
              size="lg"
              value={player.name}
              placeholder={`Player ${idx + 1}`}
              onChange={(e) => onChangeName(idx, e.currentTarget.value)}
            />
          </Group>
        ))}
      </Stack>
    </Section>
  );
}
