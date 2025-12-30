import { Group, Table, Text } from "@mantine/core";
import { useSlice } from "~/components/Slice";
import { PlanetStatsPill } from "~/components/Slice/PlanetStatsPill";
import { SliceFeatures } from "~/components/Slice/SliceFeatures";
import { FactionIcon } from "~/components/icons/FactionIcon";
import { factions } from "~/data/factionData";
import { Slice, HydratedPlayer } from "~/types";
import { PlayerChip } from "./PlayerChip";
import { FactionHelpInfo } from "~/routes/draft.$id/components/FactionHelpInfo";

type Props = {
  player: HydratedPlayer;
  slice: Slice;
  draftSpeaker: boolean;
  showPlayerColor: boolean;
};

export function SummaryRow({
  player,
  slice,
  draftSpeaker = false,
  showPlayerColor = false,
}: Props) {
  const faction = factions[player.faction!];
  const { optimal, sliceValue } = useSlice(slice);
  return (
    <Table.Tr>
      <Table.Td>
        <PlayerChip player={player} />
      </Table.Td>
      <Table.Td>
        <Group wrap="nowrap">
          <FactionIcon faction={player.faction!} style={{ height: 36 }} />
          <Text>{faction.name}</Text>
        </Group>
        <Group>
          <FactionHelpInfo faction={faction} />
        </Group>
      </Table.Td>
      <Table.Td>{player.speakerOrder! + 1}</Table.Td>
      {draftSpeaker && <Table.Td>{player.seatIdx! + 1}</Table.Td>}

      <Table.Td>
        <Text fw={700} c="yellow.5">
          {sliceValue % 1 === 0 ? sliceValue : sliceValue.toFixed(1)}
        </Text>
      </Table.Td>
      <Table.Td>
        <Group gap={4}>
          <PlanetStatsPill
            size="sm"
            resources={optimal.resources}
            influence={optimal.influence}
            flex={optimal.flex}
          />
          <Text size="xs" c="dimmed">
            ({optimal.resources + optimal.influence + optimal.flex})
          </Text>
        </Group>
      </Table.Td>
      <Table.Td>
        <SliceFeatures slice={slice} />
      </Table.Td>
      {showPlayerColor && <Table.Td>{player.factionColor}</Table.Td>}
    </Table.Tr>
  );
}
