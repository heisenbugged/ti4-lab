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
    player?.id !== undefined ? (playerColors[player.id] as PlayerColor) : undefined;

  const hasRegularSelectOnly = onSelect && !onSelectMinor;

  return (
    <SelectableCard
      selected={!!player}
      selectedColor={playerColor}
      hoverable={hasRegularSelectOnly}
      disabled={disabled}
      onSelect={hasRegularSelectOnly ? onSelect : undefined}
      header={
        <>
          <Group
            align="center"
            flex={1}
            style={{
              overflow: "hidden",
              flexWrap: "nowrap",
            }}
            pt={5}
            pb={15}
            px="sm"
          >
            <Flex align="center" w="25px" h="25px">
              <FactionIcon
                faction={faction.id}
                style={{ width: 25, height: 25 }}
              />
            </Flex>
            <Text flex={1} size="14px" ff="heading" fw="bold">
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
