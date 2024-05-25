import { Badge, Group, Table, Text } from "@mantine/core";
import { useSlice } from "~/components/Slice";
import { PlanetStatsPill } from "~/components/Slice/PlanetStatsPill";
import { SliceFeatures } from "~/components/Slice/SliceFeatures";
import { FactionIcon } from "~/components/icons/FactionIcon";
import { factions } from "~/data/factionData";
import { Player } from "~/types";
import { PlayerChip } from "./PlayerChip";

type Props = {
  player: Player;
  systems: string[];
};
export function SummaryRow({ player, systems }: Props) {
  const faction = factions[player.faction!!];
  const { total, optimal, specialties } = useSlice(systems);
  return (
    <Table.Tr>
      <Table.Td>
        <PlayerChip player={player} />
      </Table.Td>
      <Table.Td>
        <Group>
          <FactionIcon faction={player.faction!!} style={{ height: 36 }} />
          <Text>{faction.name}</Text>
        </Group>
      </Table.Td>
      <Table.Td>{player.speakerOrder!! + 1}</Table.Td>
      <Table.Td>{player.seatIdx!! + 1}</Table.Td>
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
        <SliceFeatures slice={systems} />
      </Table.Td>
    </Table.Tr>
  );
}
