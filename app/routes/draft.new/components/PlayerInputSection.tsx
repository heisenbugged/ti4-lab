import {
  Group,
  Indicator,
  Input,
  Stack,
  Text,
  useMantineTheme,
} from "@mantine/core";
import { IconBrandDiscord, IconBrandDiscordFilled } from "@tabler/icons-react";
import { Section, SectionTitle } from "~/components/Section";
import { playerColors } from "~/data/factionData";
import { Player } from "~/types";

type Props = {
  players: Player[];
  onChangeName: (playerIdx: number, name: string) => void;
};

export function PlayerInputSection({ players, onChangeName }: Props) {
  const { colors } = useMantineTheme();
  return (
    <Section>
      <SectionTitle title="Players" />
      <Group align="flex-start">
        <Stack gap="xs" flex={1}>
          {players.map((player, idx) => (
            <Group key={idx} gap="lg">
              {!player.discordMemberId && (
                <>
                  <Indicator
                    color={playerColors[player.id]}
                    size={18}
                    zIndex={0}
                  />
                  <Input
                    key={idx}
                    flex={1}
                    size="md"
                    value={player.name}
                    placeholder={`Player ${idx + 1}`}
                    onChange={(e) => onChangeName(idx, e.currentTarget.value)}
                  />
                </>
              )}
              {player.discordMemberId && (
                <>
                  <IconBrandDiscordFilled
                    color={colors[playerColors[player.id]][5]}
                  />
                  <Text py="8.5">{player.name}</Text>
                </>
              )}
            </Group>
          ))}
        </Stack>
      </Group>
    </Section>
  );
}
