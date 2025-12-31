import { Flex, Group, Text } from "@mantine/core";
import { FactionIcon } from "~/components/icons/FactionIcon";
import { Faction, HydratedPlayer } from "~/types";
import { PlayerChipOrSelect } from "./PlayerChipOrSelect";

import { playerColors } from "~/data/factionData";
import { FactionHelpInfo } from "~/routes/draft.$id/components/FactionHelpInfo";
import { SelectableCard, PlayerColor } from "~/ui";

type Props = {
  faction: Faction;
  player?: HydratedPlayer;
  disabled?: boolean;
  selectTitle?: string;
  onSelect?: () => void;
  onSelectMinor?: () => void;
};

export function DraftableFaction({
  selectTitle,
  faction,
  player,
  disabled = false,
  onSelect,
  onSelectMinor,
}: Props) {
  const playerColor =
    player?.id !== undefined
      ? (playerColors[player.id] as PlayerColor)
      : undefined;

  const hasRegularSelectOnly = onSelect && !onSelectMinor;
  const isAlreadySelected = !!player;

  return (
    <SelectableCard
      selected={isAlreadySelected}
      selectedColor={playerColor}
      hoverable={hasRegularSelectOnly && !isAlreadySelected}
      disabled={disabled}
      onSelect={
        hasRegularSelectOnly && !isAlreadySelected ? onSelect : undefined
      }
      header={
        <>
          <Group
            align="center"
            flex={1}
            style={{
              overflow: "hidden",
              flexWrap: "nowrap",
            }}
            py="sm"
            px="sm"
            gap="sm"
          >
            <Flex
              align="center"
              justify="center"
              w="28px"
              h="28px"
              style={{ flexShrink: 0 }}
            >
              <FactionIcon
                faction={faction.id}
                style={{ width: 28, height: 28 }}
              />
            </Flex>
            <Text
              flex={1}
              size="sm"
              ff="heading"
              fw={600}
              style={{
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {faction.name}
            </Text>
          </Group>

          <PlayerChipOrSelect
            player={player}
            selectTitle={selectTitle}
            onSelect={
              onSelect
                ? (e) => {
                    e.preventDefault();
                    onSelect();
                  }
                : undefined
            }
            onSelectMinor={onSelectMinor}
            disabled={disabled}
            isMinor={player?.minorFaction === faction.id}
          />
        </>
      }
      body={<FactionHelpInfo faction={faction} />}
    />
  );
}
