import { Group, Table, Text } from "@mantine/core";
import { useMemo } from "react";
import { useDraft } from "~/draftStore";
import { PlayerChip } from "./PlayerChip";
import { factions } from "~/data/factionData";
import {
  MapConfig,
  optimalStatsForSystems,
  systemsInSlice,
  techSpecialtiesForSystems,
  totalStatsForSystems,
} from "~/utils/map";
import { Faction, Player, System } from "~/types";
import { FactionIcon } from "~/components/icons/FactionIcon";
import { PlanetStatsPill } from "~/components/Slice/PlanetStatsPill";
import { SliceFeatures } from "~/components/Slice/SliceFeatures";

export function MidDraftSummary() {
  const draft = useDraft();
  const slices = draft.slices;
  const players = draft.players;

  return (
    <Table>
      <Table.Thead>
        <Table.Tr>
          <Table.Th>Name</Table.Th>
          <Table.Th>Faction</Table.Th>
          <Table.Th>Slice</Table.Th>
          <Table.Th>Speaker Order</Table.Th>
          {draft.draftSpeaker && <Table.Th>Seat</Table.Th>}
          <Table.Th>Optimal Value</Table.Th>
          <Table.Th>Total Value</Table.Th>
          <Table.Th>Features</Table.Th>
        </Table.Tr>
      </Table.Thead>
      <Table.Tbody>
        {players.map((p) => (
          <SummaryRow
            config={draft.config}
            key={p.id}
            player={p}
            slice={p.sliceIdx !== undefined ? slices[p.sliceIdx] : undefined}
            showSeat={draft.draftSpeaker}
          />
        ))}
      </Table.Tbody>
    </Table>
  );
}

type Props = {
  config: MapConfig;
  player: Player;
  slice?: string[];
  showSeat: boolean;
};

function SummaryRow({ player, slice, showSeat }: Props) {
  let faction: Faction | undefined;
  let systems: System[] | undefined;
  let total: { resources: number; influence: number } | undefined;
  let optimal:
    | { resources: number; influence: number; flex: number }
    | undefined;
  let specialties: string[] | undefined;

  if (player.faction) faction = factions[player.faction];
  if (slice) {
    systems = systemsInSlice(slice);
    total = totalStatsForSystems(systems);
    optimal = optimalStatsForSystems(systems);
    specialties = techSpecialtiesForSystems(systems);
  }

  return (
    <Table.Tr>
      <Table.Td>
        <PlayerChip player={player} />
      </Table.Td>
      <Table.Td>
        {faction ? (
          <Group>
            <FactionIcon faction={player.faction!!} style={{ height: 18 }} />
            <Text size="sm" lh={1}>
              {faction.name}
            </Text>
          </Group>
        ) : undefined}
      </Table.Td>
      <Table.Td>
        {player.sliceIdx !== undefined && `${player.sliceIdx + 1}`}
      </Table.Td>
      <Table.Td>
        {player.speakerOrder !== undefined && player.speakerOrder + 1}
      </Table.Td>
      {showSeat && (
        <Table.Td>
          {player.seatIdx !== undefined && player.seatIdx + 1}
        </Table.Td>
      )}
      <Table.Td>
        {optimal && (
          <PlanetStatsPill
            size="sm"
            resources={optimal.resources}
            influence={optimal.influence}
            flex={optimal.flex}
          />
        )}
      </Table.Td>
      <Table.Td>
        {total && (
          <PlanetStatsPill
            size="sm"
            resources={total.resources}
            influence={total.influence}
          />
        )}
      </Table.Td>
      <Table.Td>
        {slice !== undefined && <SliceFeatures slice={slice} />}
      </Table.Td>
    </Table.Tr>
  );
}
