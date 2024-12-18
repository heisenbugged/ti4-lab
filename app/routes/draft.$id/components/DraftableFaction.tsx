import { Box, Button, Flex, Group, Modal, Stack, Text } from "@mantine/core";
import { FactionIcon } from "~/components/icons/FactionIcon";
import { Faction, HydratedPlayer } from "~/types";
import { PlayerChipOrSelect } from "./PlayerChipOrSelect";
import { IconEye } from "@tabler/icons-react";
import { useDisclosure } from "@mantine/hooks";

import classes from "~/components/Surface.module.css";
import { playerColors } from "~/data/factionData";

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
  const [opened, { open, close }] = useDisclosure();
  const playerColor =
    player?.id !== undefined ? playerColors[player.id] : undefined;

  const hasRegularSelectOnly = onSelect && !onSelectMinor;

  return (
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
      }}
      onClick={hasRegularSelectOnly && !opened ? onSelect : undefined}
    >
      <Modal
        opened={opened}
        onClose={close}
        size="100%"
        title={faction.name}
        centered
      >
        <img
          src={`/factioncards/${faction.id}.png`}
          style={{
            objectFit: "contain",
            maxHeight: 500,
            maxWidth: "100%",
            margin: "auto",
            display: "block",
          }}
        />
      </Modal>
      <Group
        align="center"
        flex={1}
        style={{
          overflow: "hidden",
          flexWrap: "nowrap",
        }}
        pt={5}
      >
        <Flex align="center" w="25px" h="25px">
          <FactionIcon faction={faction.id} style={{ width: 25, height: 25 }} />
        </Flex>
        <Text flex={1} size="14px" ff="heading" fw="bold">
          {faction.name}
        </Text>
      </Group>

      <Box style={{ alignSelf: "flex-start" }}>
        <Button
          size="compact-xs"
          w="auto"
          variant="subtle"
          leftSection={<IconEye size={16} />}
          onMouseDown={open}
        >
          Info
        </Button>
      </Box>
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
  );
}
