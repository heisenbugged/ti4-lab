import { Box, Flex, Group, Stack, Text } from "@mantine/core";
import { FactionIcon } from "~/components/icons/FactionIcon";
import { Faction, HydratedPlayer } from "~/types";
import { PlayerChipOrSelect } from "./PlayerChipOrSelect";

import classes from "~/components/Surface.module.css";
import { playerColors } from "~/data/factionData";
import { FactionHelpInfo } from "~/routes/draft.$id/components/FactionHelpInfo";

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
    player?.id !== undefined ? playerColors[player.id] : undefined;

  const hasRegularSelectOnly = onSelect && !onSelectMinor;

  return (
    <Stack gap={0}>
      <Stack
        gap={4}
        px="sm"
        py={8}
        pb={4}
        className={`${classes.surface} ${classes.withBorder} ${hasRegularSelectOnly ? classes.hoverable : ""} ${playerColor ? classes[playerColor] : ""}`}
        style={{
          borderRadius: "var(--mantine-radius-md)",
          cursor: "pointer",
          position: "relative",
          opacity: disabled ? 0.5 : 1,
          borderBottomLeftRadius: 0,
          borderBottomRightRadius: 0,
        }}
        onClick={hasRegularSelectOnly ? onSelect : undefined}
      >
        <Group
          align="center"
          flex={1}
          style={{
            overflow: "hidden",
            flexWrap: "nowrap",
          }}
          pt={5}
          pb={15}
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
      </Stack>
      <Box
        style={{
          borderRadius: "0 0 var(--mantine-radius-md) var(--mantine-radius-md)",
          borderTop: 0,
        }}
        className={`${classes.surface} ${classes.withBorder}`}
      >
        <FactionHelpInfo faction={faction} />
      </Box>
    </Stack>
  );
}
