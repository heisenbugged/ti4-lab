import {
  Group,
  Indicator,
  Input,
  Stack,
  Text,
  useMantineTheme,
} from "@mantine/core";
import { IconBrandDiscordFilled } from "@tabler/icons-react";
import { NumberStepper } from "~/components/NumberStepper";
import { Section, SectionTitle } from "~/components/Section";
import { playerColors } from "~/data/factionData";
import { DiscordData, Player } from "~/types";

type Props = {
  players: Player[];
  discordData?: DiscordData;
  maxPlayers?: number;
  onChangeName: (playerIdx: number, name: string) => void;
  onIncreasePlayers?: () => void;
  onDecreasePlayers?: () => void;
};

const placeholderName = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J"];

export function PlayerInputSection({
  players,
  discordData,
  maxPlayers = 8,
  onIncreasePlayers,
  onDecreasePlayers,
  onChangeName,
}: Props) {
  const { colors } = useMantineTheme();
  return (
    <Section>
      <SectionTitle title="Players">
        {onIncreasePlayers && onDecreasePlayers && (
          <NumberStepper
            value={players.length}
            decrease={onDecreasePlayers}
            increase={onIncreasePlayers}
            decreaseDisabled={players.length <= 4}
            increaseDisabled={players.length >= maxPlayers}
          />
        )}
      </SectionTitle>
      <Group align="flex-start">
        <Stack gap="xs" flex={1}>
          {players.map((player, idx) => {
            const discordPlayer = discordData?.players.find(
              (discordPlayer) => discordPlayer.playerId === idx,
            );

            return (
              <Group key={idx} gap="lg">
                {discordPlayer?.type !== "identified" && (
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
                      placeholder={`Player ${placeholderName[idx]}`}
                      onChange={(e) => onChangeName(idx, e.currentTarget.value)}
                    />
                  </>
                )}
                {discordPlayer?.type === "identified" && (
                  <>
                    <IconBrandDiscordFilled
                      color={
                        colors[playerColors[player.id]]?.[5] ||
                        colors.blue?.[5] ||
                        "#228be6"
                      }
                    />
                    <Text py="8.5">
                      {discordPlayer.nickname ?? discordPlayer.username}
                    </Text>
                  </>
                )}
              </Group>
            );
          })}
        </Stack>
      </Group>
    </Section>
  );
}
