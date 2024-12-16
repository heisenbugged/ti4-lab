import { Group, Table, Text } from "@mantine/core";
import { useSlice } from "~/components/Slice";
import { PlanetStatsPill } from "~/components/Slice/PlanetStatsPill";
import { SliceFeatures } from "~/components/Slice/SliceFeatures";
import { FactionIcon } from "~/components/icons/FactionIcon";
import { factions } from "~/data/factionData";
import { Slice, HydratedPlayer } from "~/types";
import { PlayerChip } from "./PlayerChip";

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
  const { total, optimal, specialties } = useSlice(slice);
  return (
    <Table.Tr>
      <Table.Td>
        <PlayerChip player={player} />
      </Table.Td>
      <Table.Td>
        <Group>
          <FactionIcon faction={player.faction!} style={{ height: 36 }} />
          <Text>{faction.name}</Text>
        </Group>
      </Table.Td>
      <Table.Td>{player.speakerOrder! + 1}</Table.Td>
      {draftSpeaker && <Table.Td>{player.seatIdx! + 1}</Table.Td>}

      <Table.Td>
        <PlanetStatsPill
          size="sm"
          resources={optimal.resources}
          influence={optimal.influence}
          flex={optimal.flex}
        />
      </Table.Td>
      <Table.Td>
        <PlanetStatsPill
          size="sm"
          resources={total.resources}
          influence={total.influence}
        />
      </Table.Td>
      <Table.Td>
        <SliceFeatures slice={slice} />
      </Table.Td>
      {showPlayerColor && <Table.Td>{player.factionColor}</Table.Td>}
    </Table.Tr>
  );
}
